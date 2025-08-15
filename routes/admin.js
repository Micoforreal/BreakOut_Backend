const express = require("express");
const { signTransaction, signer, adminPublicKey} = require("../helpers/transactions");
const client = require("../utils/honeyClient");
const router = express.Router()

const {
  createEdgeClient,
  RewardKind,
  MintAsKind,
  ResourceStorageEnum,
} = require("@honeycomb-protocol/edge-client");
const { PROJECT_ADDRESS, CHARACTER_MODEL_ADDRESS, RESOURCE_ADDRESS, MISSION_POOL_ADDRESS } = require("../utils/constants");
const { createMission } = require("../helpers/admin");






router.post("/createProject", async (req, res) => {
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
});




router.post("createMissionPool", async (req, res) => {

      const {
      createCreateMissionPoolTransaction: { missionPoolAddress, tx },
    } = await client.createCreateMissionPoolTransaction({
      data: {
        name: "Test Mission Pool",
        project: PROJECT_ADDRESS.toString(),
        payer: adminPublicKey.toString(),
        authority: adminPublicKey.toString(),
        characterModel: CHARACTER_MODEL_ADDRESS.toString(),
      },
    });

    const signedTransaction=  await signTransaction(tx);

     
    
    res.status(200).send({
       missionPoolAddress: missionPoolAddress.toString(),
      transaction: signedTransaction[0].responses,

})
    
})



router.post("/createMissions", async (req, res) => {
const LevelData = [
   { level: 4, enemies: 5, objective: "defeat 4 aliens in 45 seconds", missionAddress: "", timed: true, duration: "45", rewardXp: "7", rewardGold: "0" },
  { level: 5, enemies: 5, objective: "eliminate all aliens guarding the bridge", missionAddress: "", timed: false, duration: "0", rewardXp: "10", rewardGold: "0" },
]

  
  try {
  
    const updatedLevels = [];
    for (const level of LevelData) {
      const updated = await createMission(level);
      updatedLevels.push(updated);
    }
    
    
    res.status(200).send({
      level:updatedLevels

      // // missionPoolAddress: missionPoolAddress.toString(),
      // missionAddress: missionAddress.toString(),
      // // transaction: signedTransaction[0].responses,
    });
  } catch (error) {
    console.error("Error creating mission:", error);
    res.status(500).send({ error: error.message });
  }
});




router.post("/createResource", async (req, res) => {
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






router.post("createProfileTree", async (req, res) => {

   const {projectAddress}= req.body
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

     res.status(200).send({
      profileTreeAddress: treeAddress.toString(),
      transactionSignature: signedTransaction,
    });
  } catch (error) {
    console.error("Error creating profile tree:", error);
    return { error: error.message };
  }
});




router.post("/createCharacter", async (req, res) => {

  try {
    // const {
    //   createCreateAssemblerConfigTransaction: {
    //     assemblerConfig: assemblerConfigAddress,
    //     tx,
    //   },
    // } = await client.createCreateAssemblerConfigTransaction({
    //   project: PROJECT_ADDRESS.toString(),
    //   authority: adminPublicKey.toString(),

    //   treeConfig: {
    //     basic: {
    //       numAssets: 1000, // The desired number of character information this tree will be able to store
    //     },
    //   },
    //   ticker: "new_character4", // Provide a unique ticker for the config (the ticker ID only needs to be unique within the project)
    // });

    // Sign the transaction
    // await signTransaction(tx);

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
          assemblerConfig: CHARACTER_ASSEMBLER_ADDRESS.toString(),
          collectionName: "OutBreak characters",
          name: "captain jack",
          symbol: "NOBC",
          description: "This is a character model for the OutBreak project",
          sellerFeeBasisPoints: 0,
          creators: [
            {
              address: adminPublicKey.toString(),
              share: 50,
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




module.exports =router