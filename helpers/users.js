const client = require("../utils/honeyClient");



 const getUserProfile = async (publicKey) => {

  const user = await client
  .findUsers({
    wallets: [publicKey.toString()], // String array of users' wallet addresses
    addresses: [],
    ids: [],
    includeProof: true,
  })
  .then(({ user }) => user);
  if (uses.length > 0) {

    
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
        id: usersArray[0].id,
        profileAddress:usersArray[0].address,
        userAddress: usersArray[0].address,
        fullName: usersArray[0].info.name,
        level: Number(usersArray[0].customData.level[0]),
        xp: usersArray[0].platformData.xp,
        characterAddress: characterArray[0].address,
      },
    ];
  }else{
    throw new Error("user not found");
    
  }
};





 const addUserAuthToDb = async (auth) => {

  
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
            authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo4NDYsInVzZXJfYWRkcmVzcyI6IkJQVDJoYzJVYjF4Smh6RWpnNURCWUdNQ0dyVzNuVXZpbWhKYVZWZmhxRUJ3IiwiaWF0IjoxNzU1MTc0NjgzLCJleHAiOjE3NTUyNjEwODN9.BRza_NhSoQSmU89xbyMI9bJO0z-M578vHEHW1-rA0YYN9hxD5wmdzFeObGFqJfAGKxR2xZESUbe_rSQBuWN7iGsPyIUZ-VwG5AmGw-R6LM8GlwhDo1rzzHyp0u_dbvpvCbDA2zOnHb-25QfxIP6TpSq_lXZHbN--O0nV69mnCZuGqtVzvTFU80b20eEuIsUrwGad-OOiNlif0iAq6Sryyr97_jaFFYjbBxJnH77jhJ8NQC2ovBDBFR1uWmuaRuby0DFdn9_Dr4NDN9EMJU39qJXSt3odzXNBRsTAEQZa00Ju5AfgvD1vtMn4wGXpVw_zlMDJ29X9k-GRbxBbzafPeTSaC3nqDEXiNpTPid-Pyf_hMmlE4CNTHX7Tt07PQMJNzNttV_nTqpBlTPru9Fu1UOk3YjRiuVzf6efryTIauZbLpBOhLLTTWYxNORFOwTYeYm8JlLHD7chSr9y4Xu4nYNFhmO-EJsZHpd1_9tEpn-q9cTBJiQnMiopdmGwOZNl7C-VbywFkvC3k29bfJ3I-z3M8EY_FHJwBlCDBzyaZ0RBs1VJyar4TmnWQvGXwLLeI7MK91up17sNCVSEdXXJuurNPd7k2tArjC5NhdCsnMBy7Qsh1Se2mdX7XS2XycRZn-rHtJkQwC8yCTmixCv2f3qlZy9ASDrWtgATyj3o-ZvE`, // Required, you'll need to authenticate the user with our Edge Client and provide the resulting access token here, otherwise this operation will fail
          },
        },
      }
    );


   const  res =await signTransaction(txResponse)

   return res



 

  
}



module.exports ={updateUserLevel,addUserAuthToDb,getUserProfile}