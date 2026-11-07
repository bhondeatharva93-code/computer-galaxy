import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatINR,
  calculateCartTotals,
  validateGuestDetails,
  checkPCCompatibility,
} from './cart';
import { CartItem, PCPart } from '../types';

test('formatINR formats numbers correctly to Indian Rupee', () => {
  const result = formatINR(149999);
  assert.ok(result.includes('1,49,999') || result.includes('149,999'));
  assert.ok(result.includes('₹') || result.includes('INR'));
});

test('calculateCartTotals calculates subtotal, discounts, and free shipping over ₹2000', () => {
  const sampleItems: CartItem[] = [
    {
      product: {
        id: 'cpu-1',
        name: 'Intel Core i7-14700K',
        brand: 'Intel',
        category: 'processors',
        categoryLabel: 'Processors',
        originalPrice: 42000,
        discountedPrice: 36999,
        discountPercent: 12,
        rating: 4.8,
        reviewCount: 142,
        image: '/images/cpu.jpg',
        inStock: true,
        stockCount: 15,
        specs: {},
        description: 'High performance processor',
        warranty: '3 Years Intel India',
        modelNumber: 'BX8071514700K',
      },
      quantity: 1,
    },
  ];

  // Above ₹2000 => free shipping
  const totals = calculateCartTotals(sampleItems);
  assert.equal(totals.subtotal, 36999);
  assert.equal(totals.deliveryCharge, 0);
  assert.equal(totals.total, 36999);
  assert.equal(totals.catalogSavings, 5001);

  // Apply coupon GALAXY500
  const totalsWithCoupon = calculateCartTotals(sampleItems, 'GALAXY500');
  assert.equal(totalsWithCoupon.couponDiscount, 500);
  assert.equal(totalsWithCoupon.total, 36999 - 500);
});

test('validateGuestDetails checks required Indian checkout fields', () => {
  const invalid = validateGuestDetails({
    fullName: 'Jo',
    phone: '123',
    email: 'bad-email',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.fullName);
  assert.ok(invalid.errors.phone);
  assert.ok(invalid.errors.email);
  assert.ok(invalid.errors.pinCode);

  const valid = validateGuestDetails({
    fullName: 'Rohan Sharma',
    phone: '9876543210',
    email: 'rohan.sharma@example.com',
    addressLine: 'Flat 402, Galaxy Heights, MG Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    pinCode: '400001',
    paymentMethod: 'upi',
  });
  assert.equal(valid.valid, true);
  assert.equal(Object.keys(valid.errors).length, 0);
});

test('checkPCCompatibility flags CPU and Motherboard socket mismatch', () => {
  const intelCpu: PCPart = {
    id: 'cpu-intel',
    type: 'cpu',
    typeLabel: 'Processor',
    name: 'Intel Core i9-14900K',
    brand: 'Intel',
    price: 54999,
    wattage: 253,
    socket: 'LGA1700',
    specs: '24 Cores / 32 Threads',
    image: '',
  };

  const amdMobo: PCPart = {
    id: 'mobo-amd',
    type: 'motherboard',
    typeLabel: 'Motherboard',
    name: 'ASUS ROG Crosshair X670E Hero',
    brand: 'ASUS',
    price: 62000,
    wattage: 50,
    socket: 'AM5',
    ramType: 'DDR5',
    specs: 'PCIe 5.0, WiFi 6E',
    image: '',
  };

  const check = checkPCCompatibility({ cpu: intelCpu, motherboard: amdMobo });
  assert.equal(check.isCompatible, false);
  assert.ok(check.issues.some((i) => i.includes('socket mismatch')));
});
