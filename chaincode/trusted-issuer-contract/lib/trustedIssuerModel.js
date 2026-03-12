'use strict';

class TrustedIssuer {
    constructor(did, role, addedBy) {
        this.docType = 'trusted-issuer';
        this.did = did;
        this.role = role; // 'government', 'doctor', 'pharmacy'
        this.addedBy = addedBy; // DID that added this trusted issuer
        this.active = true;
        this.registeredAt = null;
        this.expireDate = null;
    }
}

module.exports = { TrustedIssuer };