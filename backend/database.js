import mongoose from "mongoose";

// define mongodb connection string from env file
const mongodbString = process.env.MONGODB_CONNECT_STRING;

// try to connect to DB asynchronously
const connectToDatabase = async () => {
    try {
        await mongoose.connect(mongodbString);
        console.log("-> MongoDB connected successfully");
    } catch (error) {
        console.error("-> Error connecting to MongoDB:", error.message);
    }
};

export { connectToDatabase };
