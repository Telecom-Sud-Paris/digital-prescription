/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// =========== modules ===========
const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js'); 
const { buildCCPOrg1, buildWallet } = require('../../test-application/javascript/AppUtil.js'); 
const { disconnect } = require('process');

// =========== config FABRIC ===========
const channelName = 'mychannel';
const chaincodeTrustedIssuer = 'trusted-issuer';
const chaincodePrescription = 'prescription';
const chaincodeRevocationRegistry = 'revocation-registry';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'test-user';


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
        chaincodeTrustedIssuer = network.getContract(chaincodeTrustedIssuer);
        chaincodePrescription = network.getContract(chaincodePrescription);
        chaincodeRevocationRegistry = network.getContract(chaincodeRevocationRegistry);
        
        console.log('Fabric connection successful. Contract objects are ready.');
    
        const check = await chaincodeTrustedIssuer.evaluateTransaction('initLedger');
        console.log(`${check.toString()}`);

        const check2 = await chaincodePrescription.evaluateTransaction('initLedger');
        console.log(`${check2.toString()}`);

        const check3 = await chaincodeRevocationRegistry.evaluateTransaction('initLedger');
        console.log(`${check3.toString()}`);

        

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