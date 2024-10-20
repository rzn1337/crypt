import dbConnect from "@/lib/dbConnect";
import { z } from "zod";
import UserModel from "@/models/user.models";
import { usernameValidation } from "@/schemas/signUpSchema";

const usernameQuerySchema = z.object({
    username: usernameValidation,
});

export async function GET(request: Request) {
    // outdated, not needed since nextjs 14
    // if (request.method !== "GET") {
    //     return Response.json(
    //         {
    //             success: false,
    //             message: "Only GET requests are supported",
    //         },
    //         { status: 405 }
    //     );
    // }

    await dbConnect();

    try {
        const { searchParams } = new URL(request.url);
        const queryParam = {
            username: searchParams.get("username"),
        };
        // validate with zod
        const result = usernameQuerySchema.safeParse(queryParam);
        if (!result.success) {
            const usernameErrors =
                result.error.format().username?._errors || [];
            return Response.json(
                {
                    success: false,
                    message:
                        usernameErrors?.length > 0
                            ? usernameErrors.join(", ")
                            : "Invalid query paramters",
                },
                { status: 400 }
            );
        }

        const { username } = result.data;

        const existingVerifiedUser = await UserModel.findOne({
            username,
            isVerified: true,
        });

        if (existingVerifiedUser) {
            return Response.json(
                {
                    success: false,
                    message: "Username is already taken",
                },
                { status: 400 }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Username is available",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error validating username", error);
        return Response.json(
            { success: false, message: "Error validating username" },
            { status: 500 }
        );
    }
}
