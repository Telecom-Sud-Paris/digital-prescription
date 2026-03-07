export default defineEventHandler(async (event) => {
  const did = getRouterParam(event, 'did')
  const query = getQuery(event)
  const role = query.role as string
  //console.log(`Validating DID ${did} for role ${role}`)
  if (!did || !role) {
    throw createError({ statusCode: 400, statusMessage: 'Missing DID or role parameter' })
  }

  try {
    const result = await trustedIssuerContract.evaluateTransaction('validateIssuer', did, role);
    return { valid: result.toString() === 'true' }
  } catch (error: any) {
    const msg = error.message || 'Unauthorized DID'
    throw createError({ statusCode: 403, statusMessage: msg })
  }
})