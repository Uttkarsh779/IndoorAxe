import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from '../config/env.js';

let client = null;
function getClient() {
  if (!client) {
    client = new Razorpay({ key_id: env.razorpayKeyId, key_secret: env.razorpayKeySecret });
  }
  return client;
}

export async function createRazorpayOrder(amountRupees) {
  const amountPaise = Math.round(Number(amountRupees) * 100);
  return getClient().orders.create({
    amount: amountPaise,
    currency: 'INR',
    payment_capture: 1,
  });
}

/**
 * The original callback views (paysuccess/success) trusted the posted
 * razorpay_order_id/payment_id/signature outright with no verification.
 * This verifies the HMAC signature (per Razorpay docs) before the caller
 * is allowed to mark an order paid - confirmed as a security hardening.
 */
export function verifyRazorpaySignature({ orderId, paymentId, signature }) {
  const expected = crypto
    .createHmac('sha256', env.razorpayKeySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return expected === signature;
}
