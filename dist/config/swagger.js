"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerUi = exports.specs = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
exports.swaggerUi = swagger_ui_express_1.default;
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'LedgerFlow Payment Gateway API',
            version: '1.0.0',
            description: 'A comprehensive payment gateway API for developers to integrate payment processing into their applications',
            contact: {
                name: 'LedgerFlow Support',
                email: 'support@ledgerflow.com',
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT',
            },
        },
        servers: [
            {
                url: 'https://ledgerflow-backend-ousp.onrender.com/api',
                description: 'Production server',
            },
            {
                url: 'http://localhost:5000/api',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            description: 'User unique identifier',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address',
                        },
                        name: {
                            type: 'string',
                            description: 'User display name',
                        },
                        role: {
                            type: 'string',
                            enum: ['USER', 'MERCHANT', 'ADMIN'],
                            description: 'User role',
                        },
                        paymentEndpoint: {
                            type: 'string',
                            description: 'Unique payment endpoint for the user',
                            example: 'pay_john123_abc',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'User creation timestamp',
                        },
                    },
                },
                PaymentRequest: {
                    type: 'object',
                    required: ['amount', 'description', 'customerEmail'],
                    properties: {
                        amount: {
                            type: 'number',
                            minimum: 1,
                            description: 'Payment amount in smallest currency unit',
                            example: 5000,
                        },
                        description: {
                            type: 'string',
                            description: 'Payment description',
                            example: 'Premium subscription',
                        },
                        customerEmail: {
                            type: 'string',
                            format: 'email',
                            description: 'Customer email address',
                        },
                        redirectUrl: {
                            type: 'string',
                            format: 'uri',
                            description: 'URL to redirect after payment',
                            example: 'https://your-site.com/payment/success',
                        },
                        metadata: {
                            type: 'object',
                            description: 'Additional payment metadata',
                        },
                    },
                },
                PaymentResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            description: 'Payment processing status',
                        },
                        reference: {
                            type: 'string',
                            description: 'Unique payment reference',
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'completed', 'failed'],
                            description: 'Payment status',
                        },
                        amount: {
                            type: 'number',
                            description: 'Payment amount',
                        },
                        redirectUrl: {
                            type: 'string',
                            description: 'Payment redirect URL',
                        },
                    },
                },
                Wallet: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            description: 'Wallet unique identifier',
                        },
                        balance: {
                            type: 'number',
                            description: 'Current wallet balance',
                        },
                        available: {
                            type: 'number',
                            description: 'Available balance',
                        },
                        lockedBalance: {
                            type: 'number',
                            description: 'Locked balance',
                        },
                        currency: {
                            type: 'string',
                            description: 'Wallet currency',
                            example: 'USD',
                        },
                        status: {
                            type: 'string',
                            enum: ['active', 'frozen', 'closed'],
                            description: 'Wallet status',
                        },
                    },
                },
                Transaction: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            description: 'Transaction unique identifier',
                        },
                        reference: {
                            type: 'string',
                            description: 'Transaction reference',
                        },
                        amount: {
                            type: 'number',
                            description: 'Transaction amount',
                        },
                        currency: {
                            type: 'string',
                            description: 'Transaction currency',
                        },
                        type: {
                            type: 'string',
                            enum: ['CREDIT', 'DEBIT'],
                            description: 'Transaction type',
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'completed', 'failed'],
                            description: 'Transaction status',
                        },
                        description: {
                            type: 'string',
                            description: 'Transaction description',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Transaction timestamp',
                        },
                    },
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        error: {
                            type: 'object',
                            properties: {
                                code: {
                                    type: 'string',
                                    description: 'Error code',
                                },
                                message: {
                                    type: 'string',
                                    description: 'Error message',
                                },
                            },
                        },
                        meta: {
                            type: 'object',
                            properties: {
                                timestamp: {
                                    type: 'string',
                                    format: 'date-time',
                                    description: 'Error timestamp',
                                },
                                requestId: {
                                    type: 'string',
                                    description: 'Request ID for tracing',
                                },
                            },
                        },
                    },
                },
            },
        },
        tags: [
            {
                name: 'Health',
                description: 'Health check and system status',
            },
            {
                name: 'Users',
                description: 'User management and authentication',
            },
            {
                name: 'Payments',
                description: 'Payment processing and management',
            },
            {
                name: 'Wallets',
                description: 'Wallet management and balance operations',
            },
            {
                name: 'Transactions',
                description: 'Transaction history and details',
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to the API docs
};
const specs = (0, swagger_jsdoc_1.default)(options);
exports.specs = specs;
//# sourceMappingURL=swagger.js.map