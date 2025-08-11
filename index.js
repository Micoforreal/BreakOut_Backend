const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require("path");
const fs = require("fs");
const web3 = require('@solana/web3.js');
const { sendTransactions } = require("@honeycomb-protocol/edge-client/client/helpers");

// const client = require('./utils/honeyClient');

const { createEdgeClient,RewardKind, MintAsKind  } = require('@honeycomb-protocol/edge-client');


const API_URL = "https://edge.test.honeycombprotocol.com/";


const PROJECT_ADDRESS = "12k6DG4GRDuW2CesDkec4hLJkEBV27b3ThwXELPpWZ6y";



const client = createEdgeClient(API_URL, true);


// import createEdgeClient from "@honeycomb-protocol/edge-client";




const app = express();
app.use(cors());
app.use(express.json());




const signer = web3.Keypair.fromSecretKey( // Create a keypair from the secret key to sign the transaction (only a keypair can sign a transaction, not just the private or public key)
  Uint8Array.from(
    JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "./keys", "myKeys.json"), "utf8") // Replace this with the path to your key file
    )
  )
);

const adminPublicKey = signer.publicKey; // Get the public key of the signer





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

}



const createProject = async (authorityPublicKey) => {
  
  const {
    createCreateProjectTransaction: {
      project: projectAddress, // This is the project address once it'll be created
      tx: txResponse, // This is the transaction response, you'll need to sign and send this transaction
    },
} = await client.createCreateProjectTransaction({
  name: "OutBreak", // Name of the project
  authority: authorityPublicKey, // Public key of the project authority, this authority has complete control over the project
  profileDataConfig: {
    achievements: [// Specify an array of achievements that you want to be able to set on your users' profiles
      "Soldier",
      "Slayer",
      "Hero",
      "Assassin",
    ],
    customDataFields: [ // Specify an array of custom data fields that you want to be able to set on your users' profiles
      "weapons",
      "xp", 
      "gold",
      "characters",
      "missionsCompleted",
      "questCompleted",
    
  
    ]
  }



});

  // Sign the transaction
  const signedTransaction = await signTransaction(txResponse);



  return{ projectAddress: projectAddress.toString(), transactionSignature: signedTransaction };


}





const creatCharacter = async ()=>{

  try {
    
    
    
    const {
      createCreateAssemblerConfigTransaction: {
      assemblerConfig: assemblerConfigAddress,
      tx 
    },
} = await client.createCreateAssemblerConfigTransaction({
  project: PROJECT_ADDRESS.toString(),
  authority: adminPublicKey.toString(),

  treeConfig: { // This tree is used to store character traits and their necessary information
    // Provide either the basic or advanced configuration, we recommend using the basic configuration if you don't know the exact values of maxDepth, maxBufferSize, and canopyDepth (the basic configuration will automatically configure these values for you)
    basic: {
      numAssets: 1000, // The desired number of character information this tree will be able to store
    },
    
  },
  ticker: "character-01", // Provide a unique ticker for the config (the ticker ID only needs to be unique within the project)
  order: [  "Clothes", "Armor", "Weapon"], // Optional, provide the character traits here; the order matters, in the example order, the background image will be applied and then the skin, expression, clothes, armor, weapon, and shield (if you need your character's expression to appear over the skin, the skin needs to come first in the order)
});


    // Sign the transaction
    await signTransaction(tx);



const {
  createCreateCharacterModelTransaction: {
    characterModel: characterModelAddress, // The address of the character model, this is the address that will be used to create characters
    tx: modelTx, 
    },
  } = await client.createCreateCharacterModelTransaction({
    project: PROJECT_ADDRESS.toString(),
    authority: adminPublicKey.toString(),
    payer: adminPublicKey.toString(), // Optional, use this if you want a different wallet to pay the transaction fee, by default the authority pays for this tx
  mintAs: { // Optional, you can define the underlying protocol, default is MplCore
    kind: MintAsKind.MplCore,

  },
  config: {
    kind: "Assembled",
    assemblerConfigInput: {
      assemblerConfig: assemblerConfigAddress.toString(),
      collectionName: "OutBreak collection",
      name: "captain jack",
      symbol: "OBCJ",
      description: "This is a character model for the OutBreak project",
      sellerFeeBasisPoints: 0,
      creators: [
        {
          address: adminPublicKey.toString(),
          share: 100,
            },
          ],
        },
      },
      
    });

        await signTransaction(modelTx);

    
    const {
      createCreateCharactersTreeTransaction: {
        treeAddress: charactersTreeAddress, // The address of the character model, this is the address that will be used to create characters
        tx: treeTx, // The transaction response, you'll need to sign and send this transaction
    },
  } = await client.createCreateCharactersTreeTransaction({
    authority: adminPublicKey.toString(),
  project: PROJECT_ADDRESS.toString(),
  characterModel: characterModelAddress.toString(),
  treeConfig: { 
    basic: {
      numAssets: 1000,
    },
    
  },
});






// Sign the transaction
const signedTransaction = await signTransaction(treeTx)

return {
  
  characterModelAddress: characterModelAddress.toString(),
  charactersTreeAddress: charactersTreeAddress.toString(),
  assemblerConfigAddress: assemblerConfigAddress.toString(),
  transactionSignature: signedTransaction[0].responses[0].signature, 
  
} 
} catch (error) {
  console.error("Error creating character:", error);
  return { error: error.message}
  
}
}




const assignCharacterToUser = async (characterModelAddress, userPublicKey ) =>{
   await client.createAssembleCharacterTransaction({
  project: PROJECT_ADDRESS.toString(), // Project public key as a string
  assemblerConfig: assemblerConfigAddress.toString(), // Assembler config address as a string
  characterModel: characterModelAddress.toString(), // Character model public key as a string
  wallet: userPublicKey.toString(), // User wallet public key as a string, this user will receive the character
  attributes: [ // Define the character's attributes here in string tuple format
    [  "Clothes", "Armor", "Weapon"]
  ],
});



await client.createPopulateCharacterTransaction({
  project: projectAddress.toString(),
  characterModel: characterModelAddress.toString(),
  mint: mintAddress.toString(),
  owner: userPublicKey.toString(),
  updateAuthority: adminPublicKey.toString(),
  attributes: [ // Optional attributes, provide the NFT's attributes here in string tuple format
    ["Weapon", "Bow"],
    ["Armor", "Helmet"],
  ],
});




await client.createWrapAssetsToCharacterTransactions({
  project: projectAddress.toString(),
  characterModel: characterModelAddress.toString(),
  wallet: userPublicKey.toString(),
  mintList: [ // Mint public keys as a string
    mintAddress.toString(),
  ]
});

  
}

    
    
const createMission = async ()=>{
      
      
      const {
        createCreateMissionPoolTransaction: {
          missionPoolAddress, // The address of the mission pool
          tx, // The transaction response, you'll need to sign and send this transaction
        },
      } = await client.createCreateMissionPoolTransaction({
        data: {
          name: "Test Mission Pool",
          project: projectAddress.toString(),
          payer: adminPublicKey.toString(),
          authority: adminPublicKey.toString(),
          characterModel: characterModelAddress.toString(),
        },
      });
      
      
      
      
      
      const {
        createCreateMissionTransaction: {
          missionAddress, // The address of the mission
          tx:txResponse// The transaction response, you'll need to sign and send this transaction
        },
      } = await client.createCreateMissionTransaction({
        data: {
          name: "Test mission",
          project: projectAddress.toString(),
          cost: {
            address: resourceAddress.toString(),
            amount: "100000",
          },
          duration: "86400", // 1 day
          minXp: "10", // Minimum XP required to participate in the mission
          rewards: [
            {
              kind: RewardKind.Xp,
              max: "100",
              min: "100",
            },
            {
              kind: RewardKind.Resource,
              max: "50000000", 
              min: "25000000", 
              resource: resourceAddress.toString(),
            },
          ],
          missionPool: missionPoolAddress.toString(),
          authority: adminPublicKey.toString(),
          payer: adminPublicKey.toString(),
        },
      });
      
}



app.get('/', async (req, res) => {
  // const response= await createProject()


  const response = await creatCharacter();
  
  
  res.send(response);
  
  
});

app.listen(8000, () => {
  console.log("Signer public key:", );
  console.log('Server listening on port 8000');
});