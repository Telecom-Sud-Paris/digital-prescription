
export function usePharmacy() {
  const isLoading = ref(false)
  const errorMessage = ref('')
  const prescription = ref<any>(null)
  const dispenseSuccess = ref(false)

  const getPrescription = async (id: string) => {
    isLoading.value = true
    errorMessage.value = ''
    prescription.value = null
    dispenseSuccess.value = false
    try {
      const data = await $fetch(`/api/blockchain/prescription/${id}`)
      prescription.value = data
    } catch (error: any) {
      console.error(error)
      errorMessage.value = error.data?.error || error.message || 'Prescrição não encontrada ou erro no ledger.'
    } finally {
      isLoading.value = false
    }
  }

  const dispense = async (id: string, issuerDID: string, pharmacyDID: string, productLinkID: string) => {
    isLoading.value = true
    errorMessage.value = ''
    console.log(`Dispensing prescription. ID: ${id}, issuerDID: ${issuerDID}, pharmacyDID: ${pharmacyDID}, productLinkID: ${productLinkID}`)
    try {
      await $fetch('/api/blockchain/prescription/dispense', {
        method: 'POST',
        body: { id, issuerDID, pharmacyDID, productLinkID }
      })
      
      await getPrescription(id)
      dispenseSuccess.value = true
    } catch (error: any) {
      console.error(error)
      errorMessage.value = error.data?.error || error.message || 'Falha ao processar dispensação no Fabric.'
    } finally {
      isLoading.value = false
    }
  }

  const reset = () => {
    prescription.value = null
    errorMessage.value = ''
    dispenseSuccess.value = false
  }

  return { isLoading, errorMessage, prescription, dispenseSuccess, getPrescription, dispense, reset }
}