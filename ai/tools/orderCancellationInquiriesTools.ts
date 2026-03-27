import { BaseMessage } from "@langchain/core/messages";
import { IProcessEmailResponseDTO } from "../../core/interfaces/aiServiceInterface";
import ResponseFormats from "../../core/enums/responseFormats";
import { StoreConfigurations } from "../../utils/constants";
import { Utils } from "../../utils/utils";
import OrderCancellationInquiriesChain from "../chains/orderCancellationInquiriesChains";
import { Logger } from "../../utils/helpers/logger";



class OrderCancellationInquiriesTools {


    public static async orderCancellationInquiryTool(data: IProcessEmailResponseDTO, userQuerySummary: string, conversationalMemory: BaseMessage[] = []) {
        Logger.Log(`[OrderCancellationTool] Invoked | threadId: ${data.threadId} | storeId: ${data.storeId} | orderCreatedAt: ${data.orderDetails[0]?.orderCreatedAt}`, 'info');
        const isMarkdown = data.responseFormat === ResponseFormats.MARKDOWN;
        const bodyFormatInstruction = isMarkdown
            ? 'A **plain markdown body** (use markdown syntax: **bold**, *italic*, newlines — NO HTML tags)'
            : 'An **HTML-formatted email body** (use proper HTML tags like <p>, <b>, <a>, etc.)';
        const bodyFormatExample = isMarkdown ? 'markdown' : 'html';

        const createdAt = new Date(data.orderDetails[0].orderCreatedAt);
        const now = new Date();
        const diffMs = now.getTime() - createdAt.getTime();
        const hoursPassed = Math.floor(diffMs / (1000 * 60 * 60));

        const elapsedTimeNotation = Utils.formatElapsedHours(hoursPassed);

        if (StoreConfigurations.defaultOrderCancellationEligibilityWindowInHours < hoursPassed) {
            const eligibilityStatus = {
                isEligibleForCancellation: false,
                inEligibilityReason: 'ORDER_CANCELLATION_ELIGIBILITY_WINDOW_EXCEEDED',
                cancellationEligibilityWindow: `${StoreConfigurations.defaultOrderCancellationEligibilityWindowInHours} hours`,
                orderPlacedAt: data.orderDetails[0].orderCreatedAt,
                timePassedAfterOrderPlaced: `${elapsedTimeNotation}`,
                currentDateTime: now,
                isOrderSubscriptionBased: data.orderDetails[0].tags.includes('Subscription')
            }

            const chainInput = {
                storeName: data.maskedName || data.storeName,
                eligibilityStatus: JSON.stringify(eligibilityStatus),
                customerName: data.customerDetail.name,
                conversationalMemory: conversationalMemory,
                bodyFormatInstruction,
                bodyFormatExample,
                query: userQuerySummary,
            };

            const chain = OrderCancellationInquiriesChain.orderCancellationInquiryChain();
            const response = await chain.invoke(chainInput);
            
            // Parse the JSON string response and return structured object
            try {
                const parsedResponse = JSON.parse(response);
                Logger.Log(`[OrderCancellationTool] Chain response parsed successfully | threadId: ${data.threadId}`, 'debug');
                return parsedResponse;
            } catch (error) {
                Logger.Log(`[OrderCancellationTool] Failed to parse chain response | threadId: ${data.threadId} | error: ${error} | raw: ${response}`, 'error');
                throw new Error("Invalid JSON response from order cancellation chain");
            }
        }
        else {
            // Return structured object directly, not JSON string
            return {
                isUserEligibleForCancellation: true
            };
        }

    }


}



export default OrderCancellationInquiriesTools;