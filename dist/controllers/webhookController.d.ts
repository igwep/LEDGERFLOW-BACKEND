import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
export declare class WebhookController {
    processWebhook(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getWebhookEvents(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    retryFailedWebhooks(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    private processWebhookEvent;
    private processPaystackWebhook;
    private processFlutterwaveWebhook;
    private processStripeWebhook;
    private verifyWebhookSignature;
}
export declare const webhookController: WebhookController;
//# sourceMappingURL=webhookController.d.ts.map