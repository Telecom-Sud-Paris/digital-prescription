export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { id, pharmacyDID, productLinkID } = body;

        const result = await prescriptionContract.submitTransaction(
            'dispensePrescription', 
            id, 
            pharmacyDID, 
            productLinkID
        );
        
        return {
            message: 'Prescription dispensed successfully',
            data: JSON.parse(result.toString())
        };
    } catch (error: any) {
        console.error(`Error in /prescriptions/dispense: ${error}`);
        throw createError({ statusCode: 500, statusMessage: error.message });
    }
});