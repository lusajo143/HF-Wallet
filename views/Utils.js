import { Gateway, Wallets } from '../node_modules/fabric-network'
import { FabricCAServices } from  '../node_modules/fabric-ca-client'

function buildCAClient(ccp, caHostName) {
	// Create a new CA client for interacting with the CA.
    
	const caInfo = ccp.certificateAuthorities[caHostName]; //lookup CA details from config
	const caTLSCACerts = caInfo.tlsCACerts.pem;
	const caClient = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

	console.log(`Built a CA Client named ${caInfo.caName}`);
	return caClient;
};


async function buildWallet() {
	// Create a new  wallet : Note that wallet is for managing identities.
	let wallet = await Wallets.newInMemoryWallet();
	return wallet;
};

exports.getContract = async() => {
    try {
        caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
        wallet = await buildWallet(Wallets, walletPath);

        const gateway = new Gateway();

        try {
            await gateway.connect(ccp, {
                wallet,
                identity: user,
                discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
            });

            const network = await gateway.getNetwork(channelName);

            contract = network.getContract(chaincodeName);

            return network.getContract(chaincodeName);

        } catch (error) {
            console.log(error);
        }
    } catch (error) {
        console.log(error);
    }
} 


