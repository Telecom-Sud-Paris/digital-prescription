export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { id, issuerDID, pharmacyDID, productLinkID } = body;
        //console.log(`[/blockchain/prescription/dispense] Request received for prescription ID: ${id}, issuerDID: ${issuerDID}, pharmacyDID: ${pharmacyDID}, productLinkID: ${productLinkID}`);
        const result = await prescriptionContract.submitTransaction(
            'dispensePrescription', 
            id, 
            issuerDID,
            pharmacyDID, 
            productLinkID
        );
        
        return {
            message: 'Prescription dispensed successfully',
            data: JSON.parse(result.toString())
        };
    } catch (error: any) {
        console.error(`Error in /prescription/dispense: ${error}`);
        throw createError({ statusCode: 500, statusMessage: error.message });
    }
});