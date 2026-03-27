import BaseRepository from "../../core/repositories/baseRepository";
import { MONGODB_COLLECTIONS } from "../../utils/constants";
import { UsersSeed } from "./usersSeeder";

class UsersRepository extends BaseRepository {
    private static instance: UsersRepository;

    private constructor() {
        super(MONGODB_COLLECTIONS.USERS, []);
    }

    public static getInstance(): UsersRepository {
        if (!UsersRepository.instance) {
            UsersRepository.instance = new UsersRepository();
        }
        return UsersRepository.instance;
    }

    public async INIT() {
        await super.INIT();
        await this.Seeder();
    }

    private async Seeder() {
        const count = await this.Count();
        if (!count) {
            await this.AddMany(UsersSeed);
        }
    }

}

export default UsersRepository;