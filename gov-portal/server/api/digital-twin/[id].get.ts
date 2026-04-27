export default defineEventHandler(async (event) => {
    try {
        const productID = getRouterParam(event, 'id');
        if (!productID) throw new Error('Product ID is required');

        const result: any = await $fetch(`http://localhost:3000/api/custody/${productID}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        return JSON.parse(result.toString());
    } catch (error: any) {
        console.error(`Error in GET /api/custody/:productID: ${error}`);
        throw createError({ statusCode: 500, statusMessage: error.message });
    }
});