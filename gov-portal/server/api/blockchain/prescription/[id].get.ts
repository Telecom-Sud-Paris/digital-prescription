export default defineEventHandler(async (event) => {
    try {
        const id = getRouterParam(event, 'id');
        if (!id) throw new Error('ID is required');

        const result = await prescriptionContract.evaluateTransaction('readPrescription', id);
        return JSON.parse(result.toString());
    } catch (error: any) {
        console.error(`Error in GET /prescriptions/:id: ${error}`);
        throw createError({ statusCode: 500, statusMessage: error.message });
    }
});