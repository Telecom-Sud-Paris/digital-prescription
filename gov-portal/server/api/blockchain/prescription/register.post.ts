export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { id, issuerDID, refillCounter, expirationDate } = body;

        const result = await prescriptionContract.submitTransaction(
            'createPrescription', 
            id, 
            issuerDID, 
            refillCounter.toString(), 
            expirationDate
        );
        
        return {
            message: 'Prescription registered successfully',
            data: JSON.parse(result.toString())
        };
    } catch (error: any) {
        console.error(`Error in /prescriptions/register: ${error}`);
        throw createError({ statusCode: 500, statusMessage: error.message });
    }
});