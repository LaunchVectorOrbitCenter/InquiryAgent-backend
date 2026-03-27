import BaseRepository from "../../core/repositories/baseRepository";
import { MONGODB_COLLECTIONS } from "../../utils/constants";

class TrackingNumbersRepository extends BaseRepository {
    private static instance: TrackingNumbersRepository;

    private constructor() {
        super(MONGODB_COLLECTIONS.TRACKING_NUMBERS, []);
    }

    public static getInstance(): TrackingNumbersRepository {
        if (!TrackingNumbersRepository.instance) {
            TrackingNumbersRepository.instance = new TrackingNumbersRepository();
        }
        return TrackingNumbersRepository.instance;
    }

    public async INIT() {
        await super.INIT();
    }

}

export default TrackingNumbersRepository;