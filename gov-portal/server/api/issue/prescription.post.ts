// server/api/issue-vc.post.ts
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { doctorDid, patientDid, medication, refills, expirationDate } = body
  const key = await $fetch<{ privateKey: JsonWebKey }>('/api/did/key', { 
        method: 'POST', 
        body: { did: doctorDid } 
      });
  const jwk = key.privateKey

  const keyMaterial = {
    type: "jwk",
    jwk: jwk 
  }
  
  const vcId = `urn:uuid:${randomUUID()}`
  const issueDate = new Date().toISOString()
  const credentialData = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "id": vcId,
    "type": ["VerifiableCredential", "PrescriptionCredential"],
    "issuer": { "id": doctorDid }, 
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
  //console.log(`[Issue VC] Payload:`, credentialData)

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
        issuerKey: keyMaterial,
        issuerDid: doctorDid,
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