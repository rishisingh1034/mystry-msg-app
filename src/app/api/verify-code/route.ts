import UserModel from "@/models/User";
import dbConnect from "@/lib/dbConnect";

export async function POST(req: Request) {
    await dbConnect();
    try {
        const { username, code } = await req.json();

        const decodedUsername = decodeURIComponent(username)

        const user = await UserModel.findOne({ username: decodedUsername });

        if (!user) {
            return Response.json({
                success: false,
                message: "User Not Found"
            },
                { status: 400 })
        }

        const isCodeValid = user.verifyCode === code
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
            await user.save()

            return Response.json({
                success: true,
                message: "User Verified Successfully"
            },
                { status: 200 })
        } else if (!isCodeNotExpired) {
            return Response.json({
                success: false,
                message: "Verification Code has expired, Please Signup again to get a new code"
            },
                { status: 400 })
        } else {
            return Response.json({
                success: false,
                message: "Incorrect Verification Code"
            },
                { status: 400 })
        }

    } catch (error) {
        console.error("Verify User Error", error)
        return Response.json({
            success: false,
            message: "Error Verifying User"
        },
            { status: 500 })
    }
}