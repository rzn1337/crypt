import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.models";
import { Message } from "@/models/user.models";

export async function POST(request: Request) {
    await dbConnect();

    const { username, content } = await request.json();

    try {
        const user = await UserModel.findOne({ username });
        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        // checking if the user is accepting messages
        if (!user.isAcceptingMessages) {
            return Response.json(
                {
                    success: false,
                    message: "User is not accepting messages currently",
                },
                { status: 403 }
            );
        }

        const newMessage = { content, createdAt: new Date() } as Message;
        user.messages.push(newMessage);
        await user.save();
        return Response.json(
            {
                success: true,
                message: "Message sent successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Unexpected error occured: ", error);
        return Response.json(
            {
                success: false,
                message: "Unexpected error occured",
            },
            { status: 500 }
        );
    }
}
