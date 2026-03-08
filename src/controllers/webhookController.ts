import { Request, Response } from 'express';
const { PrismaClient } = require('@prisma/client');
import { transactionService } from '../services/transactionService';
import { fraudScoringService } from '../services/fraudScoringService';
import { AuthenticatedRequest, WebhookSignatureError, WebhookEventData } from '../types';

const prisma = new PrismaClient();

export class WebhookController {
  async processWebhook(req: AuthenticatedRequest, res: Response) {
    // Declare variables outside try block for error handling access
    const { provider } = req.params;
    const providerString = Array.isArray(provider) ? provider[0] : provider;
    const payload = req.body;
    const signature = req.headers['x-signature'] as string;
    let webhookEvent: any = null;

    try {
      // Store webhook event first
      webhookEvent = await prisma.webhookEvent.create({
        data: {
          provider: providerString,
          eventType: payload.event || payload.type || 'unknown',
          payload,
          signature,
          processed: false,
          processingAttempts: 0,
        },
      });

      // Verify signature (simplified - in production, use provider-specific verification)
      if (!this.verifyWebhookSignature(providerString, payload, signature)) {
        await prisma.webhookEvent.update({
          where: { id: webhookEvent.id },
          data: {
            processed: true,
            error: 'Invalid signature',
            processedAt: new Date(),
          },
        });

        throw new WebhookSignatureError('Invalid webhook signature');
      }

      // Check if this event has already been processed
      const reference = payload.reference || payload.transaction_reference || payload.id;
      if (reference) {
        const existingTransaction = await prisma.transaction.findUnique({
          where: { reference },
        });

        if (existingTransaction && existingTransaction.status === 'SUCCESS') {
          await prisma.webhookEvent.update({
            where: { id: webhookEvent.id },
            data: {
              processed: true,
              error: 'Transaction already processed',
              processedAt: new Date(),
            },
          });

          return res.json({
            success: true,
            message: 'Webhook processed (duplicate)',
            meta: {
              timestamp: new Date().toISOString(),
              requestId: req.requestId,
            },
          });
        }
      }

      // Process the webhook based on event type
      await this.processWebhookEvent(providerString, payload, webhookEvent.id);

      // Mark webhook as processed
      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          processed: true,
          processedAt: new Date(),
        },
      });

      res.json({
        success: true,
        message: 'Webhook processed successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.requestId,
        },
      });
    } catch (error) {
      // Enhanced error logging
      const errorDetails = {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        provider: providerString,
        payload: payload ? {
          event: payload.event || payload.type || 'unknown',
          reference: payload.reference || payload.transaction_reference || payload.id || 'none'
        } : 'none',
        webhookEventId: webhookEvent?.id
      };
      
      console.error('Error processing webhook:', JSON.stringify(errorDetails, null, 2));
      
      // Update webhook event with error details
      if (webhookEvent?.id) {
        try {
          await prisma.webhookEvent.update({
            where: { id: webhookEvent.id },
            data: {
              processed: true,
              error: errorDetails.message,
              processedAt: new Date(),
            },
          });
        } catch (dbError) {
          console.error('Failed to update webhook event with error:', dbError);
        }
      }
      
      if (error instanceof WebhookSignatureError) {
        return res.status(401).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: {
              provider: providerString,
              signature: signature ? 'present' : 'missing'
            }
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: req.requestId,
          },
        });
      }

      // Handle Prisma errors
      if (error instanceof Error && error.message.includes('Prisma')) {
        return res.status(500).json({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Database operation failed',
            details: errorDetails.message
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: req.requestId,
          },
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'WEBHOOK_PROCESSING_FAILED',
          message: 'Failed to process webhook',
          details: process.env.NODE_ENV === 'development' ? errorDetails.message : 'Internal server error'
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.requestId,
        },
      });
    }
  }

  async getWebhookEvents(req: AuthenticatedRequest, res: Response) {
    // Declare variables outside try block for error handling access
    const { provider } = req.params;
    const providerString = Array.isArray(provider) ? provider[0] : provider;
    const { 
      processed, 
      eventType, 
      limit, 
      offset, 
      startDate, 
      endDate 
    } = req.query;

    try {

      const where: any = { provider: providerString };
      
      if (processed !== undefined) {
        where.processed = processed === 'true';
      }
      
      if (eventType) {
        where.eventType = String(eventType);
      }
      
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(String(startDate));
        if (endDate) where.createdAt.lte = new Date(String(endDate));
      }

      const [events, total] = await Promise.all([
        prisma.webhookEvent.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit ? parseInt(String(limit)) : 20,
          skip: offset ? parseInt(String(offset)) : 0,
        }),
        prisma.webhookEvent.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          events: events.map((event: WebhookEventData) => ({
            id: event.id,
            provider: event.provider,
            eventType: event.eventType,
            payload: event.payload,
            processed: event.processed,
            processingAttempts: event.processingAttempts,
            error: event.error,
            processedAt: event.processedAt,
            createdAt: event.createdAt,
          })),
          total,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.requestId,
          pagination: {
            limit: limit ? parseInt(String(limit)) : 20,
            offset: offset ? parseInt(String(offset)) : 0,
            total,
            hasMore: (offset ? parseInt(String(offset)) : 0) + (limit ? parseInt(String(limit)) : 20) < total,
          },
        },
      });
    } catch (error) {
      const errorDetails = {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        provider: providerString,
        query: { processed, eventType, limit, offset, startDate, endDate }
      };
      
      console.error('Error fetching webhook events:', JSON.stringify(errorDetails, null, 2));
      
      // Handle Prisma errors
      if (error instanceof Error && error.message.includes('Prisma')) {
        return res.status(500).json({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Database query failed',
            details: errorDetails.message
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: req.requestId,
          },
        });
      }
      
      res.status(500).json({
        success: false,
        error: {
          code: 'WEBHOOK_EVENTS_FETCH_FAILED',
          message: 'Failed to fetch webhook events',
          details: process.env.NODE_ENV === 'development' ? errorDetails.message : 'Internal server error'
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.requestId,
        },
      });
    }
  }

  async retryFailedWebhooks(req: AuthenticatedRequest, res: Response) {
    // Declare variables outside try block for error handling access
    const { provider } = req.params;
    const providerString = Array.isArray(provider) ? provider[0] : provider;

    try {

      // Get failed webhook events
      const failedEvents = await prisma.webhookEvent.findMany({
        where: {
          provider: providerString,
          processed: false,
          processingAttempts: {
            lt: 5, // Only retry events with less than 5 attempts
          },
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
        orderBy: { createdAt: 'asc' },
        take: 50, // Limit to 50 events per retry
      });

      let processedCount = 0;
      let failedCount = 0;

      for (const event of failedEvents) {
        try {
          await this.processWebhookEvent(event.provider, event.payload, event.id);
          
          await prisma.webhookEvent.update({
            where: { id: event.id },
            data: {
              processed: true,
              processedAt: new Date(),
              processingAttempts: event.processingAttempts + 1,
            },
          });
          
          processedCount++;
        } catch (error) {
          const errorDetails = {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            eventId: event.id,
            provider: event.provider
          };
          
          console.error(`Failed to retry webhook event ${event.id}:`, JSON.stringify(errorDetails, null, 2));
          
          await prisma.webhookEvent.update({
            where: { id: event.id },
            data: {
              processingAttempts: event.processingAttempts + 1,
              error: errorDetails.message,
            },
          });
          
          failedCount++;
        }
      }

      res.json({
        success: true,
        data: {
          processedCount,
          failedCount,
          totalAttempted: failedEvents.length,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.requestId,
        },
      });
    } catch (error) {
      const errorDetails = {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        provider: providerString
      };
      
      console.error('Error retrying failed webhooks:', JSON.stringify(errorDetails, null, 2));
      
      // Handle Prisma errors
      if (error instanceof Error && error.message.includes('Prisma')) {
        return res.status(500).json({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Database operation failed during retry',
            details: errorDetails.message
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: req.requestId,
          },
        });
      }
      
      res.status(500).json({
        success: false,
        error: {
          code: 'WEBHOOK_RETRY_FAILED',
          message: 'Failed to retry webhooks',
          details: process.env.NODE_ENV === 'development' ? errorDetails.message : 'Internal server error'
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.requestId,
        },
      });
    }
  }

  private async processWebhookEvent(provider: string, payload: any, eventId: string) {
    try {
      console.log(`Processing webhook event ${eventId} for provider: ${provider}`);
      
      switch (provider.toLowerCase()) {
        case 'paystack':
          await this.processPaystackWebhook(payload);
          break;
        case 'flutterwave':
          await this.processFlutterwaveWebhook(payload);
          break;
        case 'stripe':
          await this.processStripeWebhook(payload);
          break;
        default:
          console.warn(`Unknown webhook provider: ${provider}`);
          throw new Error(`Unsupported webhook provider: ${provider}`);
      }
    } catch (error) {
      const errorDetails = {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        provider,
        eventId,
        payload: payload ? {
          event: payload.event || payload.type || 'unknown',
          reference: payload.reference || payload.transaction_reference || payload.id || 'none'
        } : 'none'
      };
      
      console.error(`Error processing webhook event ${eventId}:`, JSON.stringify(errorDetails, null, 2));
      throw error;
    }
  }

  private async processPaystackWebhook(payload: any) {
    const { event, data } = payload;
    
    switch (event) {
      case 'charge.success':
      case 'transfer.success':
        // Process successful payment/transfer
        if (data.reference) {
          await transactionService.processTransaction(data.reference, {
            providerRef: data.reference,
            metadata: {
              provider: 'paystack',
              event,
              gatewayResponse: data,
            },
          });
        }
        break;
      
      case 'charge.failed':
      case 'transfer.failed':
        // Process failed payment/transfer
        if (data.reference) {
          await transactionService.failTransaction(data.reference, data.message || 'Payment failed');
        }
        break;
      
      default:
        console.log(`Unhandled Paystack event: ${event}`);
        break;
    }
  }

  private async processFlutterwaveWebhook(payload: any) {
    const { event, data } = payload;
    
    switch (event) {
      case 'charge.completed':
        // Process successful payment
        if (data.txRef) {
          await transactionService.processTransaction(data.txRef, {
            providerRef: data.txRef,
            metadata: {
              provider: 'flutterwave',
              event,
              gatewayResponse: data,
            },
          });
        }
        break;
      
      case 'charge.failed':
        // Process failed payment
        if (data.txRef) {
          await transactionService.failTransaction(data.txRef, data.status || 'Payment failed');
        }
        break;
      
      default:
        console.log(`Unhandled Flutterwave event: ${event}`);
        break;
    }
  }

  private async processStripeWebhook(payload: any) {
    const { type, data } = payload;
    
    switch (type) {
      case 'payment_intent.succeeded':
        // Process successful payment
        if (data.metadata?.reference) {
          await transactionService.processTransaction(data.metadata.reference, {
            providerRef: data.id,
            metadata: {
              provider: 'stripe',
              event: type,
              gatewayResponse: data,
            },
          });
        }
        break;
      
      case 'payment_intent.payment_failed':
        // Process failed payment
        if (data.metadata?.reference) {
          await transactionService.failTransaction(data.metadata.reference, data.last_payment_error?.message || 'Payment failed');
        }
        break;
      
      default:
        console.log(`Unhandled Stripe event: ${type}`);
        break;
    }
  }

  private verifyWebhookSignature(provider: string, payload: any, signature: string): boolean {
    // Simplified signature verification
    // In production, implement provider-specific signature verification
    switch (provider.toLowerCase()) {
      case 'paystack':
        // Implement Paystack HMAC verification
        return true; // Placeholder
      
      case 'flutterwave':
        // Implement Flutterwave signature verification
        return true; // Placeholder
      
      case 'stripe':
        // Implement Stripe signature verification
        return true; // Placeholder
      
      default:
        return true; // Allow for testing
    }
  }
}

export const webhookController = new WebhookController();
