const {
  RESOURCE_ADDRESS,
  PROJECT_ADDRESS,
  MISSION_POOL_ADDRESS,
} = require("../utils/constants");
const client = require("../utils/honeyClient");
const { signTransaction, adminPublicKey } = require("./transactions");
const {
  createEdgeClient,
  RewardKind,
  MintAsKind,
  ResourceStorageEnum,
} = require("@honeycomb-protocol/edge-client");

const createMission = async (data) => {
  const {
    createCreateMissionTransaction: { missionAddress, tx: txResponse },
  } = await client.createCreateMissionTransaction({
    data: {
      name: data.objective,
      project: PROJECT_ADDRESS.toString(),

      cost: {
        address: RESOURCE_ADDRESS.toString(),
        amount: "0",
      },
      duration: data.duration, // 1 day
      minXp: "0",

      rewards: [
        {
          kind: RewardKind.Xp,
          max: data.rewardXp,
          min: data.rewardXp,
        },
      ],

      missionPool: MISSION_POOL_ADDRESS.toString(),
      authority: adminPublicKey.toString(),
      payer: adminPublicKey.toString(),
    },
  });

  const signedTransaction = await signTransaction(txResponse);


  // Return the original object plus the missionAddress
  return {
    ...data,
    missionAddress: missionAddress.toString(),
  };

};

module.exports = { createMission };
