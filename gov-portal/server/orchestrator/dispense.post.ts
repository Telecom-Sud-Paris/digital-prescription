export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const DT_API_URL = config.public.DT_API_URL;
    const body = await readBody(event);
    const { id, pharmacyDID, productLinkID } = body;

    try {
        // 1. CHECAGEM DE CUSTÓDIA (Read-only)
        const custody: any = await $fetch(`${DT_API_URL}/api/custody/${productLinkID}`);
        
        // Ajuste a string 'pharma' conforme a sua regra de mapeamento de DIDs
        if (custody.currentState !== 'PHARMACY' || custody.currentOwnerOrg !== 'pharma') {
            throw createError({ 
                statusCode: 400, 
                message: `Produto indisponível. Status: ${custody.currentState}, Org: ${custody.currentOwnerOrg}` 
            });
        }

        // 2. TRANSAÇÃO NA BLOCKCHAIN (Source of Truth)
        // Se a receita for inválida, o Fabric vai dar throw e abortar o processo aqui.
        const bcResult = await $fetch('/api/blockchain/prescription/dispense', {
            method: 'POST',
            body: { id, pharmacyDID, productLinkID }
        });

        // 3. BAIXA NO DIGITAL TWIN (Eventual Consistency)
        try {
            await $fetch(`${DT_API_URL}/api/custody/dispense`, {
                method: 'POST',
                body: { productID: productLinkID }
            });
        } catch (dtError) {
            // A blockchain consolidou, mas o DT engasgou.
            // Aqui você loga pesado ou salva num BD local para rodar um CRON/Fila depois.
            // NÃO damos throw para o frontend, pois o paciente JÁ PODE levar o remédio.
            console.error('[CRÍTICO] BC atualizada, mas falha ao dar baixa no DT. Requer retry manual.', dtError);
        }

        // Retorna sucesso total para o front
        return {
            success: true,
            blockchain: bcResult,
            message: 'Orquestração de dispensa concluída'
        };

    } catch (error: any) {
        // Se falhou no passo 1 ou 2, repassa o erro pro front. Nenhum estado foi corrompido.
        throw createError({ 
            statusCode: error.statusCode || 500, 
            statusMessage: error.statusMessage || error.message 
        });
    }
});