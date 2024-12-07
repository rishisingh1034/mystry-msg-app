import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { Message } from "@/models/User";

export async function POST(req: Request) {
    await dbConnect();

    const { username, content } = await req.json();
    try {

        const user = await UserModel.findOne({ username })
        if (!user) {
            return Response.json({
                success: false,
                message: "user not found"
            },
                { status: 404 })
        }

        if (!user.isAcceptingMessage) {
            return Response.json({
                success: false,
                message: "User is not Accepting Messages"
            },
                { status: 403 })
        }

        const newMessage = { content, createdAt: new Date() }
        user.messages.push(newMessage as Message)
        user.save();

        return Response.json({
            success: true,
            message: "Message Sent Successfully"
        },
            { status: 200 })

    } catch (error) {
        console.log("A unexpected error occurred", error);
        return Response.json(
            { message: 'Internal server Error', success: false },
            { status: 500 }
        )
    }
}