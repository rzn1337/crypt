import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.models";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { username, code } = await request.json();
        const decodedUsername = decodeURIComponent(username);
        const user = await UserModel.findOne({ username: decodedUsername });
        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 500 }
            );
        }

        const isCodeValid = user.verificationCode === code;
        const isCodeNotExpired =
            new Date(user.verificationCodeExpiry) > new Date();

        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
            await user.save();
            return Response.json(
                {
                    success: true,
                    message: "User account verified successfully",
                },
                { status: 200 }
            );
        } else if (!isCodeNotExpired) {
            return Response.json(
                {
                    success: false,
                    message: "Code has expired. Please sign up again",
                },
                { status: 400 }
            );
        } else {
            return Response.json(
                {
                    success: false,
                    message: "Incorrect verification code",
                },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Error verifying username", error);
        return Response.json(
            { success: false, message: "Error verifying username" },
            { status: 500 }
        );
    }
}
