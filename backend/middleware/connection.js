import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function connectToDB(){
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_DB_URI);
        console.log("connected to mongodb database");
    } catch (error) {
        console.log(error);
    }
}

export default connectToDB;