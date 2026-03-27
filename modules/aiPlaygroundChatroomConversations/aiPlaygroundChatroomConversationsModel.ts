import FillableField from "../../core/interfaces/fillableFields";
import BaseModel from "../../core/models/baseModel";
import { IAiPlaygroundChatroomConversation, AiPlaygroundChatroomConversationFillableFields } from "./aiPlaygroundChatroomConversationsInterface";


abstract class AiPlaygroundChatroomConversationsModel extends BaseModel<IAiPlaygroundChatroomConversation> {

    protected static getFillable(): FillableField[] {
        return AiPlaygroundChatroomConversationFillableFields;
    }

    public static create(data: Partial<IAiPlaygroundChatroomConversation>): IAiPlaygroundChatroomConversation {
        const fillables = this.getFillable();
        return this.fill(data, fillables);
    }

}


export default AiPlaygroundChatroomConversationsModel;
