/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// =========== modules ===========
const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../../test-application/javascript/CAUtil.js'); 
const { buildCCPOrg1, buildWallet } = require('../../../test-application/javascript/AppUtil.js'); 
const { disconnect } = require('process');

// =========== config FABRIC ===========
const channelName = 'mychannel';
const chaincodeName = 'revocation-registry';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'revocation-test-user';


function prettyJSONString(inputString) {
    return JSON.stringify(JSON.parse(inputString), null, 2);
}

async function main() {
    let contract;
    let gateway;

    try {
        // Fabric network connection
        console.log('Initializing Fabric connection...');

        const ccp = buildCCPOrg1();
        const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
        const wallet = await buildWallet(Wallets, walletPath);

        await enrollAdmin(caClient, wallet, mspOrg1);
        await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');

        gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: org1UserId,
            discovery: { enabled: true, asLocalhost: true }
        });

        const network = await gateway.getNetwork(channelName);
        contract = network.getContract(chaincodeName);
        console.log('Fabric connection successful. Contract object is ready.');
    
        const check = await contract.evaluateTransaction('queryAllCredentials');
        console.log(`${check.toString()}`);

        
        const entry = await contract.submitTransaction(
            "registerCredential", 
            "urn:uuid:125", 
            "subject12", 
            "issuer12", 
            "type1", 
            "2026-12-31", 
            "hash123");
        console.log(`${prettyJSONString(entry.toString())}`);
        
        /*
        const revocation = await contract.submitTransaction(
            "revokeCredential", 
            "urn:uuid:12345", 
            "KeyCompromise");
        console.log(`${prettyJSONString(revocation.toString())}`);
        */

    } catch (error) {
        console.error(`******** FAILED to connect to Fabric network: ${error}`);
        process.exit(1); 
    }


    
    // --- disconnection ---
    const shutdown = async () => {
        console.log('\nShutting down...');
        if (gateway) {
            gateway.disconnect();
        }
        process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}

main();