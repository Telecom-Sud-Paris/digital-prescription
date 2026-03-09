// app/composables/useSsiVerification.ts
import QRCode from 'qrcode'

export function useSsiVerification() {
  const config = useRuntimeConfig()
  const isVerified = ref(false)
  const verificationUrl = ref('')
  const verificationQrCode = ref('')
  const verificationStateId = ref('')
  const errorMessage = ref('')
  const verifiedData = ref<any>(null) 
  let pollInterval: ReturnType<typeof setInterval> | null = null

  const startVerification = async (credentialType: string, requiredRoleForExtraction?: string) => {
    errorMessage.value = ''
    isVerified.value = false
    verifiedData.value = null
    try {
      const NGROK_URL = config.public.NGROK_URL
      const res = await $fetch('/api/verify/init', {
        method: 'POST',
        body: { credentialType, ngrokUrl: NGROK_URL }
      })
      
      verificationUrl.value = res.url
      verificationStateId.value = res.stateId
      verificationQrCode.value = await QRCode.toDataURL(res.url, { 
        width: 200, margin: 2, color: { dark: '#0f172a', light: '#ffffff' } 
      })

      // Polling
      pollInterval = setInterval(async () => {
        try {
          const statusRes = await $fetch(`/api/verify/status?stateId=${verificationStateId.value}`)
          if (statusRes && statusRes.status === 'success') {
            clearInterval(pollInterval!)
            console.log("webhook payload:", statusRes.data)
            const resultsArray = statusRes.data?.policyResults?.results;
            
            if (!resultsArray || !Array.isArray(resultsArray)) {
              errorMessage.value = "payload structure doens have 'policyResults.results'."
              return
            }
            const targetCred = resultsArray.find((r: any) => r.credential === credentialType) || 
                               resultsArray.find((r: any) => r.type === credentialType);
            if (targetCred) {
               const vc = targetCred.policyResults?.[0]?.result?.vc || targetCred.credentialData || targetCred;
               verifiedData.value = vc
               isVerified.value = true
            } else {
               errorMessage.value = `Credential ${credentialType} not found in the payload.`
            }
          }
        } catch (err) {
          console.error("error during pooling verification:", err)
        }
      }, 2000)

    } catch (e) {
      errorMessage.value = "Failed to initiate SSI verification."
      console.error(e)
    }
  }

  const resetVerification = () => {
    if (pollInterval) clearInterval(pollInterval)
    isVerified.value = false
    verificationUrl.value = ''
    verificationQrCode.value = ''
    verificationStateId.value = ''
    verifiedData.value = null
    errorMessage.value = ''
  }

  onUnmounted(() => {
    if (pollInterval) clearInterval(pollInterval)
  })

  return {
    isVerified,
    verificationUrl,
    verificationQrCode,
    errorMessage,
    verifiedData,
    startVerification,
    resetVerification
  }
}