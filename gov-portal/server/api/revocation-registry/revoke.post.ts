export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { id, reason } = body;

        const result = await revocationRegistryContract.submitTransaction(
            'revokeCredential', 
            id, 
            reason || 'Unspecified'
        );
        
        return {
            message: 'Credential revoked successfully',
            data: JSON.parse(result.toString())
        };
    } catch (error: any) {
        console.error(`Error in /revocation-registry/revoke: ${error}`);
        throw createError({ statusCode: 500, statusMessage: error.message });
    }
});