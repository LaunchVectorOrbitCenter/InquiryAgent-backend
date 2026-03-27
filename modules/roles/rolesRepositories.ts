import BaseRepository from "../../core/repositories/baseRepository";
import { MONGODB_COLLECTIONS } from "../../utils/constants";
import { RolesSeed } from "./rolesSeeder";


class RolesRepository extends BaseRepository {
    private static instance: RolesRepository;

    private constructor() {
        super(MONGODB_COLLECTIONS.ROLES, []);
    }

    public static getInstance(): RolesRepository {
        if (!RolesRepository.instance) {
            RolesRepository.instance = new RolesRepository();
        }
        return RolesRepository.instance;
    }

    public async INIT() {
        await super.INIT();
        await this.Seeder();
    }

    private async Seeder() {
        const count = await this.Count();
        if (!count) {
            await this.AddMany(RolesSeed)
        }
    }


}


export default RolesRepository;