'use strict';

const { Contract } = require('fabric-contract-api');
const { PrescriptionState } = require('./prescriptionModel');
const ContractUtils = require('./utils');

class PrescriptionContract extends Contract {

    constructor() {
        super('PrescriptionContract');
    }

    // ====== helper functions ======
    /**
     * getPrescriptionHelper
     */
    async getPrescriptionHelper(ctx, id) {
        const exists = await this.prescriptionExists(ctx, id);
        if (!exists) {
            throw new Error(`Prescription ${id} does not exist`);
        }
        const buffer = await ctx.stub.getState(id);
        return ContractUtils.bufferToObj(buffer);
    }

    /**
     * check if the did is on the trusted issuer registry
     * @param {Context} ctx 
     * @param {string} DID 
     * @param {string} requiredRole - 'doctor' ou 'pharmacy'
     */
    async verifyRoleInRegistry(ctx, DID, requiredRole) {
        const chaincodeName = 'trusted-issuer';
        const channelName = ctx.stub.getChannelID(); //mychannel
        const args = [
            'validateIssuer', 
            DID, 
            requiredRole
        ];
        const argsBuffer = args.map(arg => Buffer.from(arg));
        const response = await ctx.stub.invokeChaincode(chaincodeName, argsBuffer, channelName);

        if (response.status !== 200) {
            throw new Error(`Fail ${DID}: ${response.message}`);
        }
        
        return true;
    }

    /*
    verify that the prescription isnt revoked in the revocation registry
    */
    async verifyRevocation(ctx, id){
        const chaincodeName = 'revocation-registry';
        const channelName = ctx.stub.getChannelID(); //mychannel
        const args = [
            'validateCredential',
            id
        ];
        const argsBuffer = args.map(arg => Buffer.from(arg));
        const response = await ctx.stub.invokeChaincode(chaincodeName, argsBuffer, channelName);

        if (response.status !== 200) {
            throw new Error(`Fail ${id}: ${response.message}`);
        }
    }
     
    /**
     * prescriptionExists
     * @returns {boolean} 
     */
    async prescriptionExists(ctx, id) {
        const buffer = await ctx.stub.getState(id);
        return (!!buffer && buffer.length > 0);
    }

    /**
     * prescriptionStillActive
     * status active e Refills > 0
     * @returns {boolean}
     */
    async prescriptionStillActive(ctx, id) {
        try {
            const prescription = await this.getPrescriptionHelper(ctx, id);
            const isActive = (prescription.status === 'active');
            const hasRefills = (prescription.refillCounter > 0);
            const notRevoked = await this.verifyRevocation(ctx, id);
            return (isActive && hasRefills && notRevoked);
        } catch (err) {
            return false;
        }
    }

    // ====== main ======

    async initLedger(ctx) {
        console.info('Initializing Ledger with sample prescriptions...');
        const prescriptions = [
            new PrescriptionState('urn:uuid:67890', 'did:doctor:1234567890abcdef', 3, '2026-12-31'),
            new PrescriptionState('urn:uuid:54321', 'did:doctor:1234567890abcdef', 1, '2025-11-30'), //will fail due to expiration date
            new PrescriptionState('urn:uuid:98765', 'did:doctor:9876543210fedcba', 1, '2026-10-31') //will fail cause doctor not in registry
        ];
        
        for (const prescription of prescriptions) {
            prescription.lastUpdated = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();
            await ctx.stub.putState(prescription.id, ContractUtils.objToBuffer(prescription));
            console.info(`Prescription ${prescription.id} initialized`);
        }
    }

    async createPrescription(ctx, id, issuerDID, refillCounter, expirationDate) {
        const exists = await this.prescriptionExists(ctx, id);
        if (exists) {
            throw new Error(`The prescription ${id} already exists`);
        }
        await this.verifyRoleInRegistry(ctx, issuerDID, 'doctor');
        const prescription = new PrescriptionState(id, issuerDID, refillCounter, expirationDate);
        prescription.lastUpdated = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();
        
        const buffer = ContractUtils.objToBuffer(prescription);
        await ctx.stub.putState(id, buffer);

        console.log(`Prescription created: ${id} with ${refillCounter} refills.`);
        return JSON.stringify(prescription);
    }

    /**
     * prescriptionDispense
     * run by pharmacy. Dispense and link to physical product
     */
    async prescriptionDispense(ctx, id, pharmacyDID, productLinkID) {
        const isActive = await this.prescriptionStillActive(ctx, id);
        if (!isActive) {
            throw new Error(`Prescription ${id} is not active.`);
        }
        await this.verifyRoleInRegistry(ctx, pharmacyDID, 'pharmacy');
        
        const prescription = await this.getPrescriptionHelper(ctx, id);

        prescription.refillCounter--; 
        if (prescription.refillCounter === 0) {
            prescription.status = "completed"; 
            console.log(`Prescription ${id} fully dispensed. Status set to COMPLETED.`);
        }else{
            console.log(`Prescription ${id} partially dispensed. Refills remaining: ${prescription.refillCounter}`);

        }

        prescription.dispensedBy = pharmacyDID;
        prescription.productLinkID = productLinkID;
        prescription.lastUpdated = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();

        await ctx.stub.putState(id, ContractUtils.objToBuffer(prescription));

        const eventPayload = {
            id: prescription.id,
            status: prescription.status,
            remainingRefills: prescription.refillCounter,
            productLink: productLinkID,
            updatedBy: pharmacyDID
        };
        ctx.stub.setEvent('PrescriptionDispensed', Buffer.from(JSON.stringify(eventPayload)));

        return JSON.stringify(prescription);
    }

    /**
     * readPrescription
     * prescription current state
     */
    async readPrescription(ctx, id) {
        const prescription = await this.getPrescriptionHelper(ctx, id);
        return JSON.stringify(prescription);
    }

    async queryAllPrescriptions(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange(startKey, endKey);
        let result = await iterator.next();
        
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            if (record.docType === 'prescription') {
                allResults.push({ Key: result.value.key, Record: record });
            }
      
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}


module.exports = PrescriptionContract;