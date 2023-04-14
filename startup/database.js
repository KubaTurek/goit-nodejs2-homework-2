const mongoose = require("mongoose");

const dbPath = process.env.MONGO_SECRET;

if (!dbPath) {
  console.error("No db secret");
}

const connectToMongo = async () => {
  try {
    await mongoose.connect(dbPath);
    console.log("Database connection successful");
  } catch (error) {
    console.log("Database connection error");
    process.exit(1);
  }
};

module.exports = {
  connectToMongo,
};
