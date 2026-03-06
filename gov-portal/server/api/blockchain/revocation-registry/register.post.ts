export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { id, subject, issuer, credentialType, expirationDate, credentialHash } = body;

        const result = await revocationRegistryContract.submitTransaction(
            'registerCredential', 
            id, 
            subject, 
            issuer, 
            credentialType, 
            expirationDate || '', 
            credentialHash || ''
        );
        
        return {
            message: 'Credential registered in revocation registry',
            data: JSON.parse(result.toString())
        };
    } catch (error: any) {
        console.error(`Error in /revocation-registry/register: ${error}`);
        throw createError({ statusCode: 500, statusMessage: error.message });
    }
});