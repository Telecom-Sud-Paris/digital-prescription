// server/api/issue-vc.post.ts
import { randomUUID } from 'crypto'

const DOCTOR_DID = "did:jwk:eyJrdHkiOiJPS1AiLCJjcnYiOiJFZDI1NTE5Iiwia2lkIjoiaUpNUzVia1pWSWxuY2ZxX0xmX1N1eEoySnRRNUh2YXo3dFdQbkFqVVVkcyIsIngiOiJGWmR2d0M4YUdoUndxeldwdGVqME5aZ3R3WUFJMVN5RmcxbUtERVRPZnFFIn0"
const DOCTOR_JWK = {
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
  const { doctorDid, patientDid, medication, refills, expirationDate } = body
  const vcId = `urn:uuid:${randomUUID()}`
  const issueDate = new Date().toISOString()
  const credentialData = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "id": vcId,
    "type": ["VerifiableCredential", "PrescriptionCredential"],
    "issuer": { "id": DOCTOR_DID }, 
    "credentialSubject": {
      "id": patientDid,
      "resourceType": "MedicationRequest",
      "status": "active",
      "intent": "order",
      "medication": { "concept": { "text": medication } },
      "requester": { "reference": doctorDid },
      "dispenseRequest": {
        "validityPeriod": { "end": expirationDate },
        "numberOfRepeatsAllowed": Number(refills),
        "quantity": { "value": 1, "unit": "package" }
      }
    },
    "issuanceDate": issueDate,
    "expirationDate": expirationDate
  }
  console.log(`[Issue VC] Payload:`, credentialData)

  const config = useRuntimeConfig()
  const NGROK_URL = config.public.NGROK_URL
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
        issuerKey: DOCTOR_JWK,
        issuerDid: DOCTOR_DID,
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