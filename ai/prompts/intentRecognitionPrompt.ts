import { ChatPromptTemplate } from "@langchain/core/prompts";


class IntentRecognitionPrompt {

    public getIntentRecognitionPromptTemplate() {
        const intentRecognitionPromptTemplate = ChatPromptTemplate.fromMessages([
            ["system", `
                        You are a smart AI assistant that classifies user queries into:
                                1. "delivery_status" if the user is asking about delivery status
                                2. "refund" if the user is asking for a refund
                                3. "subscription_inquiry" if the user asks to cancel or modify their subscription
                                4. "order_cancellation" if the user asks to cancel an order
                                5. "multiple_contexts" if the user query includes multiple valid contexts
                                6. "complex_query" if the user query is complex and requires human intervention
                                7. "out_of_context" if the question is unrelated

                                Additionally, 
                                - Detect if the user has provided an order number or tracking number. 
                                - Provide a user query summary if the intent is not "Out of Context".
                                - If user query includes multiple valid contexts, the set the key "parkToManualInquiriesQueue"
                                - If user query is complex and requires human intervention, the set the key "parkToManualInquiriesQueue"

                                **Response Format:**
                                Return a **valid JSON object only**, following this structure:
                                {{
                                    "intent": "delivery_status" | "refund" | "out_of_context",
                                    "hasOrderId": true | false,
                                    "hasTrackingNumber": true | false,
                                    "orderNumber": string | null,
                                    "trackingNumber": string | null,
                                    "userQuerySummary":string,
                                    "parkToManualInquiriesQueue": boolean
                                }}
                        `
            ],

            ["human", "{query}"],
        ]);

        return intentRecognitionPromptTemplate;
    }

}


export default new IntentRecognitionPrompt();