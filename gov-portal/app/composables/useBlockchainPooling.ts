interface PollingResult {
    isConfirmed: Ref<boolean>
    stopPolling: () => void
}

export function useBlockchainPolling(
    idRef: Ref<string | null>,
    endpointFactory: (id: string) => string,
    intervalMs: number = 3000
): PollingResult {
    const isConfirmed = ref(false)
    let intervalId: NodeJS.Timeout | null = null

    const clearPolling = (): void => {
        if (intervalId) {
            clearInterval(intervalId)
            intervalId = null
        }
    }

    watch(idRef, (newId: string | null) => {
        clearPolling() 
        if (!newId) {
            isConfirmed.value = false
            return
        }
        
        intervalId = setInterval(async () => {
            try {
                await $fetch(endpointFactory(newId))
                isConfirmed.value = true
                clearPolling() 
            } catch (e) {
                
            }
        }, intervalMs)
    }, { immediate: true })

    onUnmounted(clearPolling)

    return { isConfirmed, stopPolling: clearPolling }
}