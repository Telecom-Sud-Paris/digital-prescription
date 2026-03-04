export default defineEventHandler(async (event) => {
    try {
        const id = getRouterParam(event, 'id');
        if (!id) throw new Error('ID is required');

        const result = await revocationRegistryContract.evaluateTransaction('validateCredential', id);
        return { isValid: result.toString() === 'true' };
    } catch (error: any) {
        console.error(`Error in /revocation-registry/:id/validate: ${error}`);
        throw createError({ statusCode: 500, statusMessage: error.message });
    }
});