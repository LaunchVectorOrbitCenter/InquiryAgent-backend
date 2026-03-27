import express, { Request, Response } from 'express';
import { Utils } from '../../utils/utils';
import { HttpStatusCode } from 'axios';
import {
    Configuration, CountryCode,
    CreditAccountSubtype,
    DepositoryAccountSubtype,
    PlaidApi,
    PlaidEnvironments,
    Products
} from 'plaid';
import { Logger } from '../../utils/helpers/logger';

const routes = express.Router();

// Health check
routes.get('/health', async (req: Request, res: Response): Promise<void> => {
    Logger.Console('Health check endpoint called');
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: 'Server is up & running'
    });
});

// Plaid OAuth (Link Token Creation)
routes.get('/oauth', async (req: Request, res: Response): Promise<void> => {
    try {
        // Configure Plaid client
        const config = new Configuration({
            basePath: PlaidEnvironments.production,
            baseOptions: {
                headers: {
                    'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID!,
                    'PLAID-SECRET': process.env.PLAID_SECRET!,
                    'Plaid-Version': '2020-09-14'
                },
            },
        });
        const client = new PlaidApi(config);

        // Create Link Token
        // @ts-ignore
        const response = await client.linkTokenCreate({
            client_name: "Launch Vector",
            user: {
                client_user_id: "1"
            },
            products: [Products.Auth, Products.Liabilities],
            country_codes: [CountryCode.Us],
            language: "en",
            webhook: process.env.PLAID_WEBHOOK_URL,
            account_filters: {
                depository: {
                    account_subtypes: [
                        DepositoryAccountSubtype.Checking,
                        DepositoryAccountSubtype.Savings
                    ]
                },
                credit: {
                    account_subtypes: [CreditAccountSubtype.CreditCard]
                }
            },
            hosted_link: {
                completion_redirect_uri: process.env.LAUNCH_VECTOR_BASE_URL,
                is_mobile_app: false
            }
        });

        const { hosted_link_url, expiration } = response.data;
        //console.log(response.data)
        Utils.apiResponse({
            res,
            code: HttpStatusCode.Ok,
            status: true,
            responseCode: '200',
            responseDescription: 'Plaid link token created successfully',
            data: {
                hosted_link_url,
                expiration
            }
        });
    } catch (error: any) {
        console.error('Plaid OAuth Error:', error.response?.data || error);

        Utils.apiResponse({
            res,
            code: HttpStatusCode.InternalServerError,
            status: false,
            responseCode: '500',
            responseDescription: 'Failed to create Plaid link token',
            data: error.response?.data || error.message
        });
    }
});

export default routes;
