import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number
}

const connection: ConnectionObject = {}

async function dbConnect(): Promise<void> {
    if (connection.isConnected) {
        console.log("DB is Already Connected!");
        return
    }

    try {
        const db = await mongoose.connect(process.env.MONGO_URL!)
        console.log(db);
        console.log(db.connections);

        connection.isConnected = db.connections[0].readyState

        console.log("DB Connected Successfully");
    } catch (error) {
        console.log("DB Connection Failed", error);

        process.exit(1)
    }
}