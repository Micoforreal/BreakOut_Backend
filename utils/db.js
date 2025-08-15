// db.js
const dotenv = require("dotenv")
const { MongoClient } = require("mongodb");
dotenv.config();



const uri =  process.env.MONGODB ||"";
const client = new MongoClient(uri);

let db;
 async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db("outbreakdb"); // choose database name
    console.log("✅ MongoDB connected");
  }
  return db;
}

module.exports = {connectDB}
