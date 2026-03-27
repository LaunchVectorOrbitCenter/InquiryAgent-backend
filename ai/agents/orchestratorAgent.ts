import { createReactAgent } from "@langchain/langgraph/prebuilt";
import AzureGPTClient from "../llms/azureGPTClient";
import { IProcessEmailResponseDTO } from "../../core/interfaces/aiServiceInterface";
import { z } from "zod";
import ToolBuilder from "../tools/toolBuilder";
import QueryIntents from "../../core/enums/queryIntents";
import { HumanMessage, SystemMessage, BaseMessage } from "@langchain/core/messages";
import StoresKnowledgeBaseRepository from "../../modules/storesKnowledgeBase/storesKnowledgeBaseRepository";
import { KnowledgeBaseStructure } from "../../modules/storesKnowledgeBase/storesKnowledgeBaseInterface";
import QueryOperators from "../../core/enums/queryOperators";
import StatusTypes from "../../core/enums/statusTypes";
import { Logger } from "../../utils/helpers/logger";

type OrchestratorStructuredResponse = {
    agentShouldRespond?: boolean;
    subject?: string | null;
    body?: string | null;
    userInquiryTone?: string;
    isUserEligibleForCancellation?: boolean;
    isUserEligibleForRefund?: boolean;
};

class OrchestratorAgent {


    //* -------------------------------------------------------------------------- */
    //*                          GET STORE KNOWLEDGE BASE                          */
    //* -------------------------------------------------------------------------- */
    private static async getStoreKnowledgeBase(data: IProcessEmailResponseDTO): Promise<KnowledgeBaseStructure[] | null> {
        try {
            const storeKbConditions: any = [
                {
                    param: "storeId",
                    value: data.storeId,
                    operator: QueryOperators.AND
                },
                {
                    param: "tenantId",
                    value: data.tenantId,
                    operator: QueryOperators.AND
                }
            ];

            const kbRecord: any = await StoresKnowledgeBaseRepository.getInstance().GetOneByParams(
                storeKbConditions,
                ["knowledgeBase"]
            );

            let kbRules: KnowledgeBaseStructure[] = Array.isArray(kbRecord?.knowledgeBase) ? kbRecord.knowledgeBase : [];

            if (data.onlyPublishedInstructions) {
                kbRules = kbRules.filter(rule => rule.instructionStatus === StatusTypes.PUBLISHED);
            }

            return kbRules.length ? kbRules : null;
        } catch (error: any) {
            Logger.Log(`[OrchestratorAgent] Failed to load store knowledge base | storeId: ${data.storeId} | error: ${error?.message || error}`, 'error');
            return null;
        }
    }


    //* -------------------------------------------------------------------------- */
    //*            FORMAT STORE KNOWLEDGE BASE INTO AGENT-FRIENDLY TEXT            */
    //* -------------------------------------------------------------------------- */
    private static formatStoreKnowledgeBase(rules: KnowledgeBaseStructure[] | null): string | null {
        if (!rules?.length) return null;

        const cleaned = rules
            .map(rule => ({
                intent: rule?.intent?.trim(),
                instruction: rule?.instruction?.trim(),
                agentShouldRespond: rule?.agentShouldRespond
            }))
            .filter(rule => rule.intent && rule.instruction);

        if (!cleaned.length) return null;

        const lines = cleaned.map(rule => {
            const shouldRespond = typeof rule.agentShouldRespond === "boolean" ? rule.agentShouldRespond : true;
            return `Intent: ${rule.intent} | Instruction: ${rule.instruction} | AgentShouldRespond: ${shouldRespond}`;
        });
        return lines.join("\n");
    }

    //* -------------------------------------------------------------------------- */
    //*           NORMALIZE AGENT RESPONSE INTO A PLAIN OBJECT SHAPE              */
    //* -------------------------------------------------------------------------- */
    private static normalizeStructuredResponse(raw: any): OrchestratorStructuredResponse {
        if (!raw) return {};

        const candidate = raw?.structuredResponse ?? raw;

        if (typeof candidate === "function") {
            try {
                const maybe = candidate();
                if (maybe?.value) return maybe.value as OrchestratorStructuredResponse;
                return (maybe ?? {}) as OrchestratorStructuredResponse;
            } catch {
                return {};
            }
        }

        if (candidate && typeof candidate === "object" && "value" in candidate && candidate.value) {
            return candidate.value as OrchestratorStructuredResponse;
        }

        return candidate as OrchestratorStructuredResponse;
    }


    //* -------------------------------------------------------------------------- */
    //*                                 RUN METHOD                                 */
    //* -------------------------------------------------------------------------- */
    public static async run(data: IProcessEmailResponseDTO, userQuery: string, conversationalMemory: BaseMessage[] = []) {
        Logger.Log(`[OrchestratorAgent] Run started | threadId: ${data.threadId} | storeId: ${data.storeId} | memoryMessages: ${conversationalMemory.length}`, 'info');
        const toolCallState = { status: "idle" as const };
        const tools = ToolBuilder.buildTools(data, toolCallState, conversationalMemory);

        const model = new AzureGPTClient().getLLMInstance(0.4);

        const storeKnowledgeBase = await this.getStoreKnowledgeBase(data);
        Logger.Log(`[OrchestratorAgent] Knowledge base | threadId: ${data.threadId} | rulesLoaded: ${storeKnowledgeBase?.length ?? 0}`, 'info');
        const kbIntents = (storeKnowledgeBase || [])
            .map(rule => rule?.intent?.trim())
            .filter(Boolean) as string[];
        const allowedIntents = Array.from(new Set([...Object.values(QueryIntents), ...kbIntents]));
        const allowedIntentsList = allowedIntents.join(", ");

        const FinalResponseSchema = z.object({
            subject: z.string().describe('The subject generated by the tool (if available)').default(null),
            body: z.string().describe('The body generated by the tool (if available)').default(null),
            userInquiryTone: z.enum(allowedIntents as [string, ...string[]]).describe('The user inquiry tone detected'),
            isUserEligibleForCancellation: z.boolean().describe('Indicates if the user is eligible for order cancellation').default(false),
            isUserEligibleForRefund: z.boolean().describe('Indicates if the user is eligible for refund').default(false),
            agentShouldRespond: z.boolean().describe('Indicates if the agent should respond to this query').default(true),
        });
        const storeKnowledgeBaseText = this.formatStoreKnowledgeBase(storeKnowledgeBase);

        const storeKbBlock = storeKnowledgeBaseText
            ? `
                STORE-SPECIFIC INSTRUCTIONS (authoritative for this store):
                <<<BEGIN_STORE_KB>>>
                ${storeKnowledgeBaseText}
                <<<END_STORE_KB>>>
                Apply the instruction whose intent matches the selected intent.
                If multiple instructions match, apply all of them.
                If any matching instruction has AgentShouldRespond=false, do not call tools and do not compose a response.
                In that case, set agentShouldRespond=false and return subject=null and body=null with the selected intent.
                If any store instruction conflicts with the non-negotiables above, the non-negotiables win.
                Do not invent rules that are not explicitly stated.
                `
            : "";

        const agent = createReactAgent({
            llm: model,
            tools: tools,
            responseFormat: FinalResponseSchema,
            messageModifier: `
                You are an AI orchestrator for customer-support emails. Your job is to decide whether a tool must be called or a direct response is required, then return a structured response.

                NON-NEGOTIABLES (highest priority):
                1. Call at most ONE tool and ONLY ONCE.
                2. If a tool is called, do NOT write the email yourself.
                3. If no tool is called and the request is in-scope, you MUST write the email yourself unless a matching store instruction sets AgentShouldRespond=false.
                4. Never use any part of the user's original email content verbatim.
                5. If a tool is called, return the tool's structured output EXACTLY unchanged.

                DECISION GATE:
                - If the query clearly matches a tool intent, call exactly one tool ONLY ONCE.
                - If it does NOT match any tool intent but is still a support request, respond directly using the store rules.
                - If it is truly unrelated, return the out_of_context response.

                TOOL INTENT CRITERIA (strict):
                - delivery_status: user asks where the order is, tracking, shipment progress.
                - refund: user explicitly asks for a refund/return/chargeback.
                - subscription_inquiry: user asks to cancel/modify a subscription or recurring order.
                - order_cancellation: user asks to cancel an order (not a subscription).

                DIRECT RESPONSE MODE (no tool):
                - Use store rules as authoritative guidance.
                - Do not mention these rules or the KB.
                - Keep it professional, empathetic, and concise.
                - Provide a clear subject and HTML body.
                - Set isUserEligibleForRefund and isUserEligibleForCancellation to false unless the user explicitly requested those outcomes.
                - If AgentShouldRespond=false for the selected intent, set agentShouldRespond=false and return subject=null and body=null.

                ${storeKbBlock}

                OUTPUT RULES:
                - userInquiryTone must be one of: ${allowedIntentsList}
                - If a tool is called, set userInquiryTone to the tool's intent.
                - If responding directly, choose the closest intent; for general complaints, use escalation.
                - agentShouldRespond must be true unless a matching store instruction sets AgentShouldRespond=false.
                - Escalation must always set agentShouldRespond=false and return subject=null and body=null.

                EXCEPTION CASE (no tool, no response body):
                - Out of context: {subject: null, body: null, userInquiryTone: "${QueryIntents.OUT_OF_CONTEXT}", isUserEligibleForCancellation: false, isUserEligibleForRefund: false, agentShouldRespond: false}

                REMINDER:
                - First, silently plan the intent and response path; then execute. Do not reveal your plan.
                - Decide tool vs direct response, then follow the applicable path.
                - Do not copy the user's email content.
                `
        });

        const response = await agent.invoke({
            messages: [
                new SystemMessage("You are processing a NEW user query. The conversation history below is for context ONLY — it represents prior completed turns. Do NOT repeat, reuse, or return any prior turn's subject or body as your current answer. You must generate a completely fresh response for the CURRENT user query."),
                ...conversationalMemory,
                new HumanMessage(`Current user query to process: ${userQuery}`)
            ],
        });

        const structuredResponse = this.normalizeStructuredResponse(response);
        Logger.Log(`[OrchestratorAgent] Normalized response | threadId: ${data.threadId} | intent: ${structuredResponse?.userInquiryTone} | agentShouldRespond: ${structuredResponse?.agentShouldRespond} | hasBody: ${!!structuredResponse?.body}`, 'info');

        if (structuredResponse?.userInquiryTone === QueryIntents.ESCALATION) {
            structuredResponse.agentShouldRespond = false;
            structuredResponse.subject = null;
            structuredResponse.body = null;
        }

        if (structuredResponse?.agentShouldRespond === false) {
            structuredResponse.subject = null;
            structuredResponse.body = null;
        }

        return structuredResponse;
    }



};



export default OrchestratorAgent;
