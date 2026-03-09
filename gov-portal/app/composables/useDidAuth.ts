import { ref } from 'vue'

export function useDidAuth(role: string) {
  const did = ref('')
  const isLoggedIn = ref(false)
  const isLoggingIn = ref(false)
  const authError = ref('')

  const loginWithVc = async (inputDid: string, credentialId: string) => {
    if (!inputDid || !credentialId) {
      authError.value = 'Invalid credential data.'
      return false
    }
    
    isLoggingIn.value = true
    authError.value = ''
    did.value = inputDid
    
    try {
      //check Revocation Registry (the vc cannot be revoked)
      await $fetch(`/api/blockchain/revocation-registry/${encodeURIComponent(credentialId)}/validate`)

      //check Trust Registry (DID must have issuer/role on chain)
      await $fetch(`/api/blockchain/trust-registry/${encodeURIComponent(did.value)}/validate`, {
        params: { role }
      })

      isLoggedIn.value = true
      return true
    } catch (e: any) {
      authError.value = e.data?.statusMessage || `Acesso negado: Credencial revogada ou DID não autorizado para o papel de ${role}.`
      isLoggedIn.value = false
      return false
    } finally {
      isLoggingIn.value = false
    }
  }

  const logout = () => {
    isLoggedIn.value = false
    did.value = ''
    authError.value = ''
  }

  return { did, isLoggedIn, isLoggingIn, authError, loginWithVc, logout }
}