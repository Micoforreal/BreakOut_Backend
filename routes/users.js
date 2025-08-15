const express = require("express");
const {
  getUserProfile,
  addUserAuthToDb,
  updateUserLevel,
  getUserAuthFromDb,
} = require("../helpers/users");
const { signTransaction, adminPublicKey } = require("../helpers/transactions");
const client = require("../utils/honeyClient");
const {
  CHARACTER_ASSEMBLER_ADDRESS,
  CHARACTER_MODEL_ADDRESS,
  PROJECT_ADDRESS,
} = require("../utils/constants");

const router = express.Router();

router.post("/getCharacter", async (req, res) => {
  const { userPublicKey } = req.body; // Get the user public key from the request body

  const {
    createAssembleCharacterTransaction: txResponse,

    // This is the transaction response you'll need to sign and send
  } = await client.createAssembleCharacterTransaction(
    {
      project: PROJECT_ADDRESS.toString(), // Project public key as a string
      authority: adminPublicKey.toString(), // Authority public key as a string
      assemblerConfig: CHARACTER_ASSEMBLER_ADDRESS.toString(), // Assembler config address as a string
      characterModel: CHARACTER_MODEL_ADDRESS, // Character model public key as a string
      owner: userPublicKey.toString(), // User wallet public key as a string, this user will receive the character
      uri: "https://gateway.pinata.cloud/ipfs/bafybeiflcrsab4h5e5nfc4vfl2bag7qfb7svnnnp3lqtswejm62fkqtecm",
    },);

  const response = await signTransaction(txResponse);

  res
    .status(200)
    .send({ success: true, message: "Character Assembled", response });
});

router.post("/createProfile", async (req, res) => {
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

    await signTransaction(txResponse);
    const response = await getUserProfile(userPublicKey);

    res.status(200).send({
      response: response,
    });
  } catch (error) {
    res.status(400).send({
      message: "error occured",

      error
    });
  }
});

router.post("/updateLevel", async (req, res) => {
  const { level, userPublicKey } = req.body;

  try {
    const userData = await getUserProfile(userPublicKey);
    const profileAddress = userData[0].profileAddress;
    const id = userData[0].id;

    const auth = await getUserAuthFromDb(id);

    console.log(auth);
    const accessToken = auth.accessToken;

    console.log(userData);
    console.log(id);

    const updateRes = await updateUserLevel(level, profileAddress, accessToken);

    res.status(200).send({
      response: updateRes,
    });
  } catch (error) {
    console.log(error);

    res.status(400).send({
      response: error,
    });
  }
});

router.post("/addAchievement", async (req, res) => {
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

router.post("/recieveUserAuth", async (req, res) => {
  const { auth } = req.body;

  const result = await addUserAuthToDb(auth);

  res.status(200).send({
    result,
  });
});

router.post("/fetchProfile", async (req, res) => {
  const { userPublicKey } = req.body;

  const user = await getUserProfile(userPublicKey);

  if (user === "No user found") {
    res.status(200).send({
      message: "No user found",
    });
  } else {
    res.status(200).send({
      user,
    });
  }
});

module.exports = router;
