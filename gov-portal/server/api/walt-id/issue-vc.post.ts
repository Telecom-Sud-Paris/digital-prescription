// server/api/issue-vc.post.ts
import { randomUUID } from 'crypto'

const GOV_DID = "did:jwk:eyJrdHkiOiJPS1AiLCJjcnYiOiJFZDI1NTE5Iiwia2lkIjoiaUpNUzVia1pWSWxuY2ZxX0xmX1N1eEoySnRRNUh2YXo3dFdQbkFqVVVkcyIsIngiOiJGWmR2d0M4YUdoUndxeldwdGVqME5aZ3R3WUFJMVN5RmcxbUtERVRPZnFFIn0"
const GOV_JWK = {
  type: "jwk",
  jwk: {
    kty: "OKP",
    d: "JvJIpga2GD8LJeRu4Sv-mL4thE31DuFlr9PA04CIoZY",
    crv: "Ed25519",
    kid: "iJMS5bkZVIlncfq_Lf_SuxJ2JtQ5Hvaz7tWPnAjUUds",
    x: "FZdvwC8aGhRwqzWptej0NZgtwYAI1SyFg1mKDETOfqE"
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { subjectDid, credentialType, name } = body
  console.log(`[Issue VC] Request received for subjectDid: ${subjectDid}, credentialType: ${credentialType}, name: ${name}`)

  const vcId = `urn:uuid:${randomUUID()}`
  const issueDate = new Date().toISOString()
  const expirationDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  const credentialData: any = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "id": vcId,
    "type": ["VerifiableCredential", credentialType],
    "issuer": { "id": GOV_DID },
    "issuanceDate": issueDate,
    "credentialSubject": { "id": subjectDid, "name": name },
    "expirationDate": expirationDate
  }
  console.log(`[Issue VC] Payload:`, credentialData)

  const config = useRuntimeConfig()
  const NGROK_URL = config.NGROK_URL
  const webhookUrl = `${NGROK_URL}/api/webhooks/waltid`
  let offerUrl = ''
  try {
    const waltResponse = await $fetch('https://issuer.demo.walt.id/openid4vc/jwt/issue', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'statusCallbackUri': webhookUrl 
      },
      body: {
        issuerKey: GOV_JWK,
        issuerDid: GOV_DID,
        credentialConfigurationId: "VerifiableId_jwt_vc_json", 
        credentialData: credentialData,
        authenticationMethod: "PRE_AUTHORIZED",
        standardVersion: "DRAFT13"
      }
    })
    offerUrl = waltResponse as string
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: `walt.id fail: ${error.message}` })
  }

  return { vcId, offerUrl }
})