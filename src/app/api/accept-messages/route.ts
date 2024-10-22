import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.models";
import { User } from "next-auth";

export async function POST(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !session.user) {
        return Response.json(
            {
                success: false,
                message: "Unauthorized request",
            },
            { status: 401 }
        );
    }

    const userID = user._id;
    const { acceptMessages } = await request.json();

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userID,
            {
                isAcceptingMessages: acceptMessages,
            },
            { new: true }
        );

        if (!updatedUser) {
            return Response.json(
                {
                    success: false,
                    message: "Couldn't update the message acceptance status",
                },
                { status: 401 }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Message acceptance status updated succesfully",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Failed to update user status to accept messages", error);
        return Response.json(
            {
                success: false,
                message: "Failed to update user status to accept messages",
            },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !session.user) {
        return Response.json(
            {
                success: false,
                message: "Unauthorized request",
            },
            { status: 401 }
        );
    }

    const userID = user._id;

    try {
        const foundUser = await UserModel.findById(userID);

        if (!foundUser) {
            return Response.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        return Response.json(
            {
                success: true,
                isAcceptingMessages: foundUser.isAcceptingMessages,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Failed to get user status to accept messages", error);
        return Response.json(
            {
                success: false,
                message: "Failed to get user status to accept messages",
            },
            { status: 500 }
        );
    }
}
