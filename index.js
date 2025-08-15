const express = require("express");
const cors = require("cors");
require("dotenv").config();



// const client = require('./utils/honeyClient');

const {
  createEdgeClient,
  RewardKind,
  MintAsKind,
  ResourceStorageEnum,
} = require("@honeycomb-protocol/edge-client");

const { signTransaction, signer } = require("./helpers/transactions");
const userRoutes = require('./routes/users');
const adminRoutes = require("./routes/admin");
const { connectDB } = require("./utils/db");
const { addUserAuthToDb, getUserAuthFromDb } = require("./helpers/users");
const { logger } = require("./middleware/logger");
const dotenv = require("dotenv")
const API_URL = "https://edge.test.honeycombprotocol.com/";

const PROJECT_ADDRESS = "8Myc9f4fBVT3MNPobuV4CssNBBBDD5jmhzguwvArrZAY";
const RESOURCE_ADDRESS = "RF1giWg7uJ3y5Jo75TESDdwD3XWNZCL6t4jftkmkaKF";
const CHARACTER_ASSEMBLER_ADDRESS =
  "H3S7gzfi4u8GYvN4EqiaGjzGhLvacTaZvMkmfyZYYWkx";

const CHARACTER_MODEL_ADDRESS = "HiEqSXeRyVELBUvo8oMsSkipQuDqqNYbQUeqK6ivSiJN";

const MISSION_POOL_ADDRESS = "9FQCF5Hupe4kibhqvFS92XBoYQDAp32UhJbEoaLhXqa";

const MISSION_ADDRESS = "rBP8Zu2P1iA8atV4CfbnjoBLTefMXRcUDDKjtxY3BiZ";
const client = createEdgeClient(API_URL, true);

// import createEdgeClient from "@honeycomb-protocol/edge-client";
const PORT = process.env.PORT || 8000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(logger)


// Get the public key of the signer




app.post("/testMission", async (req, res) => {
  const { userPublicKey } = req.body;

  // const a = 846;           // number
  // const b = BN(846);

  //     const {
  //   authRequest: { message: authRequest }
  // } = await client.authRequest({
  //   wallet:userPublicKey
  // });

  // const encodedMessage = new TextEncoder().encode(authRequest);
  // // Sign the message
  // const signedUIntArray = await signer.signMessage(encodedMessage);
  // // Convert the signed message into a base58 encoded string
  // const signature = base58 .encode(signedUIntArray);
  // // Send the signed message to the server
  // const { authConfirm } = await client.authConfirm({ wallet: userPublicKey.toString(), signature });

  // const { createNewProfileTransaction: txResponse } =
  //   await client.createNewProfileTransaction(
  //     {
  //       project: projectAddress,
  //       info: {
  //         name: `Test profile`,
  //         bio: `This is a test profile`,
  //         pfp: "https://www.example.com/pfp.png",
  //       },
  //       payer: userPublicKey.toString(),
  //     },
  //     {
  //       fetchOptions: {
  //           headers: {
  //             authorization: `Bearer ${accessToken}`,
  //           },
  //         },
  //     }
  //   );
  //   const {
  //   createCreateNewResourceTreeTransaction: {
  //     treeAddress: merkleTreeAddress, // This is the merkle tree address once it'll be created
  //     tx: tx, // This is the transaction response, you'll need to sign and send this transaction
  //   },
  // } = await client.createCreateNewResourceTreeTransaction({
  //     project: PROJECT_ADDRESS.toString(),
  //     authority: adminPublicKey.toString(),
  //     payer: adminPublicKey.toString(), // Optional, specify when you want a different wallet to pay for the tx
  //     resource: RESOURCE_ADDRESS.toString(),
  //     treeConfig: {
  //       // Provide either the basic or advanced configuration, we recommend using the basic configuration if you don't know the exact values of maxDepth, maxBufferSize, and canopyDepth (the basic configuration will automatically configure these values for you)
  //       basic: {
  //         numAssets: 1000, // The desired number of resources this tree will be able to store
  //       },
  //       // Uncomment the following config if you want to configure your own profile tree (also comment out the above config)
  //       // advanced: {
  //       //   maxDepth: 20,
  //       //   maxBufferSize: 64,
  //       //   canopyDepth: 14,
  //       // }
  //     }
  // });

  // await signTransaction(tx)

  //   const {
  //   createMintResourceTransaction: txResponse // This is the transaction response, you'll need to sign and send this transaction
  // } = await client.createMintResourceTransaction({
  //     resource: RESOURCE_ADDRESS.toString(), // Resource public key as a string
  //     amount: "50", // Amount of the resource to mint
  //     authority: adminPublicKey.toString(), // Project authority's public key
  //     owner: userPublicKey.toString(), // The owner's public key, this wallet will receive the resource
  //     payer: adminPublicKey.toString(), // Optional, specify when you want a different wallet to pay for the tx
  // });

  //  = await client.createSendCharactersOnMissionTransaction({
  //   data: {
  //     // userId: 846,
  //     mission: "Av8C1qbtrq6rZpCDHgqnU5C9cnUr9te4q9RoHueiYwWe".toString(),
  //     characterAddresses: "6pWVH44Lcd41CD14BRWjhscrfQjd73AY45NBfK4ZuUMM".toString(),
  //     authority: signer.publicKey,
  //     payer: adminPublicKey.toString(), // Optiona
  //   },

  // },
  // {

  //   fetchOptions: {
  //     headers: {
  //       authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo4NDYsInVzZXJfYWRkcmVzcyI6IkJQVDJoYzJVYjF4Smh6RWpnNURCWUdNQ0dyVzNuVXZpbWhKYVZWZmhxRUJ3IiwiaWF0IjoxNzU1MTc0NjgzLCJleHAiOjE3NTUyNjEwODN9.BRza_NhSoQSmU89xbyMI9bJO0z-M578vHEHW1-rA0YYN9hxD5wmdzFeObGFqJfAGKxR2xZESUbe_rSQBuWN7iGsPyIUZ-VwG5AmGw-R6LM8GlwhDo1rzzHyp0u_dbvpvCbDA2zOnHb-25QfxIP6TpSq_lXZHbN--O0nV69mnCZuGqtVzvTFU80b20eEuIsUrwGad-OOiNlif0iAq6Sryyr97_jaFFYjbBxJnH77jhJ8NQC2ovBDBFR1uWmuaRuby0DFdn9_Dr4NDN9EMJU39qJXSt3odzXNBRsTAEQZa00Ju5AfgvD1vtMn4wGXpVw_zlMDJ29X9k-GRbxBbzafPeTSaC3nqDEXiNpTPid-Pyf_hMmlE4CNTHX7Tt07PQMJNzNttV_nTqpBlTPru9Fu1UOk3YjRiuVzf6efryTIauZbLpBOhLLTTWYxNORFOwTYeYm8JlLHD7chSr9y4Xu4nYNFhmO-EJsZHpd1_9tEpn-q9cTBJiQnMiopdmGwOZNl7C-VbywFkvC3k29bfJ3I-z3M8EY_FHJwBlCDBzyaZ0RBs1VJyar4TmnWQvGXwLLeI7MK91up17sNCVSEdXXJuurNPd7k2tArjC5NhdCsnMBy7Qsh1Se2mdX7XS2XycRZn-rHtJkQwC8yCTmixCv2f3qlZy9ASDrWtgATyj3o-ZvE`, // Required, you'll need to authenticate the user with our Edge Client and provide the resulting access token here, otherwise this operation will fail
  //     },
  //   },
  // }

  // )



   
  // const response = await signTransaction(txResponse);

  // const { createCreateMissionTransaction: { tx: txResponse } } =
  //       await client.createCreateMissionTransaction({
  //         name: "mylo",
  //         description: "hi",
  //         duration: 60,
  //         targetAmount: 3,
  //         resourceType: "22",
  //         rewardXP: "1",

  //         authority: signer,
  //         payer: adminPublicKey.toString()
  //       });

  // const response = await client.findMissions();

  //   const response = await client.fetchCharacterHistory({
  //   addresses: [ // Array of character addresses (Required)
  //     "6pWVH44Lcd41CD14BRWjhscrfQjd73AY45NBfK4ZuUMM".toString()
  //   ],

  // });

  // ""
  // user
  // :
  // {address: 'BPT2hc2Ub1xJhzEjg5DBYGMCGrW3nUvimhJaVVfhqEBw', id: 846, info: {…}, wallets: {…}}
  // [[Prototype]]
  // :
  // Object

  // )

  // character 3 6pWVH44Lcd41CD14BRWjhscrfQjd73AY45NBfK4ZuUMM

  // const { createUpdateUserTransaction: txResponse } =
  // await client.createUpdateUserTransaction(
  //   {
  //     payer: userPublicKey.toString(), // The public key of the user who is updating their information
  //     populateCivic: true, // Optional, set to true if you want to populate the Civic Pass information
  //     wallets: { // Optional, add or remove wallets from the user's Honeycomb Protocol account
  //       add: [newPublicKey], // Optional, add any wallets to the user's Honeycomb Protocol account
  //       remove: [oldPublicKey] // Optional, remove any wallets from the user's Honeycomb Protocol account
  //     },
  //     info: { // Optional, user's information
  //       bio: "Updated user bio", // Optional, updated user bio
  //       name: "Honeycomb Developer", // Optional, updated name
  //       pfp: "https://lh3.googleusercontent.com/-Jsm7S8BHy4nOzrw2f5AryUgp9Fym2buUOkkxgNplGCddTkiKBXPLRytTMXBXwGcHuRr06EvJStmkHj-9JeTfmHsnT0prHg5Mhg", // Optional, updated profile picture
  //     }
  //   },
  //   {
  //     fetchOptions: {
  //         headers: {
  //           authorization: `Bearer ${accessToken}`, // Required, you'll need to authenticate the user with our Edge Client and provide the resulting access token here, otherwise this operation will fail
  //         },
  //       },
  //   }
  // );

  // {accessToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkI…8U7vuad6rpePemS2KnGEBheQ1LucO5PVzfhWBevFWpYn8iGeo', user: {…}}

  //  const response= await client.findCharacters({

  //     // "6pWVH44Lcd41CD14BRWjhscrfQjd73AY45NBfK4ZuUMM"
  //     addresses: [], // String array of character addresses
  //     includeProof: true,
  //     filters: {}, // Available filters are usedBy, owner, and source
  //     mints: [], // Array of NFT mint public keys as a string
  //     trees: [], // Array of character model merkle tree public keys as a string
  //     wallets: ["3ykeDCgBc1mA983PN12pdL9f3JhBWXsEkjwXDhFwzuw9"], // Array of wallet public keys as a string (wallets that own the characters)
  //     attributeHashes: [] // Array of attribute hashes as a string
  //   });

  res.status(200).send({
    response: response,
  });
});



app.use('/user',userRoutes)

app.use("/admin", adminRoutes)





app.get("/", async (req, res) => {

  // const ress = await createProject();
  // console.log("Project created:", ress);
  // const response = await createProfileTree(ress.projectAddress);

});

app.listen(PORT, async () => {

  console.log("Server listening on port 8000");
});
