import axios, { HttpStatusCode } from "axios";
import { Logger } from "../utils/helpers/logger";
import { ShopifyUrls } from "../utils/constants";
import { CustomError } from "../core/errors/custom";
import { ShopifyAuth } from "../core/interfaces/appConfig";




class ShopifyManager {
    private static instance: ShopifyManager;
    private config: ShopifyAuth | null = null;
    private constructor() { }



    public static getInstance(): ShopifyManager {
        if (!ShopifyManager.instance) {
            ShopifyManager.instance = new ShopifyManager();
        }
        return ShopifyManager.instance;
    }


    public async setConfig(config: ShopifyAuth) {
        this.config = config;
        Logger.Console(`Shopify credentials configured successfully`, 'info');
    }


    public async exchangeAccessToken(shop, code) {
        try {
            const tokenResponse = await axios.post(`https://${shop}/admin/oauth/access_token`, {
                client_id: this.config.shopifyAppClientId,
                client_secret: this.config.shopifyAppClientSecret,
                code,
            });
            return tokenResponse.data.access_token;
        } catch (error) {
            throw new CustomError(HttpStatusCode.BadRequest, 'An error occurred while connecting to the shopify store');
        }

    }


    public async setupWebhook(shop, accessToken) {
        const url = `https://${shop}/admin/api/2023-10/webhooks.json`;

        await axios.post(
            url,
            {
                webhook: {
                    topic: "orders/create",
                    address: "https://your-backend.com/shopify/webhook/orders",
                    format: "json"
                }
            },
            {
                headers: { "X-Shopify-Access-Token": accessToken }
            }
        );

        Logger.Console(`Shopify credentials configured successfully`, 'info');
    }


    public async getOrders(storeName: string, accessToken: string) {
        const url = ShopifyUrls.orders.replace('SHOPIFY_STORE', storeName);
        const response = await axios.get(url, {
            headers: {
                'X-Shopify-Access-Token': accessToken
            }
        });
        return response.data;
    }


    public async getOrderByEmail(shopName: string, email: string, accessToken: string) {
        const url = `https://${shopName}.myshopify.com/admin/api/2023-10`;
        const response = await axios.get(`${url}/orders.json`, {
            headers: {
                "X-Shopify-Access-Token": accessToken,
                "Content-Type": "application/json"
            },
            params: {
                email: email,
                // email: 'cjim118@gmail.com',
                // email: 'garoshnie2699@gmail.com',
                // email: 'ericwtrast@gmail.com',
                // email: 'danielle.nicole.sauve@gmail.com',
                // email: 'matt.drake@yahoo.com',
                // email: 'huntersl2002@gmail.com',
                // email: 'thomdolan33@gmail.com',
                // email: 'nferrick@gmail.com',
                // email: 'ruthlin2@yahoo.com',
                // email: 'eshtm63@yahoo.com',
                status: 'any',
                limit: 1
            }
        });
        return response.data.orders;
    }


    public async pullShopifyDomainName(storeName: string, accessToken: string) {
        try {
            const response = await axios.get(`https://${storeName}.myshopify.com/admin/api/2023-10/shop.json`, {
                headers: {
                    "X-Shopify-Access-Token": accessToken,
                    "Content-Type": "application/json"
                },
                params: {
                    fields: "name"
                }
            });
            return response.data.shop.name;
        } catch (error) {
            if (error.response) {
                if (error.response.status === 404) {
                    throw new CustomError(HttpStatusCode.NotFound, 'Shopify store does not exist or is unavailable');
                } else if (error.response.status === 401) {
                    throw new CustomError(HttpStatusCode.Unauthorized, 'Invalid Shopify API credentials');
                } else {
                    throw new Error(`Shopify API error: ${error?.response?.statusText}`);
                }
            }
            else {
                console.log(error);
                throw new Error(`Unexpected error occurred while connecting to shopify`);
            }
        }
    }


}



export default ShopifyManager;