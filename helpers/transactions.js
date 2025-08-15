const web3 = require("@solana/web3.js");
const path = require("path");
const fs = require("fs");
const {
  sendTransactions,
} = require("@honeycomb-protocol/edge-client/client/helpers");
const client = require("../utils/honeyClient");


const signer = web3.Keypair.fromSecretKey(
  // Create a keypair from the secret key to sign the transaction (only a keypair can sign a transaction, not just the private or public key)
  Uint8Array.from(
    JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "../keys", "myKeys.json"), "utf8") // Replace this with the path to your key file
    )
  )
);

const adminPublicKey = signer.publicKey; 


const signTransaction = async (transaction) => {
  try {
    const response = await sendTransactions(
      client,
      {
        transactions: [transaction.transaction],
        blockhash: transaction.blockhash,
        lastValidBlockHeight: transaction.lastValidBlockHeight,
      },
      [signer]
    );
    return response;
  } catch (error) {
    throw new Error(`Transaction signing failed: ${error.message}`);
  }
};


module.exports ={signTransaction,adminPublicKey,signer}