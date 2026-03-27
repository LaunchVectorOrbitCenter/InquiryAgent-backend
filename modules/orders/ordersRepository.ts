import BaseRepository from "../../core/repositories/baseRepository";
import { MONGODB_COLLECTIONS } from "../../utils/constants";

class OrdersRepository extends BaseRepository {
    private static instance: OrdersRepository;

    private constructor() {
        super(MONGODB_COLLECTIONS.ORDERS, []);
    }

    public static getInstance(): OrdersRepository {
        if (!OrdersRepository.instance) {
            OrdersRepository.instance = new OrdersRepository();
        }
        return OrdersRepository.instance;
    }

    public async INIT() {
        await super.INIT();
    }

}

export default OrdersRepository;