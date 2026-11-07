import { Router, Request, Response, NextFunction } from 'express';
import { db, hashPassword, AdminUser, MediaFile, CustomerProfile } from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, '..', 'public', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const apiRouter = Router();

// In-memory token cache for admin sessions (24h validity)
const activeAdminTokens = new Map<string, { adminId: string; email: string; expiresAt: number }>();

function generateToken(admin: AdminUser): string {
  const token = 'cg_adm_' + crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  activeAdminTokens.set(token, { adminId: admin.id, email: admin.email, expiresAt });
  return token;
}

// Middleware: Require Admin Authentication
export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in as admin.' });
  }

  const token = authHeader.split(' ')[1];
  const session = activeAdminTokens.get(token);

  if (!session || session.expiresAt < Date.now()) {
    if (session) activeAdminTokens.delete(token);
    return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
  }

  (req as any).adminSession = session;
  next();
}

function markUnpublished(data: any) {
  data.hasUnpublishedChanges = true;
  data.pendingChangesCount = (data.pendingChangesCount || 0) + 1;
}

// ==========================================
// 1. ADMIN AUTHENTICATION
// ==========================================

apiRouter.post('/admin/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const currentDb = db.get();
    const admin = currentDb.adminUsers.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const hashed = hashPassword(password);
    if (admin.passwordHash !== hashed) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const token = generateToken(admin);

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

apiRouter.get('/admin/me', requireAdminAuth, (req: Request, res: Response) => {
  const session = (req as any).adminSession;
  const currentDb = db.get();
  const admin = currentDb.adminUsers.find((u) => u.id === session.adminId);
  if (!admin) {
    return res.status(404).json({ success: false, message: 'Admin user not found' });
  }

  return res.json({
    success: true,
    user: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
  });
});

apiRouter.post('/admin/logout', requireAdminAuth, (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeAdminTokens.delete(token);
  }
  return res.json({ success: true, message: 'Logged out successfully' });
});

// Change Admin Password / Profile
apiRouter.put('/admin/profile', requireAdminAuth, (req: Request, res: Response) => {
  const session = (req as any).adminSession;
  const { name, currentPassword, newPassword } = req.body;

  db.update((data) => {
    const admin = data.adminUsers.find((u) => u.id === session.adminId);
    if (!admin) return;

    if (name) admin.name = name;

    if (newPassword) {
      if (!currentPassword || hashPassword(currentPassword) !== admin.passwordHash) {
        throw new Error('Current password does not match.');
      }
      admin.passwordHash = hashPassword(newPassword);
    }
  });

  return res.json({ success: true, message: 'Admin profile updated successfully.' });
});

// ==========================================
// 1B. PUBLISH TO PUBLIC WEBSITE
// ==========================================

apiRouter.get('/admin/publish-status', requireAdminAuth, (req: Request, res: Response) => {
  const data = db.get();
  return res.json({
    success: true,
    hasUnpublishedChanges: Boolean(data.hasUnpublishedChanges),
    pendingChangesCount: data.pendingChangesCount || 0,
    lastPublishedAt: data.published?.publishedAt || null,
    publishedBy: data.published?.publishedBy || null,
  });
});

apiRouter.post('/admin/publish', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const publishedTime = new Date().toISOString();
    const session = (req as any).adminSession;
    const adminEmail = session?.email || 'Chief Administrator';

    db.update((data) => {
      data.published = {
        products: JSON.parse(JSON.stringify(data.products)),
        categories: JSON.parse(JSON.stringify(data.categories)),
        banners: JSON.parse(JSON.stringify(data.banners)),
        sales: JSON.parse(JSON.stringify(data.sales)),
        content: JSON.parse(JSON.stringify(data.content)),
        settings: JSON.parse(JSON.stringify(data.settings)),
        publishedAt: publishedTime,
        publishedBy: adminEmail,
      };
      data.hasUnpublishedChanges = false;
      data.pendingChangesCount = 0;
    });

    return res.json({
      success: true,
      message: 'All changes successfully published to the live public website!',
      publishedAt: publishedTime,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.post('/admin/discard-draft', requireAdminAuth, (req: Request, res: Response) => {
  try {
    db.update((data) => {
      if (data.published) {
        data.products = JSON.parse(JSON.stringify(data.published.products));
        data.categories = JSON.parse(JSON.stringify(data.published.categories));
        data.banners = JSON.parse(JSON.stringify(data.published.banners));
        data.sales = JSON.parse(JSON.stringify(data.published.sales));
        data.content = JSON.parse(JSON.stringify(data.published.content));
        data.settings = JSON.parse(JSON.stringify(data.published.settings));
      }
      data.hasUnpublishedChanges = false;
      data.pendingChangesCount = 0;
    });

    return res.json({
      success: true,
      message: 'Unpublished draft changes discarded. Reverted to live public version.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 2. ADMIN DASHBOARD SUMMARY
// ==========================================

apiRouter.get('/admin/dashboard', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const data = db.get();
    const orders = data.orders || [];
    const products = data.products || [];
    const customers = data.customers || [];

    // Today's date in local formatted comparison
    const now = new Date();
    const todayString = now.toLocaleDateString('en-GB'); // DD/MM/YYYY or format

    let totalRevenue = 0;
    let todayOrdersCount = 0;
    const statusCounts: Record<string, number> = {
      Pending: 0,
      Confirmed: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    };

    orders.forEach((order) => {
      totalRevenue += order.total || 0;
      const status = order.status || 'Pending';
      statusCounts[status] = (statusCounts[status] || 0) + 1;

      if (order.createdAt && order.createdAt.includes(todayString)) {
        todayOrdersCount++;
      }
    });

    const outOfStockCount = products.filter((p) => !p.inStock || (p.stockCount !== undefined && p.stockCount <= 0)).length;

    // Recent 6 orders
    const recentOrders = [...orders]
      .reverse()
      .slice(0, 8);

    // Recent updated products
    const recentProducts = [...products].slice(0, 5);

    return res.json({
      success: true,
      stats: {
        totalOrders: orders.length,
        todayOrders: todayOrdersCount,
        pendingOrders: statusCounts.Pending || 0,
        confirmedOrders: statusCounts.Confirmed || 0,
        processingOrders: statusCounts.Processing || 0,
        shippedOrders: statusCounts.Shipped || 0,
        deliveredOrders: statusCounts.Delivered || 0,
        cancelledOrders: statusCounts.Cancelled || 0,
        totalProducts: products.length,
        outOfStockProducts: outOfStockCount,
        totalCustomers: customers.length,
        totalRevenue,
      },
      recentOrders,
      recentProducts,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 3. PRODUCT MANAGEMENT
// ==========================================

// Public & Admin: Get all products
apiRouter.get('/products', (req: Request, res: Response) => {
  const data = db.get();
  const isAdmin = req.query.admin === 'true';

  let products = (isAdmin ? data.products : (data.published?.products || data.products)) || [];
  if (!isAdmin) {
    // If not admin, only return active products from published website
    products = products.filter((p) => p.isActive !== false);
  }

  // Filter by category if requested
  if (req.query.category && req.query.category !== 'all') {
    products = products.filter((p) => p.category === req.query.category);
  }

  return res.json({ success: true, products, isPublishedView: !isAdmin });
});

// Get single product by ID
apiRouter.get('/products/:id', (req: Request, res: Response) => {
  const data = db.get();
  const isAdmin = req.query.admin === 'true';
  const productList = isAdmin ? data.products : (data.published?.products || data.products);
  const product = productList.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  return res.json({ success: true, product });
});

// Create product (Admin)
apiRouter.post('/products', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const payload = req.body;
    if (!payload.name || !payload.category || !payload.discountedPrice) {
      return res.status(400).json({ success: false, message: 'Name, Category, and Selling Price are required.' });
    }

    const id = payload.id || 'cg-prod-' + Date.now();
    const newProduct = {
      id,
      name: payload.name.trim(),
      brand: payload.brand || 'Computer Galaxy',
      category: payload.category,
      categoryLabel: payload.categoryLabel || payload.category,
      originalPrice: Number(payload.originalPrice) || Number(payload.discountedPrice),
      discountedPrice: Number(payload.discountedPrice),
      discountPercent: Number(payload.discountPercent) || Math.round(((Number(payload.originalPrice) - Number(payload.discountedPrice)) / Number(payload.originalPrice)) * 100) || 0,
      rating: payload.rating || 4.9,
      reviewCount: payload.reviewCount || 12,
      image: payload.image || '/src/assets/images/hero_gaming_pc_setup_1793788644736.jpg',
      images: payload.images || (payload.image ? [payload.image] : []),
      inStock: payload.inStock !== undefined ? payload.inStock : true,
      stockCount: payload.stockCount !== undefined ? Number(payload.stockCount) : 10,
      specs: payload.specs || {},
      description: payload.description || '',
      warranty: payload.warranty || '3 Years Official Brand Warranty',
      modelNumber: payload.modelNumber || 'CG-' + Date.now().toString().slice(-6),
      isBestseller: Boolean(payload.isBestseller),
      isNewArrival: Boolean(payload.isNewArrival),
      isGamingPC: Boolean(payload.isGamingPC),
      isActive: payload.isActive !== undefined ? payload.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.update((data) => {
      data.products.unshift(newProduct);
      markUnpublished(data);
    });

    return res.status(201).json({ success: true, message: 'Product created in draft. Tap "Publish to Public" to make live.', product: newProduct });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Update product (Admin)
apiRouter.put('/products/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const updates = req.body;

    let updatedProduct: any = null;

    db.update((data) => {
      const index = data.products.findIndex((p) => p.id === productId);
      if (index === -1) {
        throw new Error('Product not found.');
      }

      const existing = data.products[index];
      updatedProduct = {
        ...existing,
        ...updates,
        id: existing.id, // preserve ID
        originalPrice: updates.originalPrice !== undefined ? Number(updates.originalPrice) : existing.originalPrice,
        discountedPrice: updates.discountedPrice !== undefined ? Number(updates.discountedPrice) : existing.discountedPrice,
        stockCount: updates.stockCount !== undefined ? Number(updates.stockCount) : existing.stockCount,
        inStock: updates.inStock !== undefined ? updates.inStock : existing.inStock,
        updatedAt: new Date().toISOString(),
      };

      // Auto update discount percent if prices change
      if (updatedProduct.originalPrice > 0 && updatedProduct.discountedPrice > 0) {
        updatedProduct.discountPercent = Math.max(
          0,
          Math.round(((updatedProduct.originalPrice - updatedProduct.discountedPrice) / updatedProduct.originalPrice) * 100)
        );
      }

      data.products[index] = updatedProduct;
      markUnpublished(data);
    });

    return res.json({ success: true, message: 'Product updated in draft. Tap "Publish to Public" to make live.', product: updatedProduct });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// Delete product (Admin)
apiRouter.delete('/products/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    db.update((data) => {
      const initialLen = data.products.length;
      data.products = data.products.filter((p) => p.id !== productId);
      if (data.products.length === initialLen) {
        throw new Error('Product not found.');
      }
      markUnpublished(data);
    });

    return res.json({ success: true, message: 'Product deleted from draft. Tap "Publish to Public" to make live.' });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// ==========================================
// 4. CATEGORY MANAGEMENT
// ==========================================

apiRouter.get('/categories', (req: Request, res: Response) => {
  const data = db.get();
  const isAdmin = req.query.admin === 'true';
  const categorySource = (isAdmin ? data.categories : (data.published?.categories || data.categories)) || [];
  let categories = [...categorySource].sort((a, b) => a.displayOrder - b.displayOrder);
  if (!isAdmin) {
    categories = categories.filter((c) => c.isActive !== false);
  }
  return res.json({ success: true, categories });
});

apiRouter.post('/categories', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { id, name, description, icon, displayOrder, isActive, image } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const catId = id ? id.toLowerCase().replace(/\s+/g, '-') : name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCat = {
      id: catId,
      name: name.trim(),
      description: description || '',
      icon: icon || 'Box',
      count: '0 Models',
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : 99,
      isActive: isActive !== undefined ? isActive : true,
      image: image || '',
    };

    db.update((data) => {
      if (data.categories.some((c) => c.id === catId)) {
        throw new Error(`Category ID "${catId}" already exists.`);
      }
      data.categories.push(newCat);
      markUnpublished(data);
    });

    return res.status(201).json({ success: true, message: 'Category created in draft. Tap "Publish to Public" to make live.', category: newCat });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

apiRouter.put('/categories/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const catId = req.params.id;
    const updates = req.body;

    let updatedCat: any = null;
    db.update((data) => {
      const index = data.categories.findIndex((c) => c.id === catId);
      if (index === -1) throw new Error('Category not found.');

      updatedCat = {
        ...data.categories[index],
        ...updates,
        id: catId,
      };
      data.categories[index] = updatedCat;
      markUnpublished(data);
    });

    return res.json({ success: true, message: 'Category updated in draft. Tap "Publish to Public" to make live.', category: updatedCat });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

apiRouter.delete('/categories/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const catId = req.params.id;
    db.update((data) => {
      data.categories = data.categories.filter((c) => c.id !== catId);
      markUnpublished(data);
    });
    return res.json({ success: true, message: 'Category deleted from draft. Tap "Publish to Public" to make live.' });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// ==========================================
// 5. BANNER MANAGEMENT
// ==========================================

apiRouter.get('/banners', (req: Request, res: Response) => {
  const data = db.get();
  const isAdmin = req.query.admin === 'true';
  const source = (isAdmin ? data.banners : (data.published?.banners || data.banners)) || [];
  let banners = [...source].sort((a, b) => a.displayOrder - b.displayOrder);
  if (!isAdmin) {
    banners = banners.filter((b) => b.isActive !== false);
  }
  return res.json({ success: true, banners });
});

apiRouter.post('/banners', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const payload = req.body;
    if (!payload.title || !payload.desktopImage) {
      return res.status(400).json({ success: false, message: 'Title and desktop banner image are required.' });
    }

    const newBanner = {
      id: 'banner-' + Date.now(),
      badge: payload.badge || 'SPECIAL OFFER',
      title: payload.title.trim(),
      subtitle: payload.subtitle || '',
      ctaText: payload.ctaText || 'Shop Now',
      ctaLink: payload.ctaLink || '#catalog-section',
      secondaryCtaText: payload.secondaryCtaText,
      secondaryCtaLink: payload.secondaryCtaLink,
      desktopImage: payload.desktopImage,
      mobileImage: payload.mobileImage || payload.desktopImage,
      tag: payload.tag || '',
      displayOrder: payload.displayOrder !== undefined ? Number(payload.displayOrder) : 1,
      isActive: payload.isActive !== undefined ? payload.isActive : true,
      startDate: payload.startDate,
      endDate: payload.endDate,
    };

    db.update((data) => {
      data.banners.push(newBanner);
      markUnpublished(data);
    });

    return res.status(201).json({ success: true, message: 'Banner added in draft. Tap "Publish to Public" to make live.', banner: newBanner });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

apiRouter.put('/banners/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const bannerId = req.params.id;
    const updates = req.body;
    let updatedBanner: any = null;

    db.update((data) => {
      const idx = data.banners.findIndex((b) => b.id === bannerId);
      if (idx === -1) throw new Error('Banner not found.');
      updatedBanner = {
        ...data.banners[idx],
        ...updates,
        id: bannerId,
      };
      data.banners[idx] = updatedBanner;
      markUnpublished(data);
    });

    return res.json({ success: true, message: 'Banner updated in draft. Tap "Publish to Public" to make live.', banner: updatedBanner });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

apiRouter.delete('/banners/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const bannerId = req.params.id;
    db.update((data) => {
      data.banners = data.banners.filter((b) => b.id !== bannerId);
      markUnpublished(data);
    });
    return res.json({ success: true, message: 'Banner removed from draft. Tap "Publish to Public" to make live.' });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// ==========================================
// 6. SALE AND OFFER MANAGEMENT
// ==========================================

apiRouter.get('/sales', (req: Request, res: Response) => {
  const data = db.get();
  const isAdmin = req.query.admin === 'true';
  const source = (isAdmin ? data.sales : (data.published?.sales || data.sales)) || [];
  let sales = [...source];
  if (!isAdmin) {
    sales = sales.filter((s) => s.isActive !== false);
  }
  return res.json({ success: true, sales });
});

apiRouter.post('/sales', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const payload = req.body;
    if (!payload.title) {
      return res.status(400).json({ success: false, message: 'Sale title is required.' });
    }

    const newSale = {
      id: 'sale-' + Date.now(),
      title: payload.title.trim(),
      discountInfo: payload.discountInfo || '',
      description: payload.description || '',
      couponCode: (payload.couponCode || 'GALAXY').toUpperCase(),
      bannerImage: payload.bannerImage || '/src/assets/images/custom_pc_builder_promo_1793788644706.jpg',
      startDate: payload.startDate || new Date().toISOString().split('T')[0],
      endDate: payload.endDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      isActive: payload.isActive !== undefined ? payload.isActive : true,
      discountPercent: payload.discountPercent ? Number(payload.discountPercent) : 10,
      promotionalProductIds: payload.promotionalProductIds || [],
    };

    db.update((data) => {
      data.sales.push(newSale);
      markUnpublished(data);
    });

    return res.status(201).json({ success: true, message: 'Sale created in draft. Tap "Publish to Public" to make live.', sale: newSale });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

apiRouter.put('/sales/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const saleId = req.params.id;
    const updates = req.body;
    let updatedSale: any = null;

    db.update((data) => {
      const idx = data.sales.findIndex((s) => s.id === saleId);
      if (idx === -1) throw new Error('Sale not found.');
      updatedSale = {
        ...data.sales[idx],
        ...updates,
        id: saleId,
      };
      data.sales[idx] = updatedSale;
      markUnpublished(data);
    });

    return res.json({ success: true, message: 'Sale updated in draft. Tap "Publish to Public" to make live.', sale: updatedSale });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

apiRouter.delete('/sales/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const saleId = req.params.id;
    db.update((data) => {
      data.sales = data.sales.filter((s) => s.id !== saleId);
      markUnpublished(data);
    });
    return res.json({ success: true, message: 'Sale removed from draft. Tap "Publish to Public" to make live.' });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// ==========================================
// 7. ORDER MANAGEMENT
// ==========================================

// Customer checkout: place order (Public)
apiRouter.post('/orders', (req: Request, res: Response) => {
  try {
    const { customer, items, subtotal, discount, deliveryCharge, total, couponCode } = req.body;

    if (!customer || !customer.fullName || !customer.phone || !customer.addressLine) {
      return res.status(400).json({ success: false, message: 'Complete customer delivery details are required.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your shopping cart is empty.' });
    }

    const orderId = 'CG-' + Math.floor(10000 + Math.random() * 90000);
    const dateFormatted = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const newOrder = {
      id: orderId,
      createdAt: dateFormatted,
      customer,
      items,
      subtotal: Number(subtotal) || 0,
      discount: Number(discount) || 0,
      couponCode: couponCode || '',
      deliveryCharge: Number(deliveryCharge) || 0,
      total: Number(total) || 0,
      status: 'Pending',
      paymentMethod: customer.paymentMethod || 'upi',
      paymentStatus: customer.paymentMethod === 'cod' ? 'Pending' : 'Paid',
      trackingNumber: 'BD-IN-' + Math.floor(1000000 + Math.random() * 9000000),
      gstInvoiceNumber: 'GST-CG26-' + Math.floor(1000 + Math.random() * 9000),
      internalNotes: 'Order received from storefront checkout.',
    };

    db.update((data) => {
      // 1. Add order to beginning of orders list
      data.orders.unshift(newOrder);

      // 2. Decrement inventory counts
      items.forEach((item: any) => {
        const prod = data.products.find((p) => p.id === item.product?.id);
        if (prod && prod.stockCount !== undefined) {
          prod.stockCount = Math.max(0, prod.stockCount - (item.quantity || 1));
          if (prod.stockCount === 0) {
            prod.inStock = false;
          }
        }
      });

      // 3. Upsert customer profile
      const custPhone = customer.phone.trim();
      const existingCust = data.customers.find((c) => c.phone === custPhone || (customer.email && c.email === customer.email));

      if (existingCust) {
        existingCust.ordersCount = (existingCust.ordersCount || 0) + 1;
        existingCust.totalSpent = (existingCust.totalSpent || 0) + newOrder.total;
        existingCust.lastOrderDate = dateFormatted;
        existingCust.fullName = customer.fullName;
        existingCust.city = customer.city || existingCust.city;
        existingCust.state = customer.state || existingCust.state;
        existingCust.addressLine = customer.addressLine || existingCust.addressLine;
      } else {
        const newCust: CustomerProfile = {
          id: 'cust-' + Date.now(),
          fullName: customer.fullName,
          email: customer.email || '',
          phone: custPhone,
          city: customer.city || '',
          state: customer.state || '',
          pinCode: customer.pinCode || '',
          addressLine: customer.addressLine || '',
          ordersCount: 1,
          totalSpent: newOrder.total,
          lastOrderDate: dateFormatted,
          createdAt: dateFormatted,
        };
        data.customers.unshift(newCust);
      }
    });

    return res.status(201).json({ success: true, message: 'Order placed successfully', order: newOrder });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin get all orders (Admin)
apiRouter.get('/orders', requireAdminAuth, (req: Request, res: Response) => {
  const data = db.get();
  let orders = [...(data.orders || [])];

  // Optional query filters
  if (req.query.status && req.query.status !== 'all') {
    orders = orders.filter((o) => o.status === req.query.status);
  }

  if (req.query.paymentStatus && req.query.paymentStatus !== 'all') {
    orders = orders.filter((o) => o.paymentStatus === req.query.paymentStatus);
  }

  if (req.query.search) {
    const q = String(req.query.search).toLowerCase();
    orders = orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        (o.customer?.fullName && o.customer.fullName.toLowerCase().includes(q)) ||
        (o.customer?.phone && o.customer.phone.includes(q)) ||
        (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q))
    );
  }

  return res.json({ success: true, orders, total: orders.length });
});

// Customer track order by Order ID or Phone (Public)
apiRouter.get('/orders/track/:query', (req: Request, res: Response) => {
  const query = req.params.query.trim().toLowerCase();
  const data = db.get();

  const matching = (data.orders || []).filter(
    (o) => o.id.toLowerCase() === query || (o.customer?.phone && o.customer.phone.trim() === query)
  );

  if (matching.length === 0) {
    return res.status(404).json({ success: false, message: 'No orders found matching ID or phone number.' });
  }

  return res.json({ success: true, orders: matching });
});

// Update order status, payment status, tracking, notes (Admin)
apiRouter.put('/orders/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    const { status, paymentStatus, trackingNumber, internalNotes, deliveryCharge } = req.body;

    let updatedOrder: any = null;

    db.update((data) => {
      const idx = data.orders.findIndex((o) => o.id === orderId);
      if (idx === -1) throw new Error('Order not found.');

      const curr = data.orders[idx];
      updatedOrder = {
        ...curr,
        status: status !== undefined ? status : curr.status,
        paymentStatus: paymentStatus !== undefined ? paymentStatus : curr.paymentStatus,
        trackingNumber: trackingNumber !== undefined ? trackingNumber : curr.trackingNumber,
        internalNotes: internalNotes !== undefined ? internalNotes : curr.internalNotes,
        deliveryCharge: deliveryCharge !== undefined ? Number(deliveryCharge) : curr.deliveryCharge,
        updatedAt: new Date().toISOString(),
      };
      data.orders[idx] = updatedOrder;
    });

    return res.json({ success: true, message: 'Order updated', order: updatedOrder });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// ==========================================
// 8. CUSTOMER MANAGEMENT
// ==========================================

apiRouter.get('/customers', requireAdminAuth, (req: Request, res: Response) => {
  const data = db.get();
  return res.json({ success: true, customers: data.customers || [] });
});

// ==========================================
// 9. WEBSITE CONTENT MANAGEMENT
// ==========================================

apiRouter.get('/content', (req: Request, res: Response) => {
  const data = db.get();
  const isAdmin = req.query.admin === 'true';
  const content = (isAdmin ? data.content : (data.published?.content || data.content)) || {};
  return res.json({ success: true, content });
});

apiRouter.put('/content/:section', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const data = db.get();
    const section = req.params.section as keyof typeof data.content;
    const updates = req.body;

    if (!data.content || !(section in data.content)) {
      return res.status(400).json({ success: false, message: `Invalid content section "${section}".` });
    }

    let updatedSection: any = null;
    db.update((dbData) => {
      (dbData.content as any)[section] = {
        ...(dbData.content as any)[section],
        ...updates,
      };
      updatedSection = (dbData.content as any)[section];
      markUnpublished(dbData);
    });

    return res.json({ success: true, message: `Section "${section}" updated in draft. Tap "Publish to Public" to make live.`, content: updatedSection });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// ==========================================
// 10. WEBSITE SETTINGS
// ==========================================

apiRouter.get('/settings', (req: Request, res: Response) => {
  const data = db.get();
  const isAdmin = req.query.admin === 'true';
  const settings = (isAdmin ? data.settings : (data.published?.settings || data.settings)) || {};
  return res.json({ success: true, settings });
});

apiRouter.put('/settings', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const updates = req.body;
    let updatedSettings: any = null;

    db.update((data) => {
      data.settings = {
        ...data.settings,
        ...updates,
      };
      updatedSettings = data.settings;
      markUnpublished(data);
    });

    return res.json({ success: true, message: 'Settings updated in draft. Tap "Publish to Public" to make live.', settings: updatedSettings });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// ==========================================
// 11. MEDIA LIBRARY & IMAGE UPLOADS
// ==========================================

apiRouter.get('/media', requireAdminAuth, (req: Request, res: Response) => {
  const data = db.get();
  return res.json({ success: true, media: data.media || [] });
});

// Upload image via Base64 payload (persistent disk storage in /public/uploads/)
apiRouter.post('/media/upload', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { filename, base64Data, mimeType } = req.body;

    if (!base64Data) {
      return res.status(400).json({ success: false, message: 'Image base64 data is required.' });
    }

    // Strip prefix like "data:image/png;base64," or "data:video/mp4;base64," if present
    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    // Generate safe filename with appropriate extension
    let ext = path.extname(filename || '');
    if (!ext && mimeType) {
      const subtype = mimeType.split('/')[1] || '';
      ext = '.' + (subtype === 'quicktime' ? 'mov' : subtype);
    }
    if (!ext) ext = mimeType?.startsWith('video/') ? '.mp4' : '.jpg';
    const safeName = 'cg_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex') + ext;
    const destPath = path.join(UPLOADS_DIR, safeName);

    fs.writeFileSync(destPath, buffer);

    const publicUrl = `/uploads/${safeName}`;

    const newMedia: MediaFile = {
      id: 'media-' + Date.now(),
      name: filename || safeName,
      url: publicUrl,
      size: buffer.length,
      mimeType: mimeType || 'image/jpeg',
      uploadedAt: new Date().toISOString(),
    };

    db.update((data) => {
      if (!data.media) data.media = [];
      data.media.unshift(newMedia);
    });

    return res.status(201).json({
      success: true,
      message: 'Image uploaded permanently to cloud storage',
      url: publicUrl,
      media: newMedia,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

apiRouter.delete('/media/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const mediaId = req.params.id;
    let fileToDelete = '';

    db.update((data) => {
      const item = data.media?.find((m) => m.id === mediaId);
      if (item) {
        fileToDelete = item.url;
      }
      data.media = (data.media || []).filter((m) => m.id !== mediaId);
    });

    if (fileToDelete && fileToDelete.startsWith('/uploads/')) {
      const fileName = fileToDelete.replace('/uploads/', '');
      const filePath = path.join(UPLOADS_DIR, fileName);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn('[Media] Could not delete disk file:', e);
        }
      }
    }

    return res.json({ success: true, message: 'Media removed' });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
});
