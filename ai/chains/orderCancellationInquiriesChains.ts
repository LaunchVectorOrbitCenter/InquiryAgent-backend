import { StringOutputParser } from "@langchain/core/output_parsers";
import { LLMClientFactory } from "../llms/llmClientFactory";
import OrderCancellationInquiriesPrompt from "../prompts/orderCancellationInquiriesPrompt";



class OrderCancellationInquiriesChain {


    public static orderCancellationInquiryChain() {
        const orderCancellationInquiriesPromptTemplate = OrderCancellationInquiriesPrompt.getOrderCancellationInquiryPromptTemplate();
        const model = LLMClientFactory.getLLMClient().getLLMInstance(0.6);
        const chain = orderCancellationInquiriesPromptTemplate.pipe(model).pipe(new StringOutputParser());
        return chain;
    }


}

export default OrderCancellationInquiriesChain;