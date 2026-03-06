export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { DID } = body;

        const result = await trustedIssuerContract.submitTransaction('revokeIssuer', DID);
        
        return {
            message: 'Trusted issuer revoked',
            data: JSON.parse(result.toString())
        };
    } catch (error: any) {
        console.error(`Error in /trust-registry/revoke: ${error}`);
        throw createError({ statusCode: 500, statusMessage: error.message });
    }
});