export default defineEventHandler(async () => {
    try {
        const result = await trustedIssuerContract.evaluateTransaction('queryAllIssuers');
        return JSON.parse(result.toString());
    } catch (error: any) {
        console.error(`Error in GET /trust-registry: ${error}`);
        throw createError({ statusCode: 500, statusMessage: error.message });
    }
});