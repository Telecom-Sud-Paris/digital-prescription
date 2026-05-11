
### deployment

1. curl -sSLO https://raw.githubusercontent.com/hyperledger/fabric/main/scripts install-fabric.sh && chmod +x install-fabric.sh

2. ./install-fabric.sh docker binary

3. cd test-network

4. ./network.sh up createChannel -ca

5. ./network.sh deployCC -ccn prescription \
  -ccp ../chaincode/prescription-contract \
  -ccv 1.0 \
  -ccl javascript \
  -ccs 1

  ./network.sh deployCC -ccn trusted-issuer \
  -ccp ../chaincode/trusted-issuer-contract \
  -ccv 1.0 \
  -ccl javascript \
  -ccs 1

  ./network.sh deployCC -ccn revocation-registry \
  -ccp ../chaincode/revocation-registry-contract \
  -ccv 1.0 \
  -ccl javascript \
  -ccs 1

6. cd gov-portal

7. npm install

8. npm run dev

9. ngrok http 8000

10. .env at gov-portal:
    NGROK_URL=https://unsulfureous-caesalpiniaceous-leesa.ngrok-free.dev
    DT_API_URL=http://localhost:3000