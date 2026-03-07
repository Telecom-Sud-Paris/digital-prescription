// server/api/webhooks/waltid.post.ts

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (body.type === 'jwt_issue') {
    console.log(`[Webhook] Event 'jwt_issue' received. sessionId: ${body.id}`)
    try {
      const token = body.data.jwt
      const payloadBase64 = token.split('.')[1]
      const decodedPayload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'))
      console.log('[Webhook] Payload:', decodedPayload)    
      const vc = decodedPayload.vc || decodedPayload
      const vcId = vc.id
      const subjectDid = vc.credentialSubject?.id 
      const issuerDid = vc.issuer?.id 

      const credentialType = vc.type.find((t: string) => t !== 'VerifiableCredential')

      if (credentialType === 'PrescriptionCredential') {
        const dispenseReq = vc.credentialSubject?.dispenseRequest || {}
        const refills = dispenseReq.numberOfRepeatsAllowed || 0
        const expDate = dispenseReq.validityPeriod?.end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

        await $fetch('http://localhost:3000/api/blockchain/prescription/register', {
          method: 'POST',
          body: {
            id: vcId,
            issuerDID: issuerDid,
            refillCounter: refills,
            expirationDate: expDate
          }
        })
        console.log(`[Webhook] Prescription ${vcId} registered on-chain. Refills: ${refills}, issued by ${issuerDid}`)
      }
      
      console.log(`[Webhook] Anchoring VC ${vcId} (${credentialType}) for ${subjectDid} issued by ${issuerDid}`)
      // anchor credential in the Revocation Registry
      await $fetch('/api/blockchain/revocation-registry/register', {
        method: 'POST',
        body: {
          id: vcId,
          subject: subjectDid,
          issuer: issuerDid,
          credentialType: credentialType,
          expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          credentialHash: token.substring(token.length - 16) 
        }
      })
      console.log(`[Webhook] revocation registry updated with VC ${vcId}`)

      // if its a doctor/pharmacy, add it in the Trust Registry with the role
      if (credentialType == 'HealthcareProfessionalCredential' || credentialType == "AuthorizedDispenserCredential") {
        const role = credentialType === 'HealthcareProfessionalCredential' ? 'doctor' : 'pharmacy'
        await $fetch('/api/blockchain/trust-registry/register', {
          method: 'POST',
          body: {
            DID: subjectDid,
            role: role,
            addedBy: issuerDid
          }
        })
        console.log(`[Webhook] role ${role} granted to ${subjectDid} in the Trust Registry.`)
      }

      

     

    } catch (error: any) {
      console.error('[Webhook] fail on chaincode calls:', error)
      throw createError({ statusCode: 500, statusMessage: 'Blockchain error' })
    }
  } else {
    // Ignora eventos irrelevantes (ex: 'requested_token') silenciosamente
    //console.log(`[Webhook] Evento ignorado: ${body.type}`)
  }
  return { status: 'received' }
})