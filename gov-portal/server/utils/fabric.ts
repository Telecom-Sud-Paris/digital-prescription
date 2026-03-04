import { Gateway, Wallets, type Contract } from 'fabric-network';
import FabricCAServices from 'fabric-ca-client';
import path from 'path';

import { buildCAClient, registerAndEnrollUser, enrollAdmin } from '#test-application/CAUtil.js'; 
import { buildCCPOrg1, buildWallet } from '#test-application/AppUtil.js';

const channelName = 'mychannel';
const mspOrg1 = 'Org1MSP';
const org1UserId = 'nuxt-user';

export let prescriptionContract: Contract;
export let revocationRegistryContract: Contract;
export let trustedIssuerContract: Contract;

export async function initFabricConnection() {
    try {
        console.log('Starting Fabric connection...');
        
        const ccp = buildCCPOrg1();
        const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
        
        const walletPath = path.join(process.cwd(), 'server', 'wallet');
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
        
        console.log('Fabric connection established successfully!');
    } catch (error) {
        console.error(`Failed to connect to Fabric: ${error}`);
        process.exit(1);
    }
}