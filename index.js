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
  ResourceStorageEnum,
} = require("@honeycomb-protocol/edge-client");
const { profile } = require("console");
const { BN } = require("bn.js");

const API_URL = "https://edge.test.honeycombprotocol.com/";

const PROJECT_ADDRESS = "8Myc9f4fBVT3MNPobuV4CssNBBBDD5jmhzguwvArrZAY";
const RESOURCE_ADDRESS = "RF1giWg7uJ3y5Jo75TESDdwD3XWNZCL6t4jftkmkaKF";
const CHARACTER_ASSEMBLER_ADDRESS =
  "H3S7gzfi4u8GYvN4EqiaGjzGhLvacTaZvMkmfyZYYWkx";

const CHARACTER_MODEL_ADDRESS = "HiEqSXeRyVELBUvo8oMsSkipQuDqqNYbQUeqK6ivSiJN";

const MISSION_POOL_ADDRESS = "9FQCF5Hupe4kibhqvFS92XBoYQDAp32UhJbEoaLhXqa";

const MISSION_ADDRESS = "E7jVyKaiKYW3zEcyJQzrdmRukQXVvAT8W2ZquWrDnDnM";
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
        basic: {
          numAssets: 1000, // The desired number of character information this tree will be able to store
        },
      },
      ticker: "new_character", // Provide a unique ticker for the config (the ticker ID only needs to be unique within the project)
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
      payer: adminPublicKey.toString(),

      // Optional, use this if you want a different wallet to pay the transaction fee, by default the authority pays for this tx
      mintAs: {
        // Optional, you can define the underlying protocol, default is MplCore
        kind: MintAsKind.MplCore,
      },
      config: {
        kind: "Assembled",
        assemblerConfigInput: {
          assemblerConfig: assemblerConfigAddress.toString(),
          collectionName: "OutBreak characters",
          name: "captain jack",
          symbol: "NOBC",
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

    const signedTransaction = await signTransaction(modelTx);

    // const {
    //   createCreateCharactersTreeTransaction: {
    //     treeAddress: charactersTreeAddress, // The address of the character model, this is the address that will be used to create characters
    //     tx: treeTx, // The transaction response, you'll need to sign and send this transaction
    //   },
    // } = await client.createCreateCharactersTreeTransaction({
    //   authority: adminPublicKey.toString(),
    //   project: PROJECT_ADDRESS.toString(),
    //   characterModel: characterModelAddress.toString(),
    //   treeConfig: {
    //     basic: {
    //       numAssets: 1000,
    //     },
    //   },
    // });

    // Sign the transaction
    // const signedTransaction = await signTransaction(treeTx);

    res.status(200).send({
      characterModelAddress: characterModelAddress.toString(),
      // charactersTreeAddress: charactersTreeAddress.toString(),
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

  const {
    createAssembleCharacterTransaction: txResponse,

    // This is the transaction response you'll need to sign and send
  } = await client.createAssembleCharacterTransaction({
    project: PROJECT_ADDRESS.toString(), // Project public key as a string
    authority: adminPublicKey.toString(), // Authority public key as a string
    assemblerConfig: CHARACTER_ASSEMBLER_ADDRESS.toString(), // Assembler config address as a string
    characterModel: CHARACTER_MODEL_ADDRESS.toString(), // Character model public key as a string
    owner: userPublicKey.toString(), // User wallet public key as a string, this user will receive the character
    uri: "https://gateway.pinata.cloud/ipfs/bafybeiflcrsab4h5e5nfc4vfl2bag7qfb7svnnnp3lqtswejm62fkqtecm",
  });

  const response = await signTransaction(txResponse);

  res
    .status(200)
    .send({ success: true, message: "Character Assembled", response });
});

app.post("/testMission", async (req, res) => {
  // const { userPublicKey } = req.body;

  // const a = 846;           // number
  // const b = BN(846);

  const response = await client.createSendCharactersOnMissionTransaction({
    data: {
      userId: 846,
      mission: MISSION_ADDRESS.toString(),
      characterAddresses: ["GdGi7yorx1dyCXRWpkHy9rVf5KhvhTkEtEmTdu9mepr8"],
      authority: adminPublicKey.toString(),

      payer: adminPublicKey.toString(), // Optiona
    },
  });

  // await client.findCharacters({

  //   // "6pWVH44Lcd41CD14BRWjhscrfQjd73AY45NBfK4ZuUMM"
  //   addresses: [], // String array of character addresses
  //   includeProof: true,
  //   filters: {}, // Available filters are usedBy, owner, and source
  //   mints: [], // Array of NFT mint public keys as a string
  //   trees: [], // Array of character model merkle tree public keys as a string
  //   wallets: ["3ykeDCgBc1mA983PN12pdL9f3JhBWXsEkjwXDhFwzuw9"], // Array of wallet public keys as a string (wallets that own the characters)
  //   attributeHashes: [] // Array of attribute hashes as a string
  // });

  res.status(200).send({
    response: response,
  });
});

app.post("/createResource", async (req, res) => {
  const {
    createCreateNewResourceTransaction: {
      resource: resourceAddress, // This is the resource address once it'll be created
      tx: txResponse, // This is the transaction response, you'll need to sign and send this transaction
    },
  } = await client.createCreateNewResourceTransaction({
    project: PROJECT_ADDRESS.toString(),
    authority: adminPublicKey.toString(),
    params: {
      name: "Gold",
      decimals: 2, // Number of decimal places the resource can be divided into
      symbol: "GOLD", // Symbol of the resource
      uri: "https://gateway.pinata.cloud/ipfs/bafkreifviodz6mglbjunbgdy5zpfkgr5scf36uumpsc5by2zkhvbsqr5ri", // URI of the resource
      storage: ResourceStorageEnum.LedgerState, // Type of the resource, can be either AccountState (uncompressed/unwrapped) or LedgerState (compressed/wrapped)
    },
  });

  const signedTransaction = await signTransaction(txResponse);

  res.status(200).send({
    resourceAddress: resourceAddress.toString(),
    transaction: signedTransaction[0].responses,
  });
});

app.post("/createMissions", async (req, res) => {
  try {
    // const {
    //   createCreateMissionPoolTransaction: { missionPoolAddress, tx },
    // } = await client.createCreateMissionPoolTransaction({
    //   data: {
    //     name: "Test Mission Pool",
    //     project: PROJECT_ADDRESS.toString(),
    //     payer: adminPublicKey.toString(),
    //     authority: adminPublicKey.toString(),
    //     characterModel: CHARACTER_MODEL_ADDRESS.toString(),
    //   },
    // });

    //  await signTransaction(tx);

    const {
      createCreateMissionTransaction: { missionAddress, tx: txResponse },
    } = await client.createCreateMissionTransaction({
      data: {
        name: "test mission4",
        project: PROJECT_ADDRESS.toString(),

        cost: {
          address: RESOURCE_ADDRESS.toString(),
          amount: "0",
        },
        duration: "0", // 1 day
        minXp: "0",
        rewards: [
          {
            kind: RewardKind.Xp,
            max: "10",
            min: "10",
          },
        ],

        missionPool: MISSION_POOL_ADDRESS.toString(),
        authority: adminPublicKey.toString(),
        payer: adminPublicKey.toString(),
      },
    });

    const signedTransaction = await signTransaction(txResponse);

    res.status(200).send({
      // missionPoolAddress: missionPoolAddress.toString(),
      missionAddress: missionAddress.toString(),
      transaction: signedTransaction[0].responses,
    });
  } catch (error) {
    console.error("Error creating mission:", error);
    res.status(500).send({ error: error.message });
  }
});

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

app.post("/createUserProfile", async (req, res) => {
  const { fullName, userPublicKey } = req.body;

  try {
    const {
      createNewUserWithProfileTransaction: txResponse, // This is the transaction response, you'll need to sign and send this transaction
    } = await client.createNewUserWithProfileTransaction({
      project: PROJECT_ADDRESS,
      wallet: userPublicKey.toString(),
      profileIdentity: "main",
      userInfo: {
        name: fullName,
        bio: "",
        pfp: "",
      },
      payer: adminPublicKey.toString(),
    });

    const response = await signTransaction(txResponse);

    res.status(200).send({
      response: response,
    });
  } catch (error) {

    
    res.status(400).send({
      message:"error occured"
    });


  }
});

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

  res.status(200).send({
    success: true,
    message: "Achievement added successfully",
    response,
  });
});

app.get("/", async (req, res) => {
  // const response= await createProject()
  // const ress = await createProject();
  // console.log("Project created:", ress);
  // const response = await createProfileTree(ress.projectAddress);
  // res.send({ w: ress, e: response });
});

app.listen(8000, () => {
  console.log("Signer public key:");
  console.log("Server listening on port 8000");
});
