import { Message } from "@/models/user.models";

export interface ApiResponse {
    success: boolean;
    message: string;
    isAcceptingMessages?: boolean;
    messages?: Array<Message>;
}
