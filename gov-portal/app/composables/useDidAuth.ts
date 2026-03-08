import { ref } from 'vue'

export function useDidAuth(role:string) {
  const did = ref('')
  const isLoggedIn = ref(false)
  const isLoggingIn = ref(false)
  const authError = ref('')

  const login = async (inputDid:string) => {
    if (!inputDid || inputDid.trim() === '') return false
    
    isLoggingIn.value = true
    authError.value = ''
    did.value = inputDid
    
    try {
      await $fetch(`/api/blockchain/trust-registry/${encodeURIComponent(did.value)}/validate`, {
        params: { role }
      })
      isLoggedIn.value = true
      return true
    } catch (e: any) {
      authError.value = e.data?.statusMessage || `Access Denied: Invalid DID or missing ${role} credentials.`
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

  return { did, isLoggedIn, isLoggingIn, authError, login, logout }
}