'use strict';

class TrustedIssuer {
    constructor(did, role, addedBy) {
        this.docType = 'trusted-issuer';
        this.did = did;
        this.role = role; // 'government', 'doctor', 'pharmacy'
        this.addedBy = addedBy; 
        this.active = true;
        this.registeredAt = null;
    }
}

module.exports = { TrustedIssuer };