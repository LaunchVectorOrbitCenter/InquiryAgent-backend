import TrackingNumbersModel from "./trackingNumbersModel";
import QueryOperators from "../../core/enums/queryOperators";
import SeventeenTrackManager from "../../integration/seventeenTrackManager";
import { IRegisterTrackingNumberDTO, ITrackingNumbers } from "./trackingNumbersInterface";
import { Utils } from "../../utils/utils";
import TrackingNumbersRepository from "./trackingNumbersRepository";


class TrackingNumbersService {


    protected attachMetaData(data: Partial<ITrackingNumbers>) {
        data.createdAt = Utils.getCurrentDate();
    }

    public async storeTrackingNumber(data: IRegisterTrackingNumberDTO) {
        this.attachMetaData(data);
        const newTrackingNumber = TrackingNumbersModel.create(data);
        await SeventeenTrackManager.getInstance().registerTrackingNumber(data.trackingNumber);
        await TrackingNumbersRepository.getInstance().Add(newTrackingNumber);
    }


    public async checkTrackingNumberRegistered(storeSlug: string, trackingNumber: string, tenantId: string) {
        const getTrackingNumberConditions: any = [
            {
                param: 'storeSlug',
                value: storeSlug,
                operator: QueryOperators.AND
            },
            {
                param: 'trackingNumber',
                value: trackingNumber,
                operator: QueryOperators.AND
            },
            {
                param: 'tenantId',
                value: tenantId,
                operator: QueryOperators.AND
            }
        ];

        const checkTrackingNumberRegistered = await TrackingNumbersRepository.getInstance().Count(getTrackingNumberConditions);
        return checkTrackingNumberRegistered;
    }


}

export default new TrackingNumbersService();