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
const org1UserId = 'test-CASE';


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
        const contractTrustedIssuer = network.getContract(chaincodeTrustedIssuer);
        const contractPrescription = network.getContract(chaincodePrescription);
        const contractRevocationRegistry = network.getContract(chaincodeRevocationRegistry);
        
        console.log('Fabric connection successful. Contract objects are ready.');
        
        /*
        const check = await contractTrustedIssuer.submitTransaction('initLedger');
        console.log(`${check.toString()}`);

        const check2 = await contractPrescription.submitTransaction('initLedger');
        console.log(`${check2.toString()}`);

        const check3 = await contractRevocationRegistry.submitTransaction('initLedger');
        console.log(`${check3.toString()}`);
        */

        const allPrescriptions = await contractPrescription.evaluateTransaction('queryAllPrescriptions');
        console.log(`All prescriptions: ${prettyJSONString(allPrescriptions.toString())}`);
        const prescription = await contractPrescription.evaluateTransaction('readPrescription', 'urn:uuid:54321');
        console.log(`Prescription details: ${prettyJSONString(prescription.toString())}`);
        //const dispense= await contractPrescription.submitTransaction('dispensePrescription', 'urn:uuid:54321', 'did:pharmacy:1234567890abcdef', "produto");
        //console.log(`Dispense result: ${dispense.toString()}`);
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
