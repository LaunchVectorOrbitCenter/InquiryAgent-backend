import axios from "axios";
import { Logger } from "../utils/helpers/logger";
import { SeventeenTrackMainStatuses, SeventeenTrackSubStatuses } from "../utils/constants";
import StatusTypes from "../core/enums/statusTypes";
import { SeventeenTrackAuth } from "../core/interfaces/appConfig";



class SeventeenTrackManager {
    private static instance: SeventeenTrackManager;
    private config: SeventeenTrackAuth | null = null;

    private constructor() { }




    public static getInstance(): SeventeenTrackManager {
        if (!SeventeenTrackManager.instance) {
            SeventeenTrackManager.instance = new SeventeenTrackManager();
        }
        return SeventeenTrackManager.instance;
    }


    public async setConfig(config: SeventeenTrackAuth) {
        this.config = config;
        Logger.Console(`17Track credentials configured successfully`, 'info');
    }



    public async registerTrackingNumber(trackingNumber: string) {
        try {

            const headers = {
                'Content-Type': 'application/json',
                '17token': this.config.apiToken
            };

            const data = [
                {
                    "number": trackingNumber
                }
            ];

            const response = await axios.post('https://api.17track.net/track/v2.2/register', data, { headers });

            if (response.data.data.accepted.length) {
                Logger.Console('Tracking number registered successfully', 'info');
            }

        } catch (error) {
            console.log("Error occurred while registering the tracking number");
            console.log(error);
            // throw new Error("Error occurred while registering the tracking number");
        }
    }



    public async trackOrder(trackingNumber: string) {
        try {

            const headers = {
                'Content-Type': 'application/json',
                '17token': this.config.apiToken
            };

            const data = [
                {
                    "number": trackingNumber
                }
            ];

            const response = await axios.post('https://api.17track.net/track/v2.2/gettrackinfo', data, { headers });

            if (response.data.data.accepted.length) {
                Logger.Console('Order tracked successfully', 'info');
                const mainStatus = SeventeenTrackMainStatuses[response.data.data.accepted[0].track_info.latest_status.status];
                const subStatus = SeventeenTrackSubStatuses[response.data.data.accepted[0].track_info.latest_status.status][response.data.data.accepted[0].track_info.latest_status.sub_status];

                return {
                    status: mainStatus,
                    subStatus,
                    orderDeliveredAt: response.data.data.accepted[0].track_info.latest_status.status === StatusTypes.DELIVERED ? response.data.data.accepted[0].track_info.latest_event.time_iso : null
                }
            }
            else {
                return {
                    status: "TRACKING_NUMBER_NOT_FOUND",
                    subStatus: "No tracking info available at the moment",
                    orderDeliveredAt: null
                };
            }

        } catch (error) {
            console.log(error);
            throw new Error("Error occurred while tracking the order");
        }

    }


}

export default SeventeenTrackManager;