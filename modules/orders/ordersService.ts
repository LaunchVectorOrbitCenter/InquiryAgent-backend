import { IProcessEmailResponseDTO } from "../../core/interfaces/aiServiceInterface";
import SeventeenTrackManager from "../../integration/seventeenTrackManager";
import TrackingNumbersService from "../../modules/trackingNumbers/trackingNumbersService";
import { TIME_SETTINGS } from "../../utils/constants";
import { Logger } from "../../utils/helpers/logger";


class OrdersService {

    /*
    * ╔══════════════════════════════════════╗
    * ║          PROTECTED METHODS           ║
    * ╚══════════════════════════════════════╝
    */



    /*
   * ╔═══════════════════════════════════╗
   * ║          PUBLIC METHODS           ║
   * ╚═══════════════════════════════════╝
    */


    public async trackOrder(data: IProcessEmailResponseDTO) {
        if (data.orderDetails[0]?.deliveryStatus) {
            return data.orderDetails[0].deliveryStatus;
        }

        let deliveryStatus = null;
        if (data.orderDetails[0].trackingNumber) {
            const trackingNumberRegistered = await TrackingNumbersService.checkTrackingNumberRegistered(data.storeSlug, data.orderDetails[0].trackingNumber, data.tenantId);
            if (!trackingNumberRegistered) {
                await TrackingNumbersService.storeTrackingNumber({ trackingNumber: data.orderDetails[0].trackingNumber, storeSlug: data.storeSlug, storeId: data.storeId, tenantId: data.tenantId });
                Logger.Console('Waiting before fetching tracking info...', 'info');
                await new Promise(resolve => setTimeout(resolve, TIME_SETTINGS.ORDER_TRACKING_WAIT_TIME));
            }

            deliveryStatus = await this.getTrackInfo(data.orderDetails[0].trackingNumber);
        }

        return deliveryStatus;
    }



    /*
   * ╔═══════════════════════════════════╗
   * ║          PRIVATE METHODS          ║
   * ╚═══════════════════════════════════╝
    */

    private async getTrackInfo(trackingNumber: string) {
        const deliveryStatus = await SeventeenTrackManager.getInstance().trackOrder(trackingNumber);
        return deliveryStatus;
    }

}



export default new OrdersService();