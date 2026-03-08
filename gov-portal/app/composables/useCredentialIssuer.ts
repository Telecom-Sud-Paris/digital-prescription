export default function()   {
  const isLoading = ref(false)
  const offerUrl = ref('')
  const generatedVcId = ref('')
  const errorMessage = ref('')

  const issue = async (payload: { credentialType: string; subjectDid: string; name: string }) => {
    isLoading.value = true
    offerUrl.value = ''
    errorMessage.value = ''
    
    try {
      const response = await $fetch('/api/issue/issue-vc', {
        method: 'POST',
        body: payload
      })
      
      offerUrl.value = response.offerUrl
      generatedVcId.value = response.vcId
    } catch (error: any) {
      console.error(error)
      errorMessage.value = error.data?.statusMessage || error.message
    } finally {
      isLoading.value = false
    }
  }

  const reset = () => {
    offerUrl.value = ''
    generatedVcId.value = ''
    errorMessage.value = ''
  }

  return { isLoading, offerUrl, generatedVcId, errorMessage, issue, reset }
}