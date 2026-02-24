'use strict';

const express = require('express');
const cors = require('cors');
const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');

const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../test-application/javascript/CAUtil.js'); 
const { buildCCPOrg1, buildWallet } = require('../test-application/javascript/AppUtil.js'); 

const app = express();
app.use(cors());
app.use(express.json());

const channelName = 'mychannel';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'server-user';

let prescriptionContract;
let revocationRegistryContract;
let trustedIssuerContract;

async function initFabricConnection() {
    try {
        console.log('starting fabric connection');
        const ccp = buildCCPOrg1();
        const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
        const wallet = await buildWallet(Wallets, walletPath);

        await enrollAdmin(caClient, wallet, mspOrg1);
        await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');

        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: org1UserId,
            discovery: { enabled: true, asLocalhost: true }
        });

        const network = await gateway.getNetwork(channelName);
        
        prescriptionContract = network.getContract('prescription');
        revocationRegistryContract = network.getContract('revocation-registry');
        trustedIssuerContract = network.getContract('trusted-issuer');
        
        console.log('connection established');
    } catch (error) {
        console.error(`fail: ${error}`);
        process.exit(1);
    }
}







const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    await initFabricConnection();
    console.log(`Servidor da API rodando na porta ${PORT}`);
});