import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import UserModel, { User } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

// Fix: Explicitly define the type for context
type Context = {
    params: {
        messageid: string;
    };
};

export async function DELETE(req: NextRequest, context: Context) {
    const { messageid } = context.params;
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as unknown as User;

    if (!session || !user) {
        return NextResponse.json(
            {
                success: false,
                message: "Not Authenticated",
            },
            { status: 401 }
        );
    }

    try {
        const updatedResult = await UserModel.updateOne(
            { _id: user._id },
            { $pull: { messages: { _id: messageid } } }
        );

        if (updatedResult.modifiedCount === 0) {
            return NextResponse.json(
                { message: "Message not found or already deleted", success: false },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Message deleted", success: true },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting message:", error);
        return NextResponse.json(
            { message: "Error deleting message", success: false },
            { status: 500 }
        );
    }
}