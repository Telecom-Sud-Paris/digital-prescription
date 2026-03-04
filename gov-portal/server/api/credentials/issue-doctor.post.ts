import { randomUUID } from 'crypto';

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { doctorDid, licenseNumber, doctorName } = body;
        const govDid = "did:web:gov.example.country"; 

        const vcId = `urn:uuid:${randomUUID()}`;
        
        const credentialData = {
            id: vcId,
            type: ["VerifiableCredential", "HealthcareProfessionalCredential"],
            credentialSubject: {
                resourceType: "Practitioner",
                identifier: [{ system: "http://gov.example/medical-license", value: licenseNumber }],
                active: true,
                name: [{ family: doctorName, prefix: ["Dr."] }]
            }
        };

        const signedVc = await waltIdService.issueCredential(govDid, doctorDid, credentialData);

        await $fetch('/api/trust-registry/register', {
            method: 'POST',
            body: { DID: doctorDid, role: 'doctor', addedBy: govDid }
        });

        await $fetch('/api/revocation-registry/register', {
            method: 'POST',
            body: {
                id: vcId,
                subject: doctorDid,
                issuer: govDid,
                credentialType: "HealthcareProfessionalCredential",
                expirationDate: "2026-12-31",
                credentialHash: "simulated-hash"
            }
        });

        await waltIdService.storeCredential(doctorDid, signedVc);

        return { success: true, message: 'Médico registrado on-chain com FHIR e salvo na wallet.' };
    } catch (error: any) {
        throw createError({ statusCode: 500, statusMessage: error.message });
    }
});