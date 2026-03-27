import { LLMClientFactory } from "../llms/llmClientFactory";
import KnowledgeBaseRuleFormulationPrompt from "../prompts/knowledgeBaseRuleFormulationPrompt";
import { z } from "zod";



class KnowledgeBaseRuleFormulationChain {

    public static knowledgeBaseRuleFormulationChain() {
        const KnowledgeBaseRuleFormulationSchema = z.object({
            name: z.string().describe('A short, descriptive name for this rule (3-7 words)'),
            confidence: z.number().min(0).max(1).describe('Confidence score from 0.0 to 1.0 indicating how well the intent and action were understood'),
            formulatedInstruction: z.string().describe('The complete IF-THEN instruction that the orchestrator agent can execute'),
            requiresToolsConfiguration: z.boolean().describe('Whether external tools are needed to execute this action (e.g., order cancellation, refund processing, email sending)')
        });

        const knowledgeBaseRuleFormulationPromptTemplate = KnowledgeBaseRuleFormulationPrompt.getKnowledgeBaseRuleFormulationPromptTemplate();
        const model = LLMClientFactory.getLLMClient().getLLMInstance(0.5);
        
        const structuredModel = model.withStructuredOutput(KnowledgeBaseRuleFormulationSchema, {
            name: "knowledge_base_rule_formulation"
        });
        
        const chain = knowledgeBaseRuleFormulationPromptTemplate.pipe(structuredModel);
        return chain;
    }

}


export default KnowledgeBaseRuleFormulationChain;