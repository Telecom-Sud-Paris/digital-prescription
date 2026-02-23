'use strict';

const { Contract } = require('fabric-contract-api');
const { RevocationRegistryEntry } = require('./revocationRegistryEntry');
const ContractUtils = require('./utils');

class RevocationRegistryContract extends Contract {

    constructor() {
        super('RevocationRegistryContract');
    }

    async initLedger(ctx) {
    }

    async registerCredential(ctx, id, subject, issuer, credentialType, expirationDate, credentialHash) {
        const exists = await this.credentialExists(ctx, id);
        if (exists) {
            throw new Error(`Credential ${id} is already registered.`);
        }
        const entry = new RevocationRegistryEntry(id, subject, issuer, credentialType, expirationDate, credentialHash);
        entry.registeredAt = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();
        
        const buffer = ContractUtils.objToBuffer(entry);
        await ctx.stub.putState(id, buffer);
      
        ctx.stub.setEvent('CredentialRegistered', Buffer.from(JSON.stringify(entry)));
        console.log(`New Credential anchored: ${id} of type ${credentialType}`);
        
        return JSON.stringify(entry);
    }

    async validateCredential(ctx, id) {
        try {
            const entry = await this.getCredentialHelper(ctx, id);
            
            if (!entry.active) {
                throw new Error(`Credential ${id} is revoked.`);
            }
            

            if (entry.expirationDate) {
                const expDate = new Date(entry.expirationDate);
                const now = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000);
                if (now > expDate) {
                    throw new Error(`Credential ${id} has expired.`);
                }
            }

            console.log(`Credential ${id} successfully validated as Active.`);
            return Buffer.from('true'); 
        } catch (err) {
            throw new Error(err.message);
        }   
    }

    async readCredential(ctx, id) {
        const entry = await this.getCredentialHelper(ctx, id);
        return JSON.stringify(entry);
    }

    async revokeCredential(ctx, id, reason) {
        const entry = await this.getCredentialHelper(ctx, id);
        if (!entry.active) {
            throw new Error(`Credential ${id} is already revoked.`);
        }
        entry.active = false;
        entry.revocationReason = reason || 'Unspecified';
        entry.revokedAt = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();
        
        await ctx.stub.putState(id, ContractUtils.objToBuffer(entry));
        ctx.stub.setEvent('CredentialRevoked', Buffer.from(JSON.stringify(entry)));
        console.log(`Credential ${id} has been revoked. Reason: ${entry.revocationReason}`);
        return JSON.stringify(entry);
    }

    // utils
    async credentialExists(ctx, id) {
        const buffer = await ctx.stub.getState(id);
        return (!!buffer && buffer.length > 0);
    }

    async getCredentialHelper(ctx, id) {
        const exists = await this.credentialExists(ctx, id);
        if (!exists) {
            throw new Error(`Credential ${id} does not exist on the ledger.`);
        }
        const buffer = await ctx.stub.getState(id);
        return ContractUtils.bufferToObj(buffer);
    }

    async queryAllCredentials(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange(startKey, endKey);
        let result = await iterator.next();
        
        while (!result.done) {
            if (result.value && result.value.value.toString()) {
                const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
                let record;
                try {
                    record = JSON.parse(strValue);
                } catch (err) {
                    console.log(err);
                    record = strValue;
                }
                if (record.docType === 'revocation-registry-entry') {
                    allResults.push({ Key: result.value.key, Record: record });
                }
            }
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = RevocationRegistryContract;