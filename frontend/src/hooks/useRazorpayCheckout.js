const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

let scriptLoadingPromise = null;

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout script'));
    document.body.appendChild(script);
  });
  return scriptLoadingPromise;
}

/**
 * Ports the inline <script> block from payment.html/paycheck.html: builds a
 * Razorpay Checkout instance and opens it. `onSuccess`/`onFailure` receive
 * the raw Razorpay response so the caller can POST it to the callback API.
 */
export function useRazorpayCheckout() {
  async function openCheckout({ keyId, amount, currency, orderId, name, description, prefill }) {
    await loadRazorpayScript();

    return new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        order_id: orderId,
        name: name || 'Indoor Axe Pvt Ltd',
        description,
        prefill,
        handler: (response) => resolve(response),
        modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
      });
      rzp.on('payment.failed', (response) => reject(response.error));
      rzp.open();
    });
  }

  return { openCheckout };
}
