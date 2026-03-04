export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { DID, role, addedBy } = body;

        if (!DID || !role || !addedBy) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing required fields: DID, role, or addedBy',
            });
        }
        console.log(`Registering issuer: ${DID} with role ${role}`);

        const result = await trustedIssuerContract.submitTransaction('registerIssuer', DID, role, addedBy);
        
        return {
            message: 'Trusted issuer registered',
            data: JSON.parse(result.toString())
        };

    } catch (error: any) {
        console.error(`Error in /trust-registry/register: ${error}`);
        
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Internal Server Error',
        });
    }
});