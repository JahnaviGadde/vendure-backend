import { compileUiExtensions } from '@vendure/ui-devkit/compiler';
import {
    dummyPaymentHandler,
    DefaultJobQueuePlugin,
    DefaultSearchPlugin,
    VendureConfig,
} from '@vendure/core';
import { defaultEmailHandlers, EmailPlugin, FileBasedTemplateLoader } from '@vendure/email-plugin';
import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import 'dotenv/config';
import path from 'path';
import { MyAdminUiPlugin } from './plugins/my-admin-ui/my-admin-ui.plugin';
import { WebContentPlugin } from './plugins/web-content/web-content.plugin';
//import { orderShippedEmailHandler } from '../static/email/templates/shipping-update/custom-email-handlers';
import { LanguageCode } from '@vendure/common/lib/generated-types';
import { adminOrderNotificationHandler } from '../static/email/templates/order-received/custom-email-handlers';
import { FacetValue } from '@vendure/core';


const IS_DEV = process.env.APP_ENV === 'dev';
const serverPort = +process.env.PORT || 3000;

export const config: VendureConfig = {
    apiOptions: {
        port: serverPort,
        adminApiPath: 'admin-api',
        shopApiPath: 'shop-api',
        ...(IS_DEV ? {
            adminApiPlayground: {
                settings: { 'request.credentials': 'include' },
            },
            adminApiDebug: true,
            shopApiPlayground: {
                settings: { 'request.credentials': 'include' },
            },
            shopApiDebug: true,
        } : {}),
    },
    authOptions: {
        tokenMethod: ['bearer', 'cookie'],
        superadminCredentials: {
            identifier: process.env.SUPERADMIN_USERNAME,
            password: process.env.SUPERADMIN_PASSWORD,
        },
        cookieOptions: {
          secret: process.env.COOKIE_SECRET,
        },
    },
    dbConnectionOptions: {
        type: 'postgres',
        // See the README.md "Migrations" section for an explanation of
        // the `synchronize` and `migrations` options.
        synchronize: false,
        migrations: [path.join(__dirname, './migrations/*.+(js|ts)')],
        logging: false,
        database: process.env.DB_NAME,
        schema: process.env.DB_SCHEMA,
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
    },
    paymentOptions: {
        paymentMethodHandlers: [dummyPaymentHandler],
    },
    
    customFields: {
       
        Product: [
        {
            name: 'shortDescription',
            type: 'string',
            label: [{ languageCode: LanguageCode.en, value: 'Description' }],
            ui: { component: 'textarea-form-input' },
            public: true,
        },

        // Size of the painting
        {
            name: 'size',
            type: 'string',
            label: [{ languageCode: LanguageCode.en, value: 'Size of the Painting' }],
            public: true,
        },

        // Medium (e.g., Oil on Canvas)
        {
            name: 'medium',
            type: 'string',
            label: [{ languageCode: LanguageCode.en, value: 'Medium' }],
            description: [{ languageCode: LanguageCode.en, value: 'e.g. Oil on Canvas' }],
            public: true,
        },

        // Available In (Paper / Canvas / Cloth)
        {
            name: 'availableIn',
            type: 'string',
            label: [{ languageCode: LanguageCode.en, value: 'Available In' }],
            description: [{ languageCode: LanguageCode.en, value: 'Paper / Canvas / Cloth' }],
            public: true,
        },

        // Courier Cost (India)
        {
            name: 'courierCostIndia',
            type: 'float',
            label: [{ languageCode: LanguageCode.en, value: 'Courier Cost (India)' }],
            public: true,
        },

        // Courier Cost (Outside India)
        {
            name: 'courierCostOutsideIndia',
            type: 'float',
            label: [{ languageCode: LanguageCode.en, value: 'Courier Cost (Outside India)' }],
            public: true,
        },

        // Year
        {
            name: 'year',
            type: 'string',
            label: [{ languageCode: LanguageCode.en, value: 'Year' }],
            public: true,
        },
        ]

      },

    plugins: [
        AssetServerPlugin.init({
            route: 'assets',
            assetUploadDir: process.env.ASSET_UPLOAD_DIR || path.join(__dirname, '../static/assets'),
            // For local dev, the correct value for assetUrlPrefix should
            // be guessed correctly, but for production it will usually need
            // to be set manually to match your production url.
            assetUrlPrefix: IS_DEV ? undefined : 'https://www.my-shop.com/assets/',
        }),
        DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
       DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
        EmailPlugin.init({
            devMode: true,
            outputPath: path.join(__dirname, '../static/email/test-emails'),
            route: 'mailbox',
            handlers: [...defaultEmailHandlers, adminOrderNotificationHandler],
            templateLoader: new FileBasedTemplateLoader(path.join(__dirname, '../static/email/templates')),
            globalTemplateVars: {
                fromAddress: '"Your Store" <no-reply@yourstore.com>',
                verifyEmailAddressUrl: 'http://localhost:8080/verify',
                passwordResetUrl: 'http://localhost:8080/password-reset',
                changeEmailAddressUrl: 'http://localhost:8080/verify-email-address-change'
            },
        }),
        // AdminUiPlugin.init({
        //     route: 'admin',
        //     port: serverPort + 2,
        //     adminUiConfig: {
        //         apiPort: serverPort,
        //     },
        //     app: compileUiExtensions({
        //         outputPath: path.join(__dirname, '../admin-ui'),
        //         extensions: [
        //             MyAdminUiPlugin.ui,
        //             WebContentPlugin.ui,
        //         ],
        //         devMode: true,
        //     }),
        // }),
        // MyAdminUiPlugin.init({}),
        // WebContentPlugin.init({}),

        AdminUiPlugin.init({
    route: 'admin',
    port: serverPort + 2,
    adminUiConfig: {
        apiPort: serverPort,
    },
    app: IS_DEV
        ? compileUiExtensions({
              outputPath: path.join(__dirname, '../admin-ui'),
              extensions: [
                  MyAdminUiPlugin.ui,
                  WebContentPlugin.ui,
              ],
              devMode: true,
          })
        : undefined,
}),

    ],
};
