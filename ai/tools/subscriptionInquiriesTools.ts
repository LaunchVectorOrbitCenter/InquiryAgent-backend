import { BaseMessage } from "@langchain/core/messages";
import { IProcessEmailResponseDTO } from "../../core/interfaces/aiServiceInterface";
import ResponseFormats from "../../core/enums/responseFormats";
import SubscriptionInquiriesChain from "../chains/subscriptionInquiriesChains";
import { Logger } from "../../utils/helpers/logger";



class SubscriptionInquiriesTools {


    public static async subscriptionInquiryTool(data: IProcessEmailResponseDTO, userQuerySummary: string, conversationalMemory: BaseMessage[] = []) {
        Logger.Log(`[SubscriptionTool] Invoked | threadId: ${data.threadId} | storeId: ${data.storeId} | hasPortalUrl: ${!!data?.subscriptionPortalUrl}`, 'info');
        const isMarkdown = data.responseFormat === ResponseFormats.MARKDOWN;
        const bodyFormatInstruction = isMarkdown
            ? 'A **plain markdown body** (use markdown syntax: **bold**, *italic*, newlines — NO HTML tags)'
            : 'An **HTML-formatted email body** (use proper HTML tags like <p>, <b>, <a>, etc.)';
        const bodyFormatExample = isMarkdown ? 'markdown' : 'html';

        if (data?.subscriptionPortalUrl) {
            const chainInput = {
                storeName: data.maskedName || data.storeName,
                customerName: data.customerDetail.name,
                subscriptionPortalUrl: data.subscriptionPortalUrl,
                conversationalMemory: conversationalMemory,
                bodyFormatInstruction,
                bodyFormatExample,
                query: userQuerySummary,
            };
            const chain = SubscriptionInquiriesChain.subscriptionInquiriesChain();
            const response = await chain.invoke(chainInput);
            
            // Parse the JSON string response and return structured object
            try {
                const parsedResponse = JSON.parse(response);
                Logger.Log(`[SubscriptionTool] Chain response parsed successfully | threadId: ${data.threadId}`, 'debug');
                return parsedResponse;
            } catch (error) {
                Logger.Log(`[SubscriptionTool] Failed to parse chain response | threadId: ${data.threadId} | error: ${error} | raw: ${response}`, 'error');
                throw new Error("Invalid JSON response from subscription chain");
            }
        } else {
            // Return structured object for no subscription case
            return {
                subject: "Subscription Inquiry - No Active Subscription",
                body: "We don't have any subscription information associated with your account.",
                userInquiryTone: "subscription_inquiry",
                isUserEligibleForCancellation: false,
                isUserEligibleForRefund: false
            };
        }
    }

}



export default SubscriptionInquiriesTools;