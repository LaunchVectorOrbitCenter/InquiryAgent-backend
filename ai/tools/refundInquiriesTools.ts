import { BaseMessage } from "@langchain/core/messages";
import { IProcessEmailResponseDTO } from "../../core/interfaces/aiServiceInterface";
import ResponseFormats from "../../core/enums/responseFormats";
import OrdersService from "../../modules/orders/ordersService";
import { Utils } from "../../utils/utils";
import RefundInquiriesChain from "../chains/refundInquiriesChains";
import { Logger } from "../../utils/helpers/logger";


class RefundInquiriesTools {


    public static async refundInquiryTool(data: IProcessEmailResponseDTO, userQuerySummary: string, conversationalMemory: BaseMessage[] = []) {
        Logger.Log(`[RefundTool] Invoked | threadId: ${data.threadId} | storeId: ${data.storeId} | refundPolicy: ${data.refundPolicy ? 'set' : 'none'}`, 'info');
        const isMarkdown = data.responseFormat === ResponseFormats.MARKDOWN;
        const bodyFormatInstruction = isMarkdown
            ? 'A **plain markdown body** (use markdown syntax: **bold**, *italic*, newlines — NO HTML tags)'
            : 'An **HTML-formatted email body** (use proper HTML tags like <p>, <b>, <a>, etc.)';
        const bodyFormatExample = isMarkdown ? 'markdown' : 'html';

        const deliveryStatus = await OrdersService.trackOrder(data);

        const orderDetails = {
            mainStatus: deliveryStatus?.mainStatus,
            subStatus: deliveryStatus?.subStatus,
            orderDeliveredAt: deliveryStatus?.orderDeliveredAt,
            currentDate: Utils.getCurrentDate(),
            daysPassedAfterDelivery: deliveryStatus?.orderDeliveredAt ? Utils.getTimeDifferenceInDays(deliveryStatus?.orderDeliveredAt, Utils.getCurrentDate()) : null
        }

        const chainInput = {
            storeName: data.maskedName || data.storeName,
            orderDeliveredAt: orderDetails?.orderDeliveredAt,
            currentDate: orderDetails?.currentDate,
            daysPassedAfterDelivery: orderDetails?.daysPassedAfterDelivery,
            customerName: data.customerDetail.name,
            refundPolicy: data.refundPolicy,
            orderDetails: JSON.stringify(data.orderDetails),
            conversationalMemory: conversationalMemory,
            bodyFormatInstruction,
            bodyFormatExample,
            query: userQuerySummary,
        };

        const chain = RefundInquiriesChain.refundInquiryChain();
        const response = await chain.invoke(chainInput);
        
        // Parse the JSON string response and return structured object
        try {
            const parsedResponse = JSON.parse(response);
            Logger.Log(`[RefundTool] Chain response parsed successfully | threadId: ${data.threadId}`, 'debug');
            return parsedResponse;
        } catch (error) {
            Logger.Log(`[RefundTool] Failed to parse chain response | threadId: ${data.threadId} | error: ${error} | raw: ${response}`, 'error');
            throw new Error("Invalid JSON response from refund chain");
        }
    }


}


export default RefundInquiriesTools;