export default defineEventHandler(async () => {
    try {
        const result = await prescriptionContract.evaluateTransaction('queryAllPrescriptions');
        return JSON.parse(result.toString());
    } catch (error: any) {
        console.error(`Error in GET /prescriptions: ${error}`);
        throw createError({ statusCode: 500, statusMessage: error.message });
    }
});