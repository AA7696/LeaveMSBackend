import mongoose from "mongoose";

// Function to connect to the MongoDB database
// Takes a database URL as an argument

const connectDb = (url) =>{
    return mongoose.connect(url)
}

export default connectDb