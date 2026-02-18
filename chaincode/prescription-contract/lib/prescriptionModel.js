'use strict';

class PrescriptionState {
    /**
     * @param {string} id - prescription id
     * @param {string} issuerDID - doctor did
     * @param {number} refillCounter - allowed repetitions
     */
    constructor(id, issuerDID, refillCounter, validityPeriod, lastUpdated) {
        this.docType = 'prescription';
        this.id = id;
        this.issuerDID = issuerDID;
        this.refillCounter = parseInt(refillCounter); 
        this.status = 'active';
        this.validityPeriod = validityPeriod;
        this.lastUpdated = null
        
        //upon dispense
        this.dispensedBy = null;   // pharmacyDID
        this.productLinkID = null; // digitaltwin
    }
}

module.exports = {
    PrescriptionState
};