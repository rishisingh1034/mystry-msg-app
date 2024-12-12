import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";

export async function GET(request: Request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return Response.json(
      {
        success: false,
        message: "Username is required",
      },
      {
        status: 401,
      }
    );
  }

  const usernameInLowerCase = username.toLowerCase();
  try {
    const user = await UserModel.findOne({ username: usernameInLowerCase });

    if (user && user.isVerified) {
      return Response.json(
        {
          success: true,
          message: "User found",
          isAcceptingMessages: user.isAcceptingMessages,
        },
        {
          status: 200,
        }
      );
    }

    return Response.json(
      {
        success: false,
        message: "User not found",
      },
      {
        status: 404,
      }
    );
  } catch (error) {
    console.error("Error finding user", error);
    return Response.json(
      {
        success: false,
        message: "Some unknown error has occurred",
      },
      {
        status: 500,
      }
    );
  }
}
