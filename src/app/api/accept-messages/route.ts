import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { User } from "next-auth";

export async function POST(req: Request) {
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

    const userId = user._id;
    const { acceptMessages } = await req.json();

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(userId, { isAcceptingMessage: acceptMessages }, { new: true })
        if (!updatedUser) {
            return Response.json({
                success: false,
                message: "Failed to update user status to accept messages"
            },
                { status: 401 })
        }
        return Response.json({
            success: true,
            message: "Message Acceptance status updated Successfully",
            updatedUser
        },
            { status: 200 })
    } catch (error) {
        console.log("Failed to update user status to accept messages")
        return Response.json({
            success: false,
            message: "Failed to update user status to accept messages"
        },
            { status: 500 })
    }

}

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

    const userId = user._id;
    try {
        const foundUser = await UserModel.findById(userId)

        if (!foundUser) {
            return Response.json({
                success: false,
                message: "Failed to find the User"
            },
                { status: 404 })
        }
        return Response.json({
            success: true,
            isAcceptingmessages: foundUser.isAcceptingMessage,
        },
            { status: 200 })
    } catch (error) {
        console.log("Error in getting Message Acceptance status")
        return Response.json({
            success: false,
            message: "Error in getting Message Acceptance status"
        },
            { status: 500 })
    }
}