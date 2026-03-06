export default defineEventHandler(async (event) => {
    try {
        const id = getRouterParam(event, 'id');
        if (!id) throw new Error('ID is required');

        const result = await revocationRegistryContract.evaluateTransaction('readCredential', id);
        return JSON.parse(result.toString());
    } catch (error: any) {
        console.error(`Error in GET /revocation-registry/:id: ${error}`);
        throw createError({ statusCode: 500, statusMessage: error.message });
    }
});