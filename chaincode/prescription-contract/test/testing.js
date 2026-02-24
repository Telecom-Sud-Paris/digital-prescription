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
const chaincodeName = 'prescription';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'prescription-test';


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
        
        // const check = await contract.submitTransaction('createPrescription',
        // "urn:uuid:125", // id
        // 'did:doctor:1234567890abcdef',                                     // issuerDID
        // '3',                                             // refillCounter
        // '2027-01-14T12:00:00Z'                           // validityPeriod
        // );
        // console.log(`${check.toString()}`);
        

        // const precription = await contract.evaluateTransaction("queryAllPrescriptions");
        // console.log(`${prettyJSONString(precription.toString())}`);

        
        const dispense = await contract.submitTransaction('dispensePrescription', 
            "urn:uuid:125", 
            "did:pharmacy:1234567890abcdef",
            ""
        );
        console.log(`${dispense.toString()}`);

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