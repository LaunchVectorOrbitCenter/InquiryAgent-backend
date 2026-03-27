import { BaseMessage } from "@langchain/core/messages";
import { IProcessEmailResponseDTO } from "../../core/interfaces/aiServiceInterface";
import ResponseFormats from "../../core/enums/responseFormats";
import OrdersService from "../../modules/orders/ordersService";
import DeliveryStatusInquiriesChains from "../chains/deliveryStatusInquiriesChains";
import { Logger } from "../../utils/helpers/logger";



class DeliveryStatusInquiriesTools {


    public static async trackAndStatusInquiryTool(data: IProcessEmailResponseDTO, userQuerySummary: string, conversationalMemory: BaseMessage[] = []) {
        Logger.Log(`[DeliveryStatusTool] Invoked | threadId: ${data.threadId} | storeId: ${data.storeId} | trackingUrl: ${data.orderDetails[0]?.trackingUrl ?? 'none'}`, 'info');
        const isMarkdown = data.responseFormat === ResponseFormats.MARKDOWN;
        const bodyFormatInstruction = isMarkdown
            ? 'A **plain markdown body** (use markdown syntax: **bold**, *italic*, newlines — NO HTML tags)'
            : 'An **HTML-formatted email body** (use proper HTML tags like <p>, <b>, <a>, etc.)';
        const bodyFormatExample = isMarkdown ? 'markdown' : 'html';

        const deliveryStatus = await OrdersService.trackOrder(data);
        const chainInput = {
            status: JSON.stringify({
                userQuery: userQuerySummary,
                status: deliveryStatus?.status,
                subStatus: deliveryStatus?.subStatus,
                orderDeliveredAt: deliveryStatus?.orderDeliveredAt || null,
                trackingUrl: data.orderDetails[0]?.trackingUrl
            }),
            storeName: data.maskedName || data.storeName,
            customerName: data.customerDetail.name || 'Customer',
            conversationalMemory: conversationalMemory,
            bodyFormatInstruction,
            bodyFormatExample
        };

        const chain = DeliveryStatusInquiriesChains.trackAndStatusInquiryChain();
        const response = await chain.invoke(chainInput);
        
        // Parse the JSON string response and return structured object
        try {
            const parsedResponse = JSON.parse(response);
            Logger.Log(`[DeliveryStatusTool] Chain response parsed successfully | threadId: ${data.threadId}`, 'debug');
            return parsedResponse;
        } catch (error) {
            Logger.Log(`[DeliveryStatusTool] Failed to parse chain response | threadId: ${data.threadId} | error: ${error} | raw: ${response}`, 'error');
            throw new Error("Invalid JSON response from delivery status chain");
        }
    }



}


export default DeliveryStatusInquiriesTools;