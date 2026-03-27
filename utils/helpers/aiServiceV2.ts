import { IAnalyzeEmailDTO, IProcessEmailResponseDTO } from "../../core/interfaces/aiServiceInterface";
import OrchestratorAgent from "../../ai/agents/orchestratorAgent";
import EmailThreadsService from "../../modules/emailThreads/emailThreadsService";



class AIService {


    //* -------------------------------------------------------------------------- */
    //*                                ANALYZE EMAIL                               */
    //* -------------------------------------------------------------------------- */
    public async analyzeEmail(data: IAnalyzeEmailDTO) {
        const response = await this.processAIResponse(data);

        return response?.emailContent
            ? { emailResponse: response.emailContent, intent: response.intent }
            : null;
    }


    //* -------------------------------------------------------------------------- */
    //*                             PROCESS AI RESPONSE                            */
    //* -------------------------------------------------------------------------- */
    private async processAIResponse(data: IProcessEmailResponseDTO) {
        const conversationalMemory = await EmailThreadsService.getConversationalMemory(data.threadId);
        const result = await OrchestratorAgent.run({ ...data, onlyPublishedInstructions: true }, data.emailContent, conversationalMemory);
        return {
            emailContent: {
                ...result
            },
            intent: result.userInquiryTone
        };
    };




}


export default new AIService();