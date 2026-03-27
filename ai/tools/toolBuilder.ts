import { tool } from "@langchain/core/tools";
import z from "zod";
import { IProcessEmailResponseDTO } from "../../core/interfaces/aiServiceInterface";
import { BaseMessage } from "@langchain/core/messages";
import DeliveryStatusInquiriesTools from "./deliveryStatusInquiriesTools";
import OrderCancellationInquiriesTools from "./orderCancellationInquiriesTools";
import RefundInquiriesTools from "./refundInquiriesTools";
import SubscriptionInquiriesTools from "./subscriptionInquiriesTools";
import { Logger } from "../../utils/helpers/logger";

type ToolCallState = {
    status: "idle" | "in_progress" | "used";
    response?: any;
    usedTool?: string;
};



class ToolBuilder {


    public static buildTools(data: IProcessEmailResponseDTO, toolCallState?: ToolCallState, conversationalMemory: BaseMessage[] = []) {
        const withSingleCallGuard = (toolName: string, handler: (input: { userQuery: string }) => Promise<any>) => {
            return async (input: { userQuery: string }) => {
                if (!toolCallState) {
                    return handler(input);
                }

                if (toolCallState.status !== "idle") {
                    if (toolCallState.response) {
                        Logger.Log(`[ToolBuilder] Duplicate tool call blocked | alreadyUsed: ${toolCallState.usedTool} | attempted: ${toolName}`, 'warn');
                        return toolCallState.response;
                    }
                    throw new Error("Tool call blocked: a tool has already been invoked.");
                }

                toolCallState.status = "used";
                toolCallState.usedTool = toolName;

                const result = await handler(input);
                toolCallState.response = result;
                return result;
            };
        };

        const trackOrderTool = tool(
            withSingleCallGuard("order_status_tool", async (input: { userQuery: string }) => {
                return DeliveryStatusInquiriesTools.trackAndStatusInquiryTool(data, input.userQuery, conversationalMemory);
            }),
            {
                name: "order_status_tool",
                description:
                    "Tracks the status of an order based on the user's question",
                schema: z.object({
                    userQuery: z.string()
                }),
            }
        );


        const refundInquiryTool = tool(
            withSingleCallGuard("refund_inquiry_tool", async (input: { userQuery: string }) => {
                return RefundInquiriesTools.refundInquiryTool(data, input.userQuery, conversationalMemory);
            }),
            {
                name: "refund_inquiry_tool",
                description:
                    "Handles refund inquiries based on the user's question",
                schema: z.object({
                    userQuery: z.string()
                }),
            }
        );


        const orderCancellationTool = tool(
            withSingleCallGuard("order_cancellation_tool", async (input: { userQuery: string }) => {
                return OrderCancellationInquiriesTools.orderCancellationInquiryTool(data, input.userQuery, conversationalMemory);
            }),
            {
                name: "order_cancellation_tool",
                description:
                    "Handles order cancellation inquiries based on the user's question",
                schema: z.object({
                    userQuery: z.string()
                }),
            }
        );


        const subscriptionInquiryTool = tool(
            withSingleCallGuard("subscription_inquiry_tool", async (input: { userQuery: string }) => {
                return SubscriptionInquiriesTools.subscriptionInquiryTool(data, input.userQuery, conversationalMemory);
            }),
            {
                name: "subscription_inquiry_tool",
                description:
                    "Handles subscription inquiries based on the user's question",
                schema: z.object({
                    userQuery: z.string()
                }),
            }
        );


        return [trackOrderTool, refundInquiryTool, orderCancellationTool, subscriptionInquiryTool];
    }


}


export default ToolBuilder;
