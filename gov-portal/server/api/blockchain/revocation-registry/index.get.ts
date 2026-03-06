export default defineEventHandler(async () => {
    try {
        const result = await revocationRegistryContract.evaluateTransaction('queryAllCredentials');
        return JSON.parse(result.toString());
    } catch (error: any) {
        console.error(`Error in GET /revocation-registry: ${error}`);
        throw createError({ statusCode: 500, statusMessage: error.message });
    }
});