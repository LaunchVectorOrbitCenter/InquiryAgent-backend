import EmailThreadsModel from "./emailThreadsModel";
import { PAGE } from "../../utils/constants";
import EmailSenderTypes from "../../core/enums/emailSenderTypes";
import QueryOperators from "../../core/enums/queryOperators";
import { Utils } from "../../utils/utils";
import { IEmailThreads, IGetCustomerEmailThreadsDTO, IStoreEmailThreadDTO } from "./emailThreadsInterface";
import EmailThreadsRepository from "./emailThreadsRepository";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import IJWTPayload from "../../core/interfaces/jwt";

class EmailThreadsService {

    /*
    * ╔══════════════════════════════════════╗
    * ║          PROTECTED METHODS           ║
    * ╚══════════════════════════════════════╝
    */


    protected attachMetaData(data: Partial<IEmailThreads>) {
        data.createdAt = Utils.getCurrentDate();
    }


    /*
   * ╔═══════════════════════════════════╗
   * ║          PUBLIC METHODS           ║
   * ╚═══════════════════════════════════╝
    */



    public async storeEmailThreads(data: IStoreEmailThreadDTO) {
        this.attachMetaData(data);
        const newEmailThread = EmailThreadsModel.create(data);
        await EmailThreadsRepository.getInstance().Add(newEmailThread);
    }


    public async getEmailThreadsByThreadId(threadId: string) {
        const getEmailThreadConditions: any = [
            {
                param: 'threadId',
                value: threadId,
                operator: QueryOperators.AND
            }
        ];

        const emailThreads = EmailThreadsRepository.getInstance().GetAll(getEmailThreadConditions, false, null, 0, { createdAt: -1 }, ['emailContent', 'sentBy']);
        return emailThreads;
    }


    public async getConversationalMemory(threadId: string) {
        const getEmailThreadConditions: any = [
            {
                param: 'threadId',
                value: threadId,
                operator: QueryOperators.AND
            }
        ];

        console.log(threadId);

        let conversationHistory = [];

        const emailThreads: Record<string, any> = await EmailThreadsRepository.getInstance().GetAll(getEmailThreadConditions, true, PAGE, 5, { createdAt: -1 }, ['subject', 'emailContent', 'sentBy']);

        if (emailThreads.data.length) {
            const sortedConversationHistory = emailThreads.data.reverse();

            for (const msg of sortedConversationHistory) {
                if (msg.sentBy === EmailSenderTypes.USER) {
                    conversationHistory.push(new HumanMessage(`SUBJECT: ${msg.subject} \n BODY: ${msg.emailContent}`));
                } else {
                    conversationHistory.push(new AIMessage(`SUBJECT: ${msg.subject} \n BODY: ${msg.emailContent}`));
                }
            }
        }

        return conversationHistory
    }



    public async getCustomerEmailThreads(data: IGetCustomerEmailThreadsDTO, loggedInUser: IJWTPayload) {
        const emailThreads = await EmailThreadsRepository.getInstance().getCustomerEmailThreads(
            data.threadId,
            loggedInUser?.tenantId
        );

        return { emailThreads }
    }


    /*
   * ╔═══════════════════════════════════╗
   * ║          PRIVATE METHODS          ║
   * ╚═══════════════════════════════════╝
    */


}


export default new EmailThreadsService();
