import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.models";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { username, email, password } = await request.json();

        const existingVerifiedUser = await UserModel.findOne({
            username,
            isVerified: true,
        });

        if (existingVerifiedUser) {
            return Response.json(
                { success: false, message: "Username is already taken" },
                { status: 400 }
            );
        }

        const userWithExistingEmail = await UserModel.findOne({ email });
        const verificationCode: string = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        if (userWithExistingEmail) {
            if (userWithExistingEmail.isVerified) {
                return Response.json(
                    {
                        success: false,
                        message: "User already exists with this email",
                    },
                    { status: 400 }
                );
            } else {
                const hashedPassword = await bcrypt.hash(password, 10);
                userWithExistingEmail.password = hashedPassword;
                userWithExistingEmail.verificationCode = verificationCode;
                userWithExistingEmail.verificationCodeExpiry = new Date(
                    Date.now() + 3600000
                );
                await userWithExistingEmail.save();
            }
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verificationCode,
                verificationCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessages: true,
                messages: [],
            });

            await newUser.save();
        }

        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verificationCode
        );

        if (!emailResponse.success) {
            return Response.json(
                { success: false, message: emailResponse.message },
                { status: 500 }
            );
        }

        return Response.json(
            {
                success: true,
                message:
                    "User registered successfully. Please check your email",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error registering the user", error);
        return Response.json(
            { success: false, message: "Error registering the user" },
            { status: 500 }
        );
    }
}
