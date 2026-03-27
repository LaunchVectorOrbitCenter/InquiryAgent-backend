import BaseRepository from "../../core/repositories/baseRepository";
import { MONGODB_COLLECTIONS } from "../../utils/constants";


class StoresRepository extends BaseRepository {
    private static instance: StoresRepository;

    private constructor() {
        super(MONGODB_COLLECTIONS.STORES, []);
    }

    public static getInstance(): StoresRepository {
        if (!StoresRepository.instance) {
            StoresRepository.instance = new StoresRepository();
        }
        return StoresRepository.instance;
    }

    public async INIT() {
        await super.INIT();
    }

}

export default StoresRepository;