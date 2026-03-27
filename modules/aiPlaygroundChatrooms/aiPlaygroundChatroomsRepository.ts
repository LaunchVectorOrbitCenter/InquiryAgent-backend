import BaseRepository from "../../core/repositories/baseRepository";
import { MONGODB_COLLECTIONS } from "../../utils/constants";


class AiPlaygroundChatroomsRepository extends BaseRepository {
    private static instance: AiPlaygroundChatroomsRepository;

    private constructor() {
        super(MONGODB_COLLECTIONS.PLAYGROUND_CHATROOMS, []);
    }

    public static getInstance(): AiPlaygroundChatroomsRepository {
        if (!AiPlaygroundChatroomsRepository.instance) {
            AiPlaygroundChatroomsRepository.instance = new AiPlaygroundChatroomsRepository();
        }
        return AiPlaygroundChatroomsRepository.instance;
    }

    public async INIT() {
        await super.INIT();
    }

}


export default AiPlaygroundChatroomsRepository;
