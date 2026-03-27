import BaseRepository from "../../core/repositories/baseRepository";
import { MONGODB_COLLECTIONS } from "../../utils/constants";


class AiPlaygroundChatroomConversationsRepository extends BaseRepository {
    private static instance: AiPlaygroundChatroomConversationsRepository;

    private constructor() {
        super(MONGODB_COLLECTIONS.PLAYGROUND_MESSAGES, []);
    }

    public static getInstance(): AiPlaygroundChatroomConversationsRepository {
        if (!AiPlaygroundChatroomConversationsRepository.instance) {
            AiPlaygroundChatroomConversationsRepository.instance = new AiPlaygroundChatroomConversationsRepository();
        }
        return AiPlaygroundChatroomConversationsRepository.instance;
    }

    public async INIT() {
        await super.INIT();
    }

}


export default AiPlaygroundChatroomConversationsRepository;
