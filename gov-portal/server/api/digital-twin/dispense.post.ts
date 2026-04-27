export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const DT_API_URL = config.public.DT_API_URL;
    try {
        const login: any = await $fetch(`${DT_API_URL}/api/auth/login`,{
        method: 'POST',
        body: {
            email: "teste@email.com",
            password: "Ig@123456"
        }
    });
        const body = await readBody(event);
        const { productID } = body;
        const result: any = await $fetch (`${DT_API_URL}/api/custody/dispense`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${login.token}` 
            },
            body: {
                productID
            }
        });
        
        return {
            message: 'Digital twin updated successfully',
            data: JSON.parse(result.toString())
        };
    } catch (error: any) {
        console.error(`Error in /api/custody/dispense: ${error}`);
        throw createError({ statusCode: 500, statusMessage: error.message });
    }
});