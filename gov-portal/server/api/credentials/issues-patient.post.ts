import { randomUUID } from 'crypto';

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { patientDid, ssn, fullName, birthDate } = body;
        const govDid = "did:web:gov.example.country"; 
        const vcId = `urn:uuid:${randomUUID()}`;
        
        const credentialData = {
            id: vcId,
            type: ["VerifiableCredential", "PatientCredential"],
            credentialSubject: {
                resourceType: "Patient",
                identifier: {
                    use: "official",
                    system: "http://hospital.smart.org/identifiers",
                    value: ssn
                },
                active: true,
                name: {
                    use: "official",
                    family: fullName.split(' ').pop(),
                    given: fullName.split(' ')[0]
                },
                birthDate: birthDate
            }
        };

        const signedVc = await waltIdService.issueCredential(govDid, patientDid, credentialData);


        await $fetch('/api/revocation-registry/register', {
            method: 'POST',
            body: {
                id: vcId,
                subject: patientDid,
                issuer: govDid,
                credentialType: "PatientCredential",
                expirationDate: "2030-12-31", 
                credentialHash: "simulated-hash"
            }
        });

        await waltIdService.storeCredential(patientDid, signedVc);

        return { success: true, message: 'Identidade gerada via FHIR e salva na wallet.' };
    } catch (error: any) {
        throw createError({ statusCode: 500, statusMessage: error.message });
    }
});