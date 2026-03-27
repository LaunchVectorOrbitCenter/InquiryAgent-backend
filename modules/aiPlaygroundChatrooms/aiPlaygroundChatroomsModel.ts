import FillableField from "../../core/interfaces/fillableFields";
import BaseModel from "../../core/models/baseModel";
import { IAiPlaygroundChatroom, AiPlaygroundChatroomFillableFields } from "./aiPlaygroundChatroomsInterface";


abstract class AiPlaygroundChatroomsModel extends BaseModel<IAiPlaygroundChatroom> {

    protected static getFillable(): FillableField[] {
        return AiPlaygroundChatroomFillableFields;
    }

    public static create(data: Partial<IAiPlaygroundChatroom>): IAiPlaygroundChatroom {
        const fillables = this.getFillable();
        return this.fill(data, fillables);
    }

}


export default AiPlaygroundChatroomsModel;
