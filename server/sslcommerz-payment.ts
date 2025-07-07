import { Express, Request, Response } from "express";
import SSLCommerzPayment from "sslcommerz-lts";
import { db } from "./db";
import { creditPackages, creditTransactions, users } from "../shared/schema";
import { eq, sql } from "drizzle-orm";
import { z } from 'zod';

// SSLCommerz Demo Configuration
const store_id = 'testbox';
const store_passwd = 'qwerty';
const is_live = false; // Always use demo for testing

// Validation schema
const initiatePaymentSchema = z.object({
  packageId: z.number(),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(11),
});

export function registerSSLCommerzRoutes(app: Express) {
  
  // Initiate payment
  app.post("/api/payment/initiate", async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const validatedData = initiatePaymentSchema.parse(req.body);

      // Get package details
      const [creditPackage] = await db
        .select()
        .from(creditPackages)
        .where(eq(creditPackages.id, validatedData.packageId));

      if (!creditPackage) {
        return res.status(404).json({ error: 'Package not found' });
      }

      // Create pending transaction
      const [transaction] = await db
        .insert(creditTransactions)
        .values({
          userId,
          packageId: validatedData.packageId,
          type: 'purchase',
          credits: creditPackage.credits,
          amount: creditPackage.price,
          paymentMethod: 'sslcommerz',
          status: 'pending',
          description: `ক্রেডিট ক্রয় - ${creditPackage.name}`,
        })
        .returning();

      const tran_id = `TXN_${transaction.id}_${Date.now()}`;

      // SSLCommerz payment data
      const data = {
        total_amount: parseFloat(creditPackage.price),
        currency: 'BDT',
        tran_id: tran_id,
        success_url: `${process.env.BASE_URL || 'http://localhost:5000'}/api/payment/success`,
        fail_url: `${process.env.BASE_URL || 'http://localhost:5000'}/api/payment/fail`,
        cancel_url: `${process.env.BASE_URL || 'http://localhost:5000'}/api/payment/cancel`,
        ipn_url: `${process.env.BASE_URL || 'http://localhost:5000'}/api/payment/ipn`,
        shipping_method: 'NO',
        product_name: creditPackage.name,
        product_category: 'Credit Package',
        product_profile: 'general',
        cus_name: validatedData.customerName,
        cus_email: validatedData.customerEmail,
        cus_add1: 'Dhaka',
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: validatedData.customerPhone,
        cus_fax: validatedData.customerPhone,
        ship_name: validatedData.customerName,
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: '1000',
        ship_country: 'Bangladesh',
      };

      // Update transaction with SSLCommerz transaction ID
      await db
        .update(creditTransactions)
        .set({ transactionId: tran_id })
        .where(eq(creditTransactions.id, transaction.id));

      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
      const apiResponse = await sslcz.init(data);

      if (apiResponse?.GatewayPageURL) {
        res.json({
          success: true,
          payment_url: apiResponse.GatewayPageURL,
          transaction_id: tran_id
        });
      } else {
        // Update transaction status to failed
        await db
          .update(creditTransactions)
          .set({ status: 'failed' })
          .where(eq(creditTransactions.id, transaction.id));

        res.status(400).json({ error: 'Payment initiation failed' });
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Payment success callback
  app.post("/api/payment/success", async (req: Request, res: Response) => {
    try {
      const { tran_id, val_id, amount, card_type, status } = req.body;

      if (status === 'VALID') {
        // Find transaction by transaction ID
        const [transaction] = await db
          .select()
          .from(creditTransactions)
          .where(eq(creditTransactions.transactionId, tran_id));

        if (transaction && transaction.status === 'pending') {
          // Validate payment with SSLCommerz
          const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
          const validation = await sslcz.validate({ val_id });

          if (validation.status === 'VALID' && parseFloat(validation.amount) === parseFloat(amount)) {
            // Update transaction status to completed
            await db
              .update(creditTransactions)
              .set({ 
                status: 'completed',
                reference: val_id,
                notes: `Payment via ${card_type}`
              })
              .where(eq(creditTransactions.id, transaction.id));

            // Add credits to user account
            await db
              .update(users)
              .set({ 
                credits: sql`${users.credits} + ${transaction.credits}`,
                updatedAt: new Date()
              })
              .where(eq(users.id, transaction.userId));

            // Redirect to success page
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5000'}/credits?payment=success&credits=${transaction.credits}`);
          } else {
            // Payment validation failed
            await db
              .update(creditTransactions)
              .set({ status: 'failed', notes: 'Payment validation failed' })
              .where(eq(creditTransactions.id, transaction.id));

            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5000'}/credits?payment=failed`);
          }
        } else {
          res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5000'}/credits?payment=failed`);
        }
      } else {
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5000'}/credits?payment=failed`);
      }
    } catch (error) {
      console.error('Payment success callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5000'}/credits?payment=error`);
    }
  });

  // Payment failure callback
  app.post("/api/payment/fail", async (req: Request, res: Response) => {
    try {
      const { tran_id } = req.body;

      // Update transaction status to failed
      await db
        .update(creditTransactions)
        .set({ status: 'failed', notes: 'Payment failed' })
        .where(eq(creditTransactions.transactionId, tran_id));

      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5000'}/credits?payment=failed`);
    } catch (error) {
      console.error('Payment failure callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5000'}/credits?payment=error`);
    }
  });

  // Payment cancellation callback
  app.post("/api/payment/cancel", async (req: Request, res: Response) => {
    try {
      const { tran_id } = req.body;

      // Update transaction status to cancelled
      await db
        .update(creditTransactions)
        .set({ status: 'cancelled', notes: 'Payment cancelled by user' })
        .where(eq(creditTransactions.transactionId, tran_id));

      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5000'}/credits?payment=cancelled`);
    } catch (error) {
      console.error('Payment cancellation callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5000'}/credits?payment=error`);
    }
  });

  // IPN (Instant Payment Notification) callback
  app.post("/api/payment/ipn", async (req: Request, res: Response) => {
    try {
      const { tran_id, val_id, amount, status } = req.body;

      if (status === 'VALID') {
        // Validate payment with SSLCommerz
        const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
        const validation = await sslcz.validate({ val_id });

        if (validation.status === 'VALID') {
          // Find and update transaction
          const [transaction] = await db
            .select()
            .from(creditTransactions)
            .where(eq(creditTransactions.transactionId, tran_id));

          if (transaction && transaction.status === 'pending') {
            await db
              .update(creditTransactions)
              .set({ 
                status: 'completed',
                reference: val_id,
                notes: 'Payment confirmed via IPN'
              })
              .where(eq(creditTransactions.id, transaction.id));

            // Add credits to user account
            await db
              .update(users)
              .set({ 
                credits: sql`${users.credits} + ${transaction.credits}`,
                updatedAt: new Date()
              })
              .where(eq(users.id, transaction.userId));
          }
        }
      }

      res.status(200).send('OK');
    } catch (error) {
      console.error('IPN callback error:', error);
      res.status(500).send('Error');
    }
  });

  // Get payment status
  app.get("/api/payment/status/:transactionId", async (req: Request, res: Response) => {
    try {
      const { transactionId } = req.params;

      const [transaction] = await db
        .select()
        .from(creditTransactions)
        .where(eq(creditTransactions.transactionId, transactionId));

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      res.json({
        status: transaction.status,
        credits: transaction.credits,
        amount: transaction.amount,
        description: transaction.description
      });
    } catch (error) {
      console.error('Payment status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}