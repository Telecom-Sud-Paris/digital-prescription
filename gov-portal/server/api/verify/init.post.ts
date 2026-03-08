import { verificationStore } from '../../utils/verificationStore';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { credentialType, ngrokUrl } = body; 
  
  const stateId = crypto.randomUUID(); 

  const payload = {
    vp_policies: ["signature", "not-before", "expired"],
    vc_policies: ["signature", "not-before", "expired"],
    request_credentials: [
      { type: credentialType, format: "jwt_vc_json" } 
    ],
  };

  if (!ngrokUrl) {
    throw createError({ statusCode: 400, message: "NGROK URL is missing" })
  }

  const response = await $fetch('https://verifier.demo.walt.id/openid4vc/verify', {
    method: 'POST',
    headers: {
      'authorizeBaseUrl': 'openid4vp://authorize', // OBRIGATÓRIO PARA QR CODE
      'responseMode': 'direct_post',               // OBRIGATÓRIO PARA O WEBHOOK
      'statusCallbackUri': `${ngrokUrl}/api/verify/webhook?stateId=${stateId}`, // AQUI USA O ARQUIVO CORRETO
      'stateId': stateId,
      'Content-Type': 'application/json'
    },
    body: payload
  });

  verificationStore.set(stateId, { status: 'pending' });
  
  return { url: response, stateId };
});