import { StringOutputParser } from "@langchain/core/output_parsers";
import { LLMClientFactory } from "../llms/llmClientFactory";
import subscriptionInquiriesPrompt from "../prompts/subscriptionInquiriesPrompt";


class SubscriptionInquiriesChain {

    public static subscriptionInquiriesChain() {
        const subscriptionPromptTemplate = subscriptionInquiriesPrompt.getSubscriptionInquiryPromptTemplate();
        const model = LLMClientFactory.getLLMClient().getLLMInstance(0.5);
        const chain = subscriptionPromptTemplate.pipe(model).pipe(new StringOutputParser());
        return chain;
    }

}

export default SubscriptionInquiriesChain;