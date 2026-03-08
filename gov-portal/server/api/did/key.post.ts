// server/api/did/generate.post.ts
export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { did } = body
    const login: any = await $fetch("https://wallet.test.waltid.cloud/wallet-api/auth/login",{
        method: 'POST',
        body: {
            type: "email",
            email: "poc-teste@email.com",
            password: "password"
        }
    });
    console.log("[Wallet] Login successful")
    const wallets: any = await $fetch("https://wallet.test.waltid.cloud/wallet-api/wallet/accounts/wallets", {
        method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${login.token}` 
      }
    });
    const walletId = wallets.wallets[0].id
    const didDocument: any = await $fetch(`https://wallet.test.waltid.cloud/wallet-api/wallet/${walletId}/dids/${did}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${login.token}` 
      }
    });
    const publicKey = didDocument.verificationMethod[0].publicKeyJwk
    const keyId = publicKey.kid;
    let privateKey: any = await $fetch(`https://wallet.test.waltid.cloud/wallet-api/wallet/${walletId}/keys/${keyId}/export?format=JWK&loadPrivateKey=true`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${login.token}`
        }
    });
    privateKey=JSON.parse(privateKey)
  return {
    publicKey, privateKey
  };
});