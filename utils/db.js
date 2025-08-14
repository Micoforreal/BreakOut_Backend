// db.js

const { MongoClient } = require("mongodb");


const uri = "mongodb+srv://outbreakdb:IXRF2Xfb8mKhSZGP@cluster0.gfxdn.mongodb.net/outbreak?retryWrites=true&w=majority";

const client = new MongoClient(uri);

let db;
 async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db("mydatabase"); // choose database name
    console.log("✅ MongoDB connected");
  }
  return db;
}

module.exports = {connectDB}
