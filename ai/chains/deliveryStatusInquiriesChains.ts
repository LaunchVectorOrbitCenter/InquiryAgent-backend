import { StringOutputParser } from "@langchain/core/output_parsers";
import DeliveryStatusInquiriesPrompt from "../prompts/deliveryStatusInquiriesPrompt";
import { LLMClientFactory } from "../llms/llmClientFactory";



class DeliveryStatusInquiriesChains {


    public static trackAndStatusInquiryChain() {
        const deliveryStatusPromptTemplate = DeliveryStatusInquiriesPrompt.getDeliveryStatusInquiryPromptTemplate();
        const model = LLMClientFactory.getLLMClient().getLLMInstance(0.5);
        const chain = deliveryStatusPromptTemplate.pipe(model).pipe(new StringOutputParser());
        return chain;
    }


}

export default DeliveryStatusInquiriesChains;