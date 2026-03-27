import BaseRepository from "../../core/repositories/baseRepository";
import { MONGODB_COLLECTIONS } from "../../utils/constants";
import { MenusSeed } from "./menusSeeder";


class MenusRepository extends BaseRepository {
    private static instance: MenusRepository;

    private constructor() {
        super(MONGODB_COLLECTIONS.MENUS, []);
    }

    public static getInstance(): MenusRepository {
        if (!MenusRepository.instance) {
            MenusRepository.instance = new MenusRepository();
        }
        return MenusRepository.instance;
    }

    public async INIT() {
        await super.INIT();
        await this.Seeder();
    }

    private async Seeder() {
        const count = await this.Count();
        if (!count) {
            await this.AddMany(MenusSeed)
        }
    }


}


export default MenusRepository;