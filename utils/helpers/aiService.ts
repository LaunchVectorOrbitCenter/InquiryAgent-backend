// import axios from "axios";
// import { Application } from "../../app";
// import TrackingNumbersService from "../../modules/trackingNumbers/trackingNumbersService";
// import SeventeenTrackManager from "../../integration/seventeenTrackManager";
// import QueryIntents from "../../core/enums/queryIntents";
// import { Utils } from "../utils";
// import { Logger } from "./logger";
// import EnvironmentTypes from "../../core/enums/environmentTypes";
// import EmailThreadsService from "../../modules/emailThreads/emailThreadsService";
// import { StoreConfigurations } from "../constants";
// import { IAnalyzeEmailDTO, IProcessEmailResponseDTO, CustomerDetailsSnapshot } from "../../core/interfaces/aiServiceInterface";



// class AIService {


//     public async analyzeEmail(data: IAnalyzeEmailDTO) {
//         const response = await this.processAIResponse(data);

//         return response?.emailContent
//             ? { emailResponse: JSON.parse(response.emailContent), intent: response.intent }
//             : null;
//     }


//     private async processAIResponse(data: IProcessEmailResponseDTO) {
//         const classification = await this.classifyQuery(data.emailContent);
//         const { intent, userQuerySummary } = classification;

//         // if (!data.orderDetails[0]?.trackingNumber) {
//         //     data.orderDetails[0].trackingNumber = classification.trackingNumber
//         // 

//         console.log({ intent });

//         let response = null;

//         switch (intent) {
//             case QueryIntents.OUT_OF_CONTEXT:
//                 return null;

//             case QueryIntents.DELIVERY_STATUS:
//                 response = await this.handleDeliveryStatusIntent(data, userQuerySummary);
//                 return { intent, emailContent: response };

//             case QueryIntents.REFUND:
//                 response = await this.handleRefundIntent(data, userQuerySummary);
//                 return { intent, emailContent: response };

//             case QueryIntents.SUBSCRIPTION_INQUIRY:
//                 response = await this.handleSubscriptionInquiryIntent(data, userQuerySummary);
//                 return { intent, emailContent: response };

//             case QueryIntents.ORDER_CANCELLATION:
//                 response = await this.handleOrderCancellationIntent(data, userQuerySummary);
//                 return { intent, emailContent: response };

//             default:
//                 console.error('Unknown intent type passed');
//         }

//     };

//     private async classifyQuery(query: string) {
//         try {
//             const response = await axios.post(
//                 Application.conf.OPENAI_API.url,
//                 {
//                     ...(Application.conf.ENV === EnvironmentTypes.LOCAL ? {} : { model: 'gpt-4o-mini' }),
//                     messages: [
//                         {
//                             role: "system",
//                             content: `You are a smart AI assistant that classifies user queries into:
//                                 1. "delivery_status" if the user is asking about delivery status
//                                 2. "refund" if the user is asking for a refund
//                                 3. "subscription_inquiry" if the user asks to cancel or modify their subscription
//                                 4. "order_cancellation" if the user asks to cancel an order
//                                 5. "out_of_context" if the question is unrelated

//                                 Additionally, detect if the user has provided an order number or tracking number. And provide a user query summary if the intent is not "Out of Context".

//                                 **Response Format:**
//                                 Return a **valid JSON object only**, following this structure:
//                                 {
//                                     "intent": "delivery_status" | "refund" | "out_of_context",
//                                     "hasOrderId": true | false,
//                                     "hasTrackingNumber": true | false,
//                                     "orderNumber": string | null,
//                                     "trackingNumber": string | null,
//                                     "userQuerySummary":string
//                                 }
                                    
//                                 NOTE: Do not include any markdown, backticks, or extra formatting. Respond with just the raw JSON object. (e.g: 
//                                     {
//                                         "intent": "delivery_status" | "refund" | "out_of_context",
//                                         "hasOrderId": true | false,
//                                         "hasTrackingNumber": true | false,
//                                         "orderNumber": string | null,
//                                         "trackingNumber": string | null,
//                                         "userQuerySummary":string
//                                     }
//                                 )
//                                 `
//                         },
//                         { role: "user", content: query }
//                     ],
//                     temperature: 0,
//                     max_tokens: 100
//                 },
//                 {
//                     headers: {
//                         "Content-Type": "application/json",
//                         ...(Application.conf.ENV === EnvironmentTypes.LOCAL ? { "api-key": Application.conf.OPENAI_API.key } : { "Authorization": `Bearer ${Application.conf.OPENAI_API.key}` })
//                     }
//                 }
//             );

//             return JSON.parse(response.data.choices[0]?.message?.content?.trim());

//         } catch (error) {
//             console.error("Error classifying query:", error.message);
//             return { intent: "Error", hasOrderId: false, hasTrackingNumber: false };
//         }
//     };


//     private async generateEmailResponse(status: string, storeName: string, conversationalMemory: Record<string, any>[], customerDetails: CustomerDetailsSnapshot) {
//         try {

//             const response = await axios.post(
//                 Application.conf.OPENAI_API.url,
//                 {
//                     ...(Application.conf.ENV === EnvironmentTypes.LOCAL ? {} : { model: 'gpt-4o-mini' }),
//                     messages: [
//                         {
//                             role: "system",
//                             content: `You are an AI customer support assistant at ${storeName}, a brand known for its warm, human-centric service.

//                             You will be responding in an email thread format. Users may follow up multiple times in the same thread, often repeating their concern. Always maintain an empathetic, engaging tone — never sound robotic or repetitive.

//                             Make your responses friendly, personalized, and slightly varied in tone or wording to avoid redundancy. Even if the answer (like delivery confirmation) is the same, present it in a way that feels like a human writing a thoughtful reply.

//                             Each response should include:
//                             - A relevant **email subject**
//                             - An **HTML-formatted email body**
//                             - Natural language (no copy-paste tone)
//                             - An option to reach out again (open-ended closing line)
//                             - Always use collective pronouns such as **we** or **us**
//                             - Always begin with "Dear ${customerDetails.name.trim()}"
//                             - If tracking link is available, include them in the email in a more extended format (e.g <a href={{tracking_link}}>Track Your Order</a>)

//                             Your writing style should be: 
//                             - Empathetic but professional.
//                             - Conversational yet informative.
//                             - Lightly varied between follow-ups (avoid identical sentences).

//                             **Response Format:**  
//                             Return a **valid JSON object only**, following this structure:  
    
//                             {
//                                 "subject": string, 
//                                 "body": html
//                             }
//                             `
//                         },
//                         ...conversationalMemory,
//                         { role: "user", content: status }
//                     ],
//                     temperature: 0.5,
//                     max_tokens: 250
//                 },
//                 {
//                     headers: {
//                         "Content-Type": "application/json",
//                         ...(Application.conf.ENV === EnvironmentTypes.LOCAL ? { "api-key": Application.conf.OPENAI_API.key } : { "Authorization": `Bearer ${Application.conf.OPENAI_API.key}` })
//                     }
//                 }
//             );

//             return response.data.choices[0]?.message?.content?.trim();
//         }
//         catch (error) {
//             console.log(error);
//             console.error("Error generating email:", error.message);
//             return null;
//         }
//     };


//     private async generateRefundEmailResponse(
//         orderDetails: Record<string, any>,
//         refundPolicy: string,
//         querySummary: string,
//         storeName: string,
//         conversationalMemory: Record<string, any>[],
//         customerDetail: CustomerDetailsSnapshot
//     ) {
//         try {
//             const response = await axios.post(
//                 Application.conf.OPENAI_API.url,
//                 {
//                     ...(Application.conf.ENV === EnvironmentTypes.LOCAL ? {} : { model: 'gpt-4o-mini' }),
//                     messages: [
//                         {
//                             role: "system",
//                             content: `You are a highly professional and empathetic customer support representative at ${storeName}. Your role is to craft a structured, formal, and helpful email response regarding a customer's refund request.

//                             ### **Guidelines for Response:**
                            
//                             - **Analyze Refund Eligibility:** Based on **order status, refund policy, and delivery date**, determine if the user qualifies for a refund.
                            
//                             - **Calculate Days Passed Since Delivery:**  
//                                 - The order was delivered on: ${orderDetails?.status?.orderDeliveredAt?.split('T')[0]}.  
//                                 - The current date is: ${orderDetails?.status?.currentDate?.split('T')[0]}. 
//                                 - Days passed after delivery: ${orderDetails?.status?.daysPassedAfterDelivery}
//                                 - DO NOT MENTION THE DATES IF THE CURRENT DATE AND orderDeliveredAt ARE NULL OR UNDEFINED
//                                 - If the refund policy states a time restriction (e.g., "Refunds allowed within 30 days"), **EXPLICITLY CHECK THAT**: (days passed <= allowed days).

//                             - **Ensure a Professional & Courteous Tone:**
//                                 - Start with: **"Dear ${customerDetail.name.trim()}, \n Thank you for reaching out to ${storeName} Customer Support."**
//                                 - Clearly acknowledge the refund request.
//                                 - Maintain a polite and professional approach, even if the refund is **not eligible**.
                            
//                             - **Decision-Based Response:**  
//                                 - If the refund **is not eligible**, **explain the reason based on the refund policy** and suggest alternative solutions.
                            
//                             - **Handling Missing Tracking Information:**  
//                                 - If the tracking number **is not available**, state: **"Tracking information is not available at this time. Please check again later."**
                            
//                             - **Highlight Key Information:**  
//                                 - Important details like **dates, policy terms, and refund status** should be **bold**.
                            
//                             - **Professional Closing:**  
//                                 "Regards, \n
//                                 ${storeName}"

//                             ### **Refund Policy:**  
//                             ${refundPolicy}

//                             ### **Order Details:**  
//                             ${JSON.stringify(orderDetails)}

//                             ### **Response Format Requirement:**  
//                             Return **only** a valid JSON object with no additional text, formatting, or explanations. The response must strictly follow this structure:

//                             {
//                                 "subject": string,
//                                 "body": html,
//                                 "isUserEligibleForRefund": boolean
//                             }

//                             Do not include any markdown, backticks, or extra formatting. Respond with just the raw JSON object.
//                             `
//                         },
//                         ...conversationalMemory,
//                         { role: "user", content: querySummary }
//                     ],
//                     temperature: 0.6,
//                     max_tokens: 400
//                 },
//                 {
//                     headers: {
//                         "Content-Type": "application/json",
//                         ...(Application.conf.ENV === EnvironmentTypes.LOCAL ? { "api-key": Application.conf.OPENAI_API.key } : { "Authorization": `Bearer ${Application.conf.OPENAI_API.key}` })
//                     }
//                 }
//             );

//             return response.data.choices[0]?.message?.content?.trim();
//         } catch (error) {
//             console.error("Error generating email:", error.message);
//             return null;
//         }
//     };


//     private async generateSubscriptionInquiryEmailResponse(data: IProcessEmailResponseDTO, userQuerySummary: string, conversationalMemory: Record<string, any>[]) {
//         try {

//             const customerDetails = data.customerDetail;

//             const response = await axios.post(
//                 Application.conf.OPENAI_API.url,
//                 {
//                     ...(Application.conf.ENV === EnvironmentTypes.LOCAL ? {} : { model: 'gpt-4o-mini' }),
//                     messages: [
//                         {
//                             role: "system",
//                             content: `You are an AI customer support assistant at ${data.maskedName}, a brand known for its warm, human-centric service. 
                            
//                             Your job is to handle subscription related inquiries from customers. 
                            
//                             Always maintain an empathetic, engaging tone — never sound robotic or repetitive.

//                             Articulate your responses in a friendly, personalized, in a way that feels like a human writing a thoughtful reply.

//                             Each response should include:
//                             - A relevant **email subject**
//                             - An **HTML-formatted email body**
//                             - Natural language (no copy-paste tone)
//                             - An option to reach out again (open-ended closing line)
//                             - Always use collective pronouns such as **we** or **us**
//                             - Always begin with "Dear ${customerDetails.name.trim()}"
//                             - The subscription management portal link is: ${data.subscriptionPortalUrl}, include it in the email if needed in a more extended format (e.g <a href={{subscription_portal_link}}>Manage Your Subscription</a>)

//                             Your writing style should be: 
//                             - Empathetic but professional.
//                             - Conversational yet informative.

//                             **Response Format:**  
//                             Return a **valid JSON object only**, following this structure:  
    
//                             {
//                                 "subject": string, 
//                                 "body": html
//                             }
//                             `
//                         },
//                         ...conversationalMemory,
//                         { role: "user", content: userQuerySummary }
//                     ],
//                     temperature: 0.5,
//                     max_tokens: 250
//                 },
//                 {
//                     headers: {
//                         "Content-Type": "application/json",
//                         ...(Application.conf.ENV === EnvironmentTypes.LOCAL ? { "api-key": Application.conf.OPENAI_API.key } : { "Authorization": `Bearer ${Application.conf.OPENAI_API.key}` })
//                     }
//                 }
//             );

//             return response.data.choices[0]?.message?.content?.trim();
//         }
//         catch (error) {
//             console.log(error);
//             console.error("Error generating email:", error.message);
//             return null;
//         }
//     }


//     private async generateOrderCancellationInquiryEmailResponse(data: IProcessEmailResponseDTO, userQuerySummary: string, conversationalMemory: Record<string, any>[], eligibilityStatus: Record<string, any>) {
//         try {
//             const customerDetails = data.customerDetail;
//             const response = await axios.post(
//                 Application.conf.OPENAI_API.url,
//                 {
//                     ...(Application.conf.ENV === EnvironmentTypes.LOCAL ? {} : { model: 'gpt-4o-mini' }),
//                     messages: [

//                         //TODO: REMOVE THE BELOW SYSTEM INSTRUCTION AFTER EMAIL RESPONSE ACCURACY IS IMPROVED
//                         // {
//                         //     role: "system",
//                         //     content: `You are an AI customer-support assistant for ${data.maskedName}, a brand celebrated for its warm, human-centric service. Your sole focus is handling order cancellation inquiries.

//                         //     On each interaction:
//                         //     1. Parse the customer's details and the JSON payload ${JSON.stringify(eligibilityStatus)}.
//                         //     2. If \"isOrderSubscriptionBased\": true in the payload, check whether the user has already confirmed in prior messages that they want to cancel their order versus their subscription.

//                         //     2. Determine order cancellation eligibility.
//                         //     3. Respond with a personalized, empathetic tone—never robotic or repetitive.
//                         //     4. Always use “we” and “us” to reinforce our collective voice.
//                         //     5. Articulate your responses in a friendly, personalized, in a way that feels like a human writing a thoughtful reply.

//                         //     Each response should include:
//                         //     - A relevant **email subject**
//                         //     - An **HTML-formatted email body**
//                         //     - Natural language (no copy-paste tone)
//                         //     - An option to reach out again (open-ended closing line)
//                         //     - Always use collective pronouns such as **we** or **us**
//                         //     - Always begin with "Dear ${customerDetails.name.trim()}"

//                         //     Your writing style should be: 
//                         //     - Empathetic but professional.
//                         //     - Conversational yet informative.
//                         //     - Professional Closing:
//                         //         "Regards, \n
//                         //         ${data.maskedName}"

//                         //     **Response Format:**  
//                         //     Return a **valid JSON object only**, following this structure:  

//                         //     {
//                         //         "subject": string, 
//                         //         "body": html,
//                         //         "isUserEligibleForCancellation": boolean
//                         //     }
//                         //     `
//                         // },
//                         // {
//                         //     "role": "system",
//                         //     "content": `You are an AI customer-support assistant for ${data.maskedName}, a brand celebrated for its warm, human-centric service. Your sole focus is handling order cancellation inquiries.

//                         //         On each interaction:
//                         //             1. Review the customer's conversation history and current query carefully.
//                         //             2. Parse the customer's details and the JSON payload ${JSON.stringify(eligibilityStatus)}.
//                         //             3. If \"isOrderSubscriptionBased\": true in the payload, check whether the user has already confirmed in prior messages that they want to cancel their order versus their subscription.  
//                         //                 • If the intent has not yet been confirmed, first ask the user: \"Would you like to cancel your order or your subscription?\" and wait for their clarification and DO NOT CHECK THEIR CANCELLATION ELIGIBILITY. 
//                         //                 • If the user has already made their intent clear, proceed directly to the cancellation flow for the specified item (order or subscription).
//                         //             4. Determine the customer's eligibility for cancellation based on the payload and any business rules.
//                         //             5. Respond with a personalized, empathetic tone—never robotic or repetitive. Always use “we” and “us” to reinforce our collective voice.
//                         //             6. Articulate your responses in a friendly, human style that feels like a thoughtful reply.
//                         //             Each response should include:
//                         //                 - A relevant **email subject**
//                         //                 - An **HTML-formatted email body**
//                         //                 - Natural language (no copy-paste tone)
//                         //                 - An open-ended closing line inviting further questions (If you need any more help, please let us know.)
//                         //                 - Always use collective pronouns such as **we** or **us**
//                         //                 - Always begin with \"Dear ${customerDetails.name.trim()}\"
//                         //             Your writing style should be:
//                         //                 - Empathetic but professional.
//                         //                 - Conversational yet informative.
//                         //             Professional Closing:
//                         //                 \"Regards, \n${data.maskedName}\"
//                         //         **Response Format:** 
//                         //                 Return a **valid JSON object only**, following this structure:
//                         //                 {"subject": string,"body": html, "isUserEligibleForCancellation": boolean}`
//                         // },

//                         //! BETA SYSTEM INSTRUCTION
//                         {
//                             "role": "system",
//                             "content": `You are an AI customer-support assistant for ${data.maskedName}, a brand celebrated for its warm, human-centric service. Your sole focus is handling order cancellation inquiries.
//                             On each interaction:
//                                 1. Review the customer's conversation history and current query carefully.
//                                 2. Parse the customer's details and the JSON payload ${JSON.stringify(eligibilityStatus)}.
//                                 3. If "isOrderSubscriptionBased": true in the payload, check whether the user has already confirmed in prior messages that they want to cancel their order versus their subscription.
//                                     • If the intent has not yet been confirmed, ask exactly: "Would you like to cancel your order or your subscription?" and wait for their clarification — DO NOT CHECK cancellation eligibility, and DO NOT MENTION that the order is part of a subscription IF CLARIFICATION IS NEED FROM THE USER.

//                                     • If the user has already made their intent clear, proceed directly to the cancellation flow for the specified item (order or subscription).
//                                 4. Determine the customer's eligibility for cancellation based on the payload and any business rules. If the user is ineligible for order cancellation, provide a clear, empathetic, and professional response that gently explains why they cannot cancel, detailing the specific reason(s) for their ineligibility.
//                                 5. Respond with a personalized, empathetic tone—never robotic or repetitive. Always use “we” and “us” to reinforce our collective voice.
//                                 6. Articulate your responses in a friendly, human style that feels like a thoughtful reply.

//                             Each response should include:
//                                 - A relevant **email subject**
//                                 - An **HTML-formatted email body**
//                                 - Natural language (no copy-paste tone)
//                                 - An open-ended closing line inviting further questions (If you need any more help, please let us know.)
//                                 - Always use collective pronouns such as **we** or **us**. NEVER USE FIRST-PERSON pronoun such as **I** 
//                                 - Always begin with "Dear ${customerDetails.name.trim()}"

//                             Your writing style should be:
//                                 - Empathetic but professional.
//                                 - Conversational yet informative.

//                             Professional Closing:
//                                 "Regards,
//                                 ${data.maskedName}"

//                             **Response Format:**
//                                 Return a **valid JSON object only**, following this structure:
//                                 {
//                                     "subject": string,
//                                     "body": html,
//                                     "isUserEligibleForCancellation": boolean
//                                 }`
//                         },

//                         ...conversationalMemory,
//                         { role: "user", content: data.emailContent }
//                     ],
//                     temperature: 0.5,
//                     max_tokens: 250
//                 },
//                 {
//                     headers: {
//                         "Content-Type": "application/json",
//                         ...(Application.conf.ENV === EnvironmentTypes.LOCAL ? { "api-key": Application.conf.OPENAI_API.key } : { "Authorization": `Bearer ${Application.conf.OPENAI_API.key}` })
//                     }
//                 }
//             );

//             return response.data.choices[0]?.message?.content?.trim();
//         }
//         catch (error) {
//             console.log(error);
//             console.error("Error generating email:", error.message);
//             return null;
//         }
//     }



//     //************************ HANDLER FUNCTIONS ************************ */


//     private async handleDeliveryStatusIntent(data: IProcessEmailResponseDTO, userQuerySummary: string) {
//         let deliveryStatus = null;

//         if (data.orderDetails[0].trackingNumber) {
//             const trackingNumberRegistered = await TrackingNumbersService.checkTrackingNumberRegistered(data.storeSlug, data.orderDetails[0].trackingNumber, data.tenantId);
//             if (!trackingNumberRegistered) {
//                 await TrackingNumbersService.storeTrackingNumber({ trackingNumber: data.orderDetails[0].trackingNumber, storeSlug: data.storeSlug, storeId: data.storeId, tenantId: data.tenantId });
//                 Logger.Console('Waiting before fetching tracking info...', 'info');
//                 await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
//             }
//             deliveryStatus = await this.getTrackInfo(data.orderDetails[0].trackingNumber);
//         }

//         if (deliveryStatus?.status === "TRACKING_NUMBER_NOT_FOUND" || !data.orderDetails[0]?.trackingNumber) {
//             const conversationalMemory = await EmailThreadsService.getConversationalMemory(data.threadId);
//             const response =
//                 await this.generateEmailResponse(JSON.stringify({ userQuery: userQuerySummary, status: 'TRACKING_NUMBER_NOT_FOUND' }), data.maskedName, conversationalMemory, data.customerDetail);
//             return response
//         }
//         else {
//             const conversationalMemory = await EmailThreadsService.getConversationalMemory(data.threadId);

//             const response = await this.generateEmailResponse(JSON.stringify({ userQuery: userQuerySummary, status: { mainStatus: deliveryStatus?.mainStatus, subStatus: deliveryStatus?.subStatus, trackingUrl: data.orderDetails[0]?.trackingUrl } }), data.maskedName, conversationalMemory, data.customerDetail);
//             return response
//         }
//     }


//     private async handleRefundIntent(data: IProcessEmailResponseDTO, userQuerySummary: string) {
//         let deliveryStatus = null;

//         if (data.orderDetails[0].trackingNumber) {
//             const trackingNumberRegistered = await TrackingNumbersService.checkTrackingNumberRegistered(data.storeSlug, data.orderDetails[0].trackingNumber, data.tenantId);
//             if (!trackingNumberRegistered) {
//                 await TrackingNumbersService.storeTrackingNumber({ trackingNumber: data.orderDetails[0].trackingNumber, storeSlug: data.storeSlug, storeId: data.storeId, tenantId: data.tenantId });
//                 Logger.Console('Waiting before fetching tracking info...', 'info');
//                 await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
//             }
//             deliveryStatus = await this.getTrackInfo(data.orderDetails[0].trackingNumber);
//         }

//         const statusToAnalyze = {
//             status: {
//                 mainStatus: deliveryStatus?.mainStatus,
//                 subStatus: deliveryStatus?.subStatus,
//                 orderDeliveredAt: deliveryStatus?.orderDeliveredAt,
//                 currentDate: Utils.getCurrentDate(),
//                 daysPassedAfterDelivery: deliveryStatus?.orderDeliveredAt ? Utils.getTimeDifferenceInDays(deliveryStatus?.orderDeliveredAt, Utils.getCurrentDate()) : null
//             }
//         }
//         const conversationalMemory = await EmailThreadsService.getConversationalMemory(data.threadId);

//         const response = await this.generateRefundEmailResponse(statusToAnalyze, data.refundPolicy, userQuerySummary, data.maskedName, conversationalMemory, data.customerDetail);
//         return response;
//     }


//     private async handleSubscriptionInquiryIntent(data: IProcessEmailResponseDTO, userQuerySummary: string) {
//         if (data?.subscriptionPortalUrl) {
//             const conversationalMemory = await EmailThreadsService.getConversationalMemory(data.threadId);
//             const response = await this.generateSubscriptionInquiryEmailResponse(data, userQuerySummary, conversationalMemory);
//             return response;
//         }
//     }


//     private async handleOrderCancellationIntent(data: IProcessEmailResponseDTO, userQuerySummary: string) {
//         const createdAt = new Date(data.orderDetails[0].orderCreatedAt);
//         const now = new Date();
//         const diffMs = now.getTime() - createdAt.getTime();
//         const hoursPassed = Math.floor(diffMs / (1000 * 60 * 60));

//         const elapsedTimeNotation = Utils.formatElapsedHours(hoursPassed);

//         const conversationalMemory = await EmailThreadsService.getConversationalMemory(data.threadId);

//         if (StoreConfigurations.defaultOrderCancellationEligibilityWindowInHours < hoursPassed) {
//             const eligibilityStatus = {
//                 isEligibleForCancellation: false,
//                 inEligibilityReason: 'ORDER_CANCELLATION_ELIGIBILITY_WINDOW_EXCEEDED',
//                 cancellationEligibilityWindow: `${StoreConfigurations.defaultOrderCancellationEligibilityWindowInHours} hours`,
//                 orderPlacedAt: data.orderDetails[0].orderCreatedAt,
//                 timePassedAfterOrderPlaced: `${elapsedTimeNotation}`,
//                 currentDateTime: now,
//                 isOrderSubscriptionBased: data.orderDetails[0].tags.includes('Subscription')
//             }
//             const aiResponse = await this.generateOrderCancellationInquiryEmailResponse(data, userQuerySummary, conversationalMemory, eligibilityStatus);
//             return aiResponse;
//         }
//         else {
//             return JSON.stringify({
//                 isUserEligibleForCancellation: true
//             });
//         }
//     }



//     //* TOOLS
//     private async getTrackInfo(trackingNumber: string) {
//         const deliveryStatus = await SeventeenTrackManager.getInstance().trackOrder(trackingNumber);
//         return deliveryStatus;
//     }

// }


// export default new AIService();