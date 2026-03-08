// server/api/did/generate.post.ts
export default defineEventHandler(async (event) => {
    
    const login: any = await $fetch("https://wallet.test.waltid.cloud/wallet-api/auth/login",{
        method: 'POST',
        body: {
            type: "email",
            email: "poc-teste@email.com",
            password: "password"
        }
    });
  
    const wallets: any = await $fetch("https://wallet.test.waltid.cloud/wallet-api/wallet/accounts/wallets", {
        method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${login.token}` 
      }
    });
   
    const walletId = wallets.wallets[0].id
    const did: any = await $fetch(`https://wallet.test.waltid.cloud/wallet-api/wallet/${walletId}/dids/create/jwk`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${login.token}` 
      }
    });
    const didDocument: any = await $fetch(`https://wallet.test.waltid.cloud/wallet-api/wallet/${walletId}/dids/${did}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${login.token}` 
      }
    });
    
  return {
    did, didDocument
  };
});