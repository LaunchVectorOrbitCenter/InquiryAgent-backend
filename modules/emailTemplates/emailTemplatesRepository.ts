import BaseRepository from "../../core/repositories/baseRepository";
import { MONGODB_COLLECTIONS } from "../../utils/constants";
import { EmailTemplatesSeed } from "./emailTemplatesSeeder";


class EmailTemplatesRepository extends BaseRepository {
    private static instance: EmailTemplatesRepository;

    private constructor() {
        super(MONGODB_COLLECTIONS.EMAIL_TEMPLATES, []);
    }

    public static getInstance(): EmailTemplatesRepository {
        if (!EmailTemplatesRepository.instance) {
            EmailTemplatesRepository.instance = new EmailTemplatesRepository();
        }
        return EmailTemplatesRepository.instance;
    }

    public async INIT() {
        await super.INIT();
        await this.Seeder();
    }

    private async Seeder() {
        const count = await this.Count();
        if (!count) {
            await this.AddMany(EmailTemplatesSeed);
        }
    }

}


export default EmailTemplatesRepository;