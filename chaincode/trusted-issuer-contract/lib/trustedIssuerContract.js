'use strict';

const { Contract } = require('fabric-contract-api');

const { TrustedIssuer } = require('./trustedIssuerModel');
const ContractUtils = require('./utils');

class TrustedIssuerContract extends Contract {

    constructor() {
        super('TrustedIssuerContract');
    }

    async initLedger(ctx) {
        const DID = "did:web:gov.example.country";
        const issuerDID = "did:web:global-governance-authority"
        const role = "government"
        const trustedIssuer = new TrustedIssuer(DID, role, issuerDID)
        const buffer = ContractUtils.objToBuffer(trustedIssuer);
        await ctx.stub.putState(DID, buffer);

        console.log(`Initialized Registry. Root Authority: ${DID}`);
        return JSON.stringify(trustedIssuer);
    }

    async registerIssuer(ctx, DID, role, addedByDID) {
        const exists = await this.issuerExists(ctx, DID);
        if (exists) {
            throw new Error(`Issuer ${DID} already registered.`);
        }
        const allowedRoles = ['doctor', 'pharmacy', 'government'];
        if (!allowedRoles.includes(role)) {
            throw new Error(`invalid role: ${role}. allowed: ${allowedRoles.join(', ')}`);
        }

        const newIssuer = new TrustedIssuer(DID, role, addedByDID);
        const buffer = ContractUtils.objToBuffer(newIssuer);
        
        await ctx.stub.putState(DID, buffer);
        
        ctx.stub.setEvent('IssuerRegistered', Buffer.from(JSON.stringify(newIssuer)));
        console.log(`New Issuer registered: ${DID} as ${role}`);
        return JSON.stringify(newIssuer);
    }

    // called by prescription contract
    async validateIssuer(ctx, DID, requiredRole) {
        try {
            const issuer = await this.getIssuerHelper(ctx, DID);
            if (!issuer.active) {
                throw new Error(`Issuer ${DID} is revoked.`);
            }
            if (issuer.role !== requiredRole) {
                throw new Error(`ERROR: Unmatching role. DID has role '${issuer.role}', but expected '${requiredRole}'.`);
            }
            console.log(`${DID} successfully validated as ${requiredRole}.`);
            return Buffer.from('true'); 
        } catch (err) {
            throw new Error(err.message);
        }   
    }

    async readIssuer(ctx, DID) {
        const issuer = await this.getIssuerHelper(ctx, DID)
        return JSON.stringify(issuer);
    }

    async revokeIssuer(ctx, DID) {
        const issuer = await this.getIssuerHelper(ctx, DID)
        issuer.active = false;
        await ctx.stub.putState(DID, ContractUtils.objToBuffer(issuer));
        console.log(`${DID} had its issuer rights revoked`)
        return JSON.stringify(issuer);
    }

    // === Helpers ===
    async issuerExists(ctx, DID) {
        const buffer = await ctx.stub.getState(DID);
        return (!!buffer && buffer.length > 0);
    }

    async getIssuerHelper(ctx, DID) {
        const exists = await this.issuerExists(ctx, DID);
        if (!exists) {
            throw new Error(`issuer ${DID} does not exist`);
        }
        const buffer = await ctx.stub.getState(DID);
        return ContractUtils.bufferToObj(buffer);
    }

    async queryAllIssuers(ctx) {
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
            if (record.docType === 'trusted-issuer') {
                allResults.push({ Key: result.value.key, Record: record });
            }
      
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = TrustedIssuerContract;