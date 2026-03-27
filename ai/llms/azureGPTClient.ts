import { AzureChatOpenAI } from "@langchain/openai";
import { Application } from "../../app";
import { ILLMClient } from "../../core/interfaces/generalInterface";

class AzureGPTClient implements ILLMClient {

    public getLLMInstance(temperature: number) {
        return new AzureChatOpenAI({
            azureOpenAIEndpoint: Application.conf.SERVICES.llm.azureGPT.endpoint,
            azureOpenAIApiDeploymentName: Application.conf.SERVICES.llm.azureGPT.deploymentName,
            azureOpenAIApiVersion: Application.conf.SERVICES.llm.azureGPT.apiVersion,
            azureOpenAIApiKey: Application.conf.SERVICES.llm.azureGPT.apiKey,
            temperature,
        });
    }

}

export default AzureGPTClient;