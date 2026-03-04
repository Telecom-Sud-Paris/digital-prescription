// server/utils/waltid.ts
const WALTID_ISSUER_URL = process.env.WALTID_ISSUER_URL || 'http://localhost:7000';
const WALTID_VERIFIER_URL = process.env.WALTID_VERIFIER_URL || 'http://localhost:7001';
const WALTID_WALLET_URL = process.env.WALTID_WALLET_URL || 'http://localhost:7002';
export const waltIdService = {
    async createDid() {
        try {
            const response = await $fetch(`${WALTID_WALLET_URL}/wallet-api/wallet/somewallet/dids/create`, {
                method: 'POST',
                body: { method: 'key' } 
            });
            return response; 
        } catch (error: any) {
            throw new Error(`Falha ao criar DID: ${error.message}`);
        }
    },

    async issueCredential(issuerDid: string, subjectDid: string, credentialData: any) {
        try {
            const response = await $fetch(`${WALTID_ISSUER_URL}/api/issuer/issue`, {
                method: 'POST',
                body: {
                    templateId: credentialData.type[1], 
                    issuerDid,
                    subjectDid,
                    credentialData
                }
            });
            return response; 
        } catch (error: any) {
            throw new Error(`Falha ao emitir credencial: ${error.message}`);
        }
    },

    async storeCredential(did: string, credential: any) {
        try {
            const walletId = did.replace(/[^a-zA-Z0-9]/g, ''); 
            return await $fetch(`${WALTID_WALLET_URL}/wallet-api/wallet/${walletId}/credentials`, {
                method: 'POST',
                body: credential
            });
        } catch (error: any) {
            throw new Error(`Falha ao armazenar VC: ${error.message}`);
        }
    },

    async getCredentials(did: string) {
        try {
            const walletId = did.replace(/[^a-zA-Z0-9]/g, '');
            return await $fetch(`${WALTID_WALLET_URL}/wallet-api/wallet/${walletId}/credentials`);
        } catch (error: any) {
            throw new Error(`Falha ao buscar credenciais: ${error.message}`);
        }
    },

    async verifyCredential(presentation: any, policies: string[] = ["SignaturePolicy"]) {
        try {
            return await $fetch(`${WALTID_VERIFIER_URL}/api/verifier/verify`, {
                method: 'POST',
                body: { policies, presentation }
            });
        } catch (error: any) {
            throw new Error(`Falha na verificação: ${error.message}`);
        }
    }
};