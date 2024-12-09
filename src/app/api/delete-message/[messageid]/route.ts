import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import UserModel, { User } from "@/models/User";




export async function DELETE(req: Request, { params }: { params: { messageid: any } }) {
    const messageid = params.messageid;
    dbConnect();
    const session = await getServerSession(authOptions);
    const user: User = session?.user as unknown as User;
    if (!session || !user) {
        return Response.json(
            {
                success: false,
                message: 'Not Authenticated'
            },
            { status: 401 }
        )
    }

    try {

        const updatedResult = await UserModel.updateOne(
            { _id: user._id },
            { $pull: { messages: { _id: messageid } } }
        )

        if (updatedResult.modifiedCount === 0) {
            return Response.json(
                { message: 'Message not found or already deleted', success: false },
                { status: 404 }
            );
        }

        return Response.json(
            { message: 'Message deleted', success: true },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error deleting message:', error);
        return Response.json(
            { message: 'Error deleting message', success: false },
            { status: 500 }
        );
    }

}


