const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const fs = require("fs");
const web3 = require("@solana/web3.js");
const {
  sendTransactions,
} = require("@honeycomb-protocol/edge-client/client/helpers");

// const client = require('./utils/honeyClient');

const {
  createEdgeClient,
  RewardKind,
  MintAsKind,
} = require("@honeycomb-protocol/edge-client");
const { profile } = require("console");

const API_URL = "https://edge.test.honeycombprotocol.com/";

const PROJECT_ADDRESS = "8Myc9f4fBVT3MNPobuV4CssNBBBDD5jmhzguwvArrZAY";

const CHARACTER_ASSEMBLER_ADDRESS =
  "FXoeEU1T6FCP7SSNNGVbKjkkaPCngU9e4i2fWxw2fzM8";

const CHARACTER_MODEL_ADDRESS = "C5yMSkEAfd7CEGni5kAFJXbuRbeUGHAX31toRaDsB7AH";

const client = createEdgeClient(API_URL, true);

// import createEdgeClient from "@honeycomb-protocol/edge-client";

const app = express();
app.use(cors());
app.use(express.json());

const signer = web3.Keypair.fromSecretKey(
  // Create a keypair from the secret key to sign the transaction (only a keypair can sign a transaction, not just the private or public key)
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
};

const createProject = async () => {
  const {
    createCreateProjectTransaction: {
      project: projectAddress, // This is the project address once it'll be created
      tx: txResponse, // This is the transaction response, you'll need to sign and send this transaction
    },
  } = await client.createCreateProjectTransaction({
    name: "OutBreak", // Name of the project
    authority: adminPublicKey, // Public key of the project authority, this authority has complete control over the project
    profileDataConfig: {
      achievements: [
        // Specify an array of achievements that you want to be able to set on your users' profiles
        "Soldier",
        "Slayer",
        "Hero",
        "Assassin",
      ],
      customDataFields: [
        // Specify an array of custom data fields that you want to be able to set on your users' profiles
        "weapons",
        "xp",
        "gold",
        "characters",
        "missionsCompleted",
        "questCompleted",
      ],
    },
  });

  // Sign the transaction
  const signedTransaction = await signTransaction(txResponse);

  return {
    projectAddress: projectAddress.toString(),
    transactionSignature: signedTransaction,
  };
};

app.post("/createCharacter", async (req, res) => {
  try {
    const {
      createCreateAssemblerConfigTransaction: {
        assemblerConfig: assemblerConfigAddress,
        tx,
      },
    } = await client.createCreateAssemblerConfigTransaction({
      project: PROJECT_ADDRESS.toString(),
      authority: adminPublicKey.toString(),

      treeConfig: {
        // This tree is used to store character traits and their necessary information
        // Provide either the basic or advanced configuration, we recommend using the basic configuration if you don't know the exact values of maxDepth, maxBufferSize, and canopyDepth (the basic configuration will automatically configure these values for you)
        basic: {
          numAssets: 1000, // The desired number of character information this tree will be able to store
        },
      },
      ticker: "new-character", // Provide a unique ticker for the config (the ticker ID only needs to be unique within the project)
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
      mintAs: {
        // Optional, you can define the underlying protocol, default is MplCore
        kind: MintAsKind.MplCore,
      },
      config: {
        kind: "Assembled",
        assemblerConfigInput: {
          assemblerConfig: assemblerConfigAddress.toString(),
          collectionName: "OutBreak collection",
          name: "captain jack",
          symbol: "NOBCJ",
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
    const signedTransaction = await signTransaction(treeTx);

    res.status(200).send({
      characterModelAddress: characterModelAddress.toString(),
      charactersTreeAddress: charactersTreeAddress.toString(),
      assemblerConfigAddress: assemblerConfigAddress.toString(),
      transactionSignature: signedTransaction[0].responses[0].signature,
    });
  } catch (error) {
    console.error("Error creating character:", error);
    res.status(500).send({ error: error.message });
  }
});

app.post("/userCharacter", async (req, res) => {
  const { userPublicKey } = req.body; // Get the user public key from the request body

  // const {
    
  //   createAssembleCharacterTransaction: txResponse, 

  //   // This is the transaction response you'll need to sign and send
  // } 
  
  const response
  = await client.createAssembleCharacterTransaction({
    project: PROJECT_ADDRESS.toString(), // Project public key as a string
    authority: adminPublicKey.toString(), // Authority public key as a string
    assemblerConfig: CHARACTER_ASSEMBLER_ADDRESS.toString(), // Assembler config address as a string
    characterModel: CHARACTER_MODEL_ADDRESS.toString(), // Character model public key as a string
    owner: userPublicKey.toString(), // User wallet public key as a string, this user will receive the character
    uri: "https://gateway.pinata.cloud/ipfs/bafybeiflcrsab4h5e5nfc4vfl2bag7qfb7svnnnp3lqtswejm62fkqtecm",
  });

  // const response = await signTransaction(txResponse);

  res
    .status(200)
    .send({ success: true, message: "Character Assembled", response });
});




const createMission = async () => {
  // const {
  //   createCreateMissionPoolTransaction: {
  //     missionPoolAddress, // The address of the mission pool
  //     tx, // The transaction response, you'll need to sign and send this transaction
  //   },
  // } = await client.createCreateMissionPoolTransaction({
  //   data: {
  //     name: "Test Mission Pool",
  //     project: projectAddress.toString(),
  //     payer: adminPublicKey.toString(),
  //     authority: adminPublicKey.toString(),
  //     characterModel: CHARACTER_MODEL_ADDRESS.toString(),
  //   },
  // });

  const {
    createCreateMissionTransaction: {
      missionAddress, // The address of the mission
      tx: txResponse, // The transaction response, you'll need to sign and send this transaction
    },
  } = await client.createCreateMissionTransaction({
    data: {
      name: "Test mission",
      project: PROJECT_ADDRESS.toString(),
      cost: {
        address: resourceAddress.toString(),
        amount: "1",
      },
      duration: "86400", // 1 day
      minXp: "1", // Minimum XP required to participate in the mission
      
      authority: adminPublicKey.toString(),

    },
  });
};

const createProfileTree = async (projectAddress) => {
  try {
    const {
      createCreateProfilesTreeTransaction: {
        treeAddress,
        tx: txResponse, // This is the transaction response, you'll need to sign and send this transaction
      },
    } = await client.createCreateProfilesTreeTransaction({
      payer: adminPublicKey.toString(),
      project: projectAddress.toString(),
      treeConfig: {
        // Provide either the basic or advanced configuration, we recommend using the basic configuration if you don't know the exact values of maxDepth, maxBufferSize, and canopyDepth (the basic configuration will automatically configure these values for you)
        basic: {
          numAssets: 1000, // The desired number of profiles this tree will be able to store
        },
      },
    });

    const signedTransaction = await signTransaction(txResponse);

    return {
      profileTreeAddress: treeAddress.toString(),
      transactionSignature: signedTransaction,
    };
  } catch (error) {
    console.error("Error creating profile tree:", error);
    return { error: error.message };
  }
};

app.post("/addAchievement", async (req, res) => {
  console.log("Adding achievement...");

  const { profileAddress, xp } = req.body; // Get the profile address and admin public key from the request body

  const { createUpdatePlatformDataTransaction: txResponse } =
    await client.createUpdatePlatformDataTransaction({
      profile: profileAddress.toString(), // The profile's public key
      authority: adminPublicKey.toString(), // The public key of the project authority
      platformData: {
        addXp: xp, // Optional, how much XP to award to the player
      },
    });

  const response = await signTransaction(txResponse);

  res
    .status(200)
    .send({
      success: true,
      message: "Achievement added successfully",
      response,
    });
});

app.get("/", async (req, res) => {
  // const response= await createProject()

  const ress = await createProject();

  console.log("Project created:", ress);
  const response = await createProfileTree(ress.projectAddress);

  res.send({ w: ress, e: response });
});

app.listen(8000, () => {
  console.log("Signer public key:");
  console.log("Server listening on port 8000");
});
