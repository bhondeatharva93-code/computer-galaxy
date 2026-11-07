import { CartItem, GuestDeliveryDetails, PCPart, PCPartType } from '../types';

/**
 * Formats a number to Indian Rupee (INR) format
 * e.g., 124999 -> "₹1,24,999"
 */
export function formatINR(amount: number): string {
  if (isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  originalSubtotal: number;
  catalogSavings: number;
  couponDiscount: number;
  deliveryCharge: number;
  total: number;
  appliedCoupon: string | null;
  couponError?: string;
}

export function calculateCartTotals(
  items: CartItem[],
  couponCode?: string
): CartTotals {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.discountedPrice * item.quantity,
    0
  );
  const originalSubtotal = items.reduce(
    (sum, item) => sum + item.product.originalPrice * item.quantity,
    0
  );
  const catalogSavings = Math.max(0, originalSubtotal - subtotal);

  let couponDiscount = 0;
  let appliedCoupon: string | null = null;
  let couponError: string | undefined;

  const normalizedCode = couponCode?.trim().toUpperCase();

  if (normalizedCode) {
    if (normalizedCode === 'GALAXY500') {
      if (subtotal >= 4999) {
        couponDiscount = 500;
        appliedCoupon = 'GALAXY500 (₹500 OFF)';
      } else {
        couponError = 'Coupon GALAXY500 requires minimum order value of ₹4,999';
      }
    } else if (normalizedCode === 'GALAXY2000') {
      if (subtotal >= 45000) {
        couponDiscount = 2000;
        appliedCoupon = 'GALAXY2000 (₹2,000 OFF)';
      } else {
        couponError = 'Coupon GALAXY2000 requires minimum order value of ₹45,000';
      }
    } else if (normalizedCode === 'FREESHIP') {
      appliedCoupon = 'FREESHIP (Free Express Delivery)';
    } else {
      couponError = 'Invalid coupon code. Try GALAXY500 or GALAXY2000';
    }
  }

  // Delivery: Free over ₹2,000 or if FREESHIP applied or if cart is empty
  let deliveryCharge = 199;
  if (subtotal === 0 || subtotal >= 2000 || normalizedCode === 'FREESHIP') {
    deliveryCharge = 0;
  }

  const total = Math.max(0, subtotal - couponDiscount + deliveryCharge);

  return {
    itemCount,
    subtotal,
    originalSubtotal,
    catalogSavings,
    couponDiscount,
    deliveryCharge,
    total,
    appliedCoupon,
    couponError,
  };
}

export function validateGuestDetails(details: Partial<GuestDeliveryDetails>): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!details.fullName || details.fullName.trim().length < 3) {
    errors.fullName = 'Please enter your full name (at least 3 characters)';
  }

  const phoneDigits = details.phone ? details.phone.replace(/\D/g, '') : '';
  if (!phoneDigits || phoneDigits.length < 10) {
    errors.phone = 'Please enter a valid 10-digit mobile number';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!details.email || !emailRegex.test(details.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!details.addressLine || details.addressLine.trim().length < 8) {
    errors.addressLine = 'Please enter complete house/flat and street address';
  }

  if (!details.city || details.city.trim().length < 2) {
    errors.city = 'Please enter your city';
  }

  if (!details.state || details.state.trim().length < 2) {
    errors.state = 'Please select your state';
  }

  const pinDigits = details.pinCode ? details.pinCode.replace(/\D/g, '') : '';
  if (!pinDigits || pinDigits.length !== 6) {
    errors.pinCode = 'Please enter a valid 6-digit Indian PIN code';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function generateOrderId(): string {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `CG-${randomSuffix}`;
}

export function generateGstInvoiceNumber(): string {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `GST-CG26-${randomSuffix}`;
}

export function createWhatsAppChatUrl(message: string, storePhone = '917014443922'): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${storePhone}?text=${encoded}`;
}

export function checkPCCompatibility(parts: Partial<Record<PCPartType, PCPart>>) {
  const issues: string[] = [];
  let totalWattage = 50; // base system motherboard + fans

  if (parts.cpu) totalWattage += parts.cpu.wattage;
  if (parts.gpu) totalWattage += parts.gpu.wattage;
  if (parts.ram) totalWattage += parts.ram.wattage || 15;
  if (parts.storage) totalWattage += parts.storage.wattage || 10;
  if (parts.cooler) totalWattage += parts.cooler.wattage || 25;

  // Socket check
  if (parts.cpu && parts.motherboard) {
    if (parts.cpu.socket && parts.motherboard.socket && parts.cpu.socket !== parts.motherboard.socket) {
      issues.push(`CPU socket mismatch: CPU is ${parts.cpu.socket} but Motherboard is ${parts.motherboard.socket}.`);
    }
  }

  // RAM type check
  if (parts.ram && parts.motherboard) {
    if (parts.ram.ramType && parts.motherboard.ramType && parts.ram.ramType !== parts.motherboard.ramType) {
      issues.push(`RAM type mismatch: Memory is ${parts.ram.ramType} but Motherboard requires ${parts.motherboard.ramType}.`);
    }
  }

  // PSU wattage check
  const recommendedWattage = Math.ceil((totalWattage * 1.3) / 50) * 50;
  if (parts.psu) {
    if (parts.psu.wattage < totalWattage) {
      issues.push(`Insufficient Power: Selected PSU is ${parts.psu.wattage}W, but components consume ${totalWattage}W.`);
    }
  }

  return {
    isCompatible: issues.length === 0,
    issues,
    totalWattage,
    recommendedPsuWattage: Math.max(550, recommendedWattage),
  };
}
