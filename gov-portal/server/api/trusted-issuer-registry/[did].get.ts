export default defineEventHandler(async (event) => {
    try {
        const did = getRouterParam(event, 'did');
        if (!did) throw new Error('DID is required');

        const result = await trustedIssuerContract.evaluateTransaction('readIssuer', did);
        return JSON.parse(result.toString());
    } catch (error: any) {
        console.error(`Error in GET /trust-registry/:did: ${error}`);
        throw createError({ statusCode: 500, statusMessage: error.message });
    }
});