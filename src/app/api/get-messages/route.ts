import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.models";
import { User } from "next-auth";
import mongoose from "mongoose";

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

    const userID = new mongoose.Types.ObjectId(user._id);

    try {
        const user = await UserModel.aggregate([
            { $match: { id: userID } },
            { $unwind: "$messages" },
            { $sort: { "messages.createdAt": -1 } },
            { $group: { _id: "$_id", messages: { $push: "$messages" } } },
        ]);

        if (!user || user.length <= 0) {
            return Response.json(
                {
                    success: false,
                    message: "Couldn't find the user",
                },
                { status: 401 }
            );
        }

        return Response.json(
            {
                success: true,
                messages: user[0].messages,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error adding messages ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error",
            },
            { status: 500 }
        );
    }
}
