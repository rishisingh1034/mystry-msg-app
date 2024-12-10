import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET() {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !session.user) {
        return Response.json(
            {
                success: false,
                message: "Not Authenticated",
            },
            { status: 401 }
        );
    }

    const userId = new mongoose.Types.ObjectId(user._id);

    try {
        const user = await UserModel.aggregate([
            {
                $match: { _id: userId },
            },
            {
                $unwind: "$messages",
            },
            {
                $sort: { "messages.createdAt": -1 },
            },
            {
                $group: {
                    _id: "$_id",
                    messages: {
                        $push: {
                            message: "$messages.content",
                            _id: "$messages._id",
                        },
                    },
                },
            },
        ]);
        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        }
        if (user.length === 0) {
            return Response.json(
                {
                    success: true,
                    message: "No messages exists",
                },
                { status: 200 }
            );
        }
        return Response.json(
            {
                success: true,
                messages: user,
            },
            { status: 200 }
        );
    } catch (error) {
        console.log("An unexpected error occured", error);
        return Response.json(
            {
                success: false,
                message: "Could not get messages, server error",
            },
            { status: 500 }
        );
    }
}