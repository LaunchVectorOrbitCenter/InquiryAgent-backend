import { StringOutputParser } from "@langchain/core/output_parsers";
import { LLMClientFactory } from "../llms/llmClientFactory";
import IntentRecognitionPrompt from "../prompts/intentRecognitionPrompt";



class IntentRecognitionChain {


    public static intentRecognitionChain() {
        const intentRecognitionPromptTemplate = IntentRecognitionPrompt.getIntentRecognitionPromptTemplate();
        const model = LLMClientFactory.getLLMClient().getLLMInstance(0);
        const chain = intentRecognitionPromptTemplate.pipe(model).pipe(new StringOutputParser());
        return chain;
    }


}

export default IntentRecognitionChain;