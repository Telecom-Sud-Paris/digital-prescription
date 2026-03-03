'use strict';

module.exports = function(app, contracts) {
    const { prescriptionContract, revocationRegistryContract, trustedIssuerContract } = contracts;

    // ==========================================
    // PRESCRIPTION CONTRACT
    // ==========================================

    app.post('/api/prescriptions/register', async (req, res) => {
        try {
            const { id, issuerDID, refillCounter, expirationDate } = req.body;
            const result = await prescriptionContract.submitTransaction('createPrescription', id, issuerDID, refillCounter.toString(), expirationDate);
            
            res.status(201).json({
                message: 'Prescription registered successfully',
                data: JSON.parse(result.toString())
            });
        } catch (error) {
            console.error(`Error in /prescriptions/register: ${error}`);
            res.status(500).json({ error: error.message });
        }
    });

    app.post('/api/prescriptions/dispense', async (req, res) => {
        try {
            const { id, pharmacyDID, productLinkID } = req.body;
            const result = await prescriptionContract.submitTransaction('dispensePrescription', id, pharmacyDID, productLinkID);
            
            res.status(200).json({
                message: 'Prescription dispensed successfully',
                data: JSON.parse(result.toString())
            });
        } catch (error) {
            console.error(`Error in /prescriptions/dispense: ${error}`);
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/prescriptions/:id', async (req, res) => {
        try {
            const result = await prescriptionContract.evaluateTransaction('readPrescription', req.params.id);
            res.status(200).json(JSON.parse(result.toString()));
        } catch (error) {
            console.error(`Error in GET /prescriptions/:id: ${error}`);
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/prescriptions', async (req, res) => {
        try {
            const result = await prescriptionContract.evaluateTransaction('queryAllPrescriptions');
            res.status(200).json(JSON.parse(result.toString()));
        } catch (error) {
            console.error(`Error in GET /prescriptions: ${error}`);
            res.status(500).json({ error: error.message });
        }
    });


    // ==========================================
    // REVOCATION REGISTRY CONTRACT
    // ==========================================

    app.post('/api/revocation-registry/register', async (req, res) => {
        try {
            const { id, subject, issuer, credentialType, expirationDate, credentialHash } = req.body;
            const result = await revocationRegistryContract.submitTransaction('registerCredential', id, subject, issuer, credentialType, expirationDate || '', credentialHash || '');
            
            res.status(201).json({
                message: 'Credential registered in revocation registry',
                data: JSON.parse(result.toString())
            });
        } catch (error) {
            console.error(`Error in /revocation-registry/register: ${error}`);
            res.status(500).json({ error: error.message });
        }
    });

    app.post('/api/revocation-registry/revoke', async (req, res) => {
        try {
            const { id, reason } = req.body;
            const result = await revocationRegistryContract.submitTransaction('revokeCredential', id, reason || 'Unspecified');
            
            res.status(200).json({
                message: 'Credential revoked successfully',
                data: JSON.parse(result.toString())
            });
        } catch (error) {
            console.error(`Error in /revocation-registry/revoke: ${error}`);
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/revocation-registry/:id', async (req, res) => {
        try {
            const result = await revocationRegistryContract.evaluateTransaction('readCredential', req.params.id);
            res.status(200).json(JSON.parse(result.toString()));
        } catch (error) {
            console.error(`Error in GET /revocation-registry/:id: ${error}`);
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/revocation-registry/:id/validate', async (req, res) => {
        try {
            const result = await revocationRegistryContract.evaluateTransaction('validateCredential', req.params.id);
            res.status(200).json({ isValid: result.toString() === 'true' });
        } catch (error) {
            console.error(`Error in /revocation-registry/:id/validate: ${error}`);
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/revocation-registry', async (req, res) => {
        try {
            const result = await revocationRegistryContract.evaluateTransaction('queryAllCredentials');
            res.status(200).json(JSON.parse(result.toString()));
        } catch (error) {
            console.error(`Error in GET /revocation-registry: ${error}`);
            res.status(500).json({ error: error.message });
        }
    });


    // ==========================================
    // TRUSTED ISSUER CONTRACT
    // ==========================================

    app.post('/api/trust-registry/register', async (req, res) => {
        try {
            console.log(req.body);

            const { DID, role, addedBy } = req.body;
            const result = await trustedIssuerContract.submitTransaction('registerIssuer', DID, role, addedBy);
            
            res.status(201).json({
                message: 'Trusted issuer registered',
                data: JSON.parse(result.toString())
            });
        } catch (error) {
            console.error(`Error in /trust-registry/register: ${error}`);
            res.status(500).json({ error: error.message });
        }
    });

    app.post('/api/trust-registry/revoke', async (req, res) => {
        try {
            const { DID } = req.body;
            const result = await trustedIssuerContract.submitTransaction('revokeIssuer', DID);
            
            res.status(200).json({
                message: 'Trusted issuer revoked',
                data: JSON.parse(result.toString())
            });
        } catch (error) {
            console.error(`Error in /trust-registry/revoke: ${error}`);
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/trust-registry/:did', async (req, res) => {
        try {
            const result = await trustedIssuerContract.evaluateTransaction('readIssuer', req.params.did);
            res.status(200).json(JSON.parse(result.toString()));
        } catch (error) {
            console.error(`Error in GET /trust-registry/:did: ${error}`);
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/trust-registry', async (req, res) => {
        try {
            const result = await trustedIssuerContract.evaluateTransaction('queryAllIssuers');
            res.status(200).json(JSON.parse(result.toString()));
        } catch (error) {
            console.error(`Error in GET /trust-registry: ${error}`);
            res.status(500).json({ error: error.message });
        }
    });
};