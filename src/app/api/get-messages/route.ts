import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET(req: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "Not Authenticated"
        },
            { status: 401 })
    }

    //Aggregation Pipline

    const userId = new mongoose.Types.ObjectId(user._id);
    try {
        const user = await UserModel.aggregate([
            { $match: { _id: userId } },
            { $unwind: '$messages' },
            { $sort: { 'message.createdAt': -1 } },
            { $group: { _id: '$_id', messages: { $push: '$messages' } } }
        ]).exec();

        if (!user || user.length === 0) {
            return Response.json(
                { message: 'User not Found', success: false },
                { status: 404 }
            )
        }

        return Response.json(
            { messages: user[0].messages },
            { status: 200 }
        )

    } catch (error) {
        console.log("A unexpected error occurred", error);
        return Response.json(
            { message: 'Internal server Error', success: false },
            { status: 500 }
        )
    }
}