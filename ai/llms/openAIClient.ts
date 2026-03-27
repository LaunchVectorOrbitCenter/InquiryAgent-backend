import { ChatOpenAI } from "@langchain/openai";
import { Application } from "../../app";
import { ILLMClient } from "../../core/interfaces/generalInterface";

class OpenAIGPTClient implements ILLMClient {

    public getLLMInstance(temperature: number) {
        return new ChatOpenAI({
            openAIApiKey: Application.conf.SERVICES.llm.openAIGPT.apiKey,
            modelName: Application.conf.SERVICES.llm.openAIGPT.deploymentName,
            temperature
        });
    }

}

export default OpenAIGPTClient;