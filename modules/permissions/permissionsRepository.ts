import BaseRepository from "../../core/repositories/baseRepository";
import { MONGODB_COLLECTIONS } from "../../utils/constants";
import { PermissionsSeed } from "./permissionsSeeder";


class PermissionsRepository extends BaseRepository {
    private static instance: PermissionsRepository;

    private constructor() {
        super(MONGODB_COLLECTIONS.PERMISSIONS, []);
    }

    public static getInstance(): PermissionsRepository {
        if (!PermissionsRepository.instance) {
            PermissionsRepository.instance = new PermissionsRepository();
        }
        return PermissionsRepository.instance;
    }

    public async INIT() {
        await super.INIT();
        await this.Seeder();
    }

    private async Seeder() {
        const count = await this.Count();
        if (!count) {
            await this.AddMany(PermissionsSeed)
        }
    }


}


export default PermissionsRepository;