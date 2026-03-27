import { StringOutputParser } from "@langchain/core/output_parsers";
import { LLMClientFactory } from "../llms/llmClientFactory";
import RefundInquiriesPrompt from "../prompts/refundInquiriesPrompt";



class RefundInquiriesChain {


    public static refundInquiryChain() {
        const refundPromptTemplate = RefundInquiriesPrompt.getRefundInquiryPromptTemplate();
        const model = LLMClientFactory.getLLMClient().getLLMInstance(0.6);
        const chain = refundPromptTemplate.pipe(model).pipe(new StringOutputParser());
        return chain;
    }


}

export default RefundInquiriesChain;