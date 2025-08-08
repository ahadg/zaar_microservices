const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = async () => {
  try {
    console.log(process.env.MONGO_URI)
    await mongoose.connect(process.env.MONGO_URI, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    console.log("Database connected successfully");
  } catch (error) {
    console.error("UNABLE TO CONNECT TO DATABASE \n", error);
    process.exit(1);
  }
};

module.exports = connectDB;
