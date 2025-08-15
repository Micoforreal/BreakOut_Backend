const { PROJECT_ADDRESS } = require("../utils/constants");
const { connectDB } = require("../utils/db");
const client = require("../utils/honeyClient");
const { adminPublicKey, signTransaction } = require("./transactions");



 const getUserProfile = async (publicKey) => {


  const user = await client
  .findUsers({
    wallets: [publicKey.toString()], // String array of users' wallet addresses
    addresses: [],
    ids: [],
    includeProof: true,
  })
  .then(({ user }) => user);
  if (user.length > 0) {

    
    const characterArray = await client
    .findCharacters({
      addresses: [],
      includeProof: true,
      filters: {},
      mints: [],
      trees: [],
      wallets: [publicKey.toString()], // Array of wallet public keys as a string (wallets that own the characters)
      attributeHashes: [], // Array of attribute hashes as a string
    })
    .then(({ character }) => character);
    
    const usersArray = await client
    .findProfiles({
      userIds: [user[0].id],
      projects: [PROJECT_ADDRESS], // String array of project addresses
      addresses: [],
      identities: [],
      includeProof: true,
    })
    .then(({ profile }) => profile);
    
    return userData = [
      {
        id: user[0].id,
        profileAddress:usersArray[0].address,
        userAddress: usersArray[0].address,
        fullName: usersArray[0].info.name,
        level: Number(usersArray[0]?.customData?.level) || null,
        xp: usersArray[0].platformData.xp,
        characterAddress: characterArray[0]?.address,
      },
    ];
  }else{
    return "No user found";
    
  }
};





 const addUserAuthToDb = async (auth) => {

  try {
    
    const db = await connectDB()
    const collection = db.collection("myCollection");
    
    const result = await collection.insertOne(auth);
    
    
    return result
  } catch (error) {

    console.log(error)
    
  }


  
}


const getUserAuthFromDb = async (userId) => {

    const db = await connectDB()
    const collection = db.collection("myCollection");
   
    const auth = await collection.findOne({  "user.id": userId });
   
    
    return auth
}


const updateUserLevel = async (level, profileAddress , accessToken)  => {



  const {
    createUpdateProfileTransaction: txResponse,
  } = // This is the transaction response, you'll need to sign and send this transaction
    await client.createUpdateProfileTransaction(
      {
        payer: adminPublicKey.toString(),
        profile: profileAddress.toString(),

        customData: {
          add: {
            level: [level],
          },
        },
      },
      {
        fetchOptions: {
          headers: {
            authorization: `Bearer ${accessToken}` },
        },
      }
    );


   const  res =await signTransaction(txResponse)

   return res



 

  
}



module.exports ={updateUserLevel,addUserAuthToDb,getUserProfile,getUserAuthFromDb}