const GST_RATE = 0.18;

/**
 * Ports the pricing arithmetic that was copy-pasted across
 * views.orderform / views.show / views.quote in the original app.
 * Kept as one function so the three call sites can never drift.
 *
 * area = length * breadth * qty
 * addonCost = addonPricePerSqft * qty   (0 if no addon)
 * total = area * pricePerSqft            (base product cost, pre-GST)
 * gst = (total + addonCost) * 18%
 * csgst = gst / 2                        (CGST/SGST split, 9% each)
 * logistic = area * statePrice
 * amount = total + gst + logistic + addonCost
 */
export function calculateOrderPricing({
  length,
  breadth,
  qty,
  pricePerSqft,
  addonPricePerSqft = 0,
  statePrice = 0,
}) {
  const l = Number(length) || 0;
  const b = Number(breadth) || 0;
  const q = Number(qty) || 0;
  const pps = Number(pricePerSqft) || 0;
  const addonPps = Number(addonPricePerSqft) || 0;
  const sp = Number(statePrice) || 0;

  const area = l * b * q;
  const addonCost = addonPps * q;
  const total = area * pps;
  const gst = (total + addonCost) * GST_RATE;
  const csgst = gst / 2;
  const logistic = area * sp;
  const amount = total + gst + logistic + addonCost;

  return { area, addonCost, total, gst, csgst, logistic, amount };
}
