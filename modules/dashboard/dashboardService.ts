import EmailQueriesRepository from "../emailQueries/emailQueriesRepository";
import QueryOperators from "../../core/enums/queryOperators";
import { IGetDashboardAnalytics, IGetDashboardInsightsRequestDTO, IGetUserEmailResponsesDashboardInsightsRequestDTO } from "./dashboardInterface";
import IJWTPayload from "../../core/interfaces/jwt";
import StoresRepository from "../stores/storesRepository";
import SystemAlertsRepository from "../systemAlerts/systemAlertsRepository";
import EmailsRepository from "../emails/emailsRepository";
import { Utils } from "../../utils/utils";


class DashboardService {


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

    public async getDashboardInsights(loggedInUser: IJWTPayload, data: IGetDashboardInsightsRequestDTO) {

        const [connectedStoresCount, respondedEmailsCount, alertsCount] = await Promise.all([
            this.getUserConnectedStores(loggedInUser),
            this.getRespondedEmailsCount(loggedInUser, data),
            this.getSystemAlertsCount(loggedInUser)
        ]);

        const { respondedEmails,
            autoProcessedEmails,
            manuallyProcessedEmails,
            manuallyRespondedEmails,
            manuallyResolvedEmails,
            pendingEmails,
            refundEmails,
            deliveryStatusEmails,
            subscriptionInquiryEmails,
            orderCancellationEmails,
            multipleContextsEmails,
            escalatoryEmails } = respondedEmailsCount;

        return {
            connectedStores: connectedStoresCount,
            respondedEmails,
            autoProcessedEmails,
            manuallyProcessedEmails,
            manuallyRespondedEmails,
            manuallyResolvedEmails,
            pendingEmails,
            refundEmails,
            deliveryStatusEmails,
            subscriptionInquiryEmails,
            orderCancellationEmails,
            multipleContextsEmails,
            escalatoryEmails,
            alerts: alertsCount
        }
    }


    public async getDashboardAnalytics(data: IGetDashboardAnalytics) {
        const analytics = await EmailQueriesRepository.getInstance().fetchDashboardAnalytics(data);
        return analytics;
    }


    public async getUserEmailResponsesDashboardInsights(data: IGetUserEmailResponsesDashboardInsightsRequestDTO, loggedInUser: IJWTPayload) {
        const { totalEmailRespondedByEachUser,
            //respondedEmailByEachUserByTimeSeries
        } = await EmailsRepository.getInstance().getUsersEmailResponsesCount(data, loggedInUser);
        const { manuallyParkedEmails, manuallyRespondedEmails } = await EmailQueriesRepository.getInstance().getManuallyParkedAndRespondedEmailsCount(data.startDate, data.endDate, loggedInUser);
        return {
            manuallyParkedEmails,
            manuallyRespondedEmails,
            totalEmailRespondedByEachUser,
            //respondedEmailByEachUserByTimeSeries
        };
    }


    /*
   * ╔═══════════════════════════════════╗
   * ║          PRIVATE METHODS          ║
   * ╚═══════════════════════════════════╝
    */

    private async getUserConnectedStores(loggedInUser: IJWTPayload) {
        const storeCountConditions: any = [
            ...Utils.checkUserRole(loggedInUser.role) ? [] : [{
                param: 'tenantId',
                value: loggedInUser.tenantId,
                operator: QueryOperators.AND
            }],
            {
                param: 'isShopifyConnected',
                value: true,
                operator: QueryOperators.AND
            },
            {
                param: 'isSupportEmailConnected',
                value: true,
                operator: QueryOperators.AND
            }
        ];
        const storeCount = await StoresRepository.getInstance().Count(storeCountConditions);
        return storeCount;
    }


    private async getRespondedEmailsCount(loggedInUser: IJWTPayload, data: IGetDashboardInsightsRequestDTO) {
        return await EmailQueriesRepository.getInstance().fetchDashboardInsights(loggedInUser, data);
    }

    private async getSystemAlertsCount(loggedInUser: IJWTPayload) {
        const getSystemAlertsCountConditions: any = [
            {
                param: 'isResolved',
                value: false,
                operator: QueryOperators.AND
            },
            ...Utils.checkUserRole(loggedInUser.role) ? [] : [{
                param: 'tenantId',
                value: loggedInUser.tenantId,
                operator: QueryOperators.AND
            }]
        ];

        const alertsCount = await SystemAlertsRepository.getInstance().Count(getSystemAlertsCountConditions);
        return alertsCount;
    }

}


export default new DashboardService();