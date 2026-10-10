/**
 * Platform Policy & Operational Constants
 *
 * NOTE: Defined from project requirements. The backend remains the final authority
 * for billing calculations, invoice generation, and authorization rules.
 */

/** Target request review time in hours for Premium subscribers (2 hours) */
export const REVIEW_TARGET_HOURS_PREMIUM = 2;

/** Target request review time in hours for standard requests (24 hours) */
export const REVIEW_TARGET_HOURS_NORMAL = 24;

/** Late cancellation/reschedule fee in cents ($5.00 USD) */
export const LATE_FEE_CENTS = 500;

/** Threshold in hours before visit start where late fee policy triggers (24 hours) */
export const LATE_FEE_WINDOW_HOURS = 24;

/**
 * Premium labor discount percentage (10%).
 * NOTE: Used ONLY in marketing copy and display estimates; never used to compute invoice amounts directly.
 */
export const PREMIUM_LABOR_DISCOUNT_PERCENT = 10;

/** Maximum diagnostic photos allowed per service request */
export const MAX_REQUEST_PHOTOS = 5;

/** Maximum file size in megabytes per uploaded photo */
export const MAX_PHOTO_MB = 5;
