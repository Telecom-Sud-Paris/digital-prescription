'use strict';

class RevocationRegistryEntry {
    constructor(id, subject, issuer, credentialType, expirationDate) {
        this.docType = 'revocation-registry-entry';
        this.id = id;                       // urn:uuid:58137357-1941-4c54-8c8d-3f5f3e7b1652
        this.subject = subject;             // did:key:patient123
        this.issuer = issuer;               // issuer did
        this.credentialType = credentialType; //  'PrescriptionCredential', 'HealthcareProfessionalCredential'
        this.active = true;                 // true (Live) or false (Revoked)
        this.registeredAt = null;
        this.expirationDate = expirationDate || null;
        this.revocationReason = null;       // optional
        this.revokedAt = null;
    }
}

module.exports = { RevocationRegistryEntry };