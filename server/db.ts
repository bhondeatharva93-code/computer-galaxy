import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string; // SHA-256
  name: string;
  role: 'superadmin' | 'editor';
  createdAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: string;
  displayOrder: number;
  isActive: boolean;
  image?: string;
}

export interface BannerItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  desktopImage: string;
  mobileImage?: string;
  mediaType?: 'image' | 'video';
  videoUrl?: string;
  floatingBadge?: string;
  tag?: string;
  displayOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

export interface SaleItem {
  id: string;
  title: string;
  discountInfo: string;
  description: string;
  couponCode: string;
  bannerImage: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  discountPercent?: number;
  promotionalProductIds: string[];
}

export interface CustomerProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  pinCode: string;
  addressLine: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
  createdAt: string;
}

export interface WebsiteContent {
  homepage: {
    heroTitle: string;
    heroSubtitle: string;
    announcementText: string;
    announcementActive: boolean;
    sections: { id: string; name: string; visible: boolean; order: number }[];
  };
  about: {
    heading: string;
    description: string;
    establishedYear: string;
    highlights: string[];
    storeAddress: string;
    storePhotos: string[];
  };
  contact: {
    businessName: string;
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    workingHours: string;
    googleMapsEmbedUrl?: string;
    socialLinks: {
      youtube: string;
      instagram: string;
      facebook: string;
      twitter: string;
    };
  };
  footer: {
    description: string;
    gstNumber: string;
    copyrightText: string;
    quickLinks: { label: string; url: string }[];
  };
  navigation: { id: string; label: string; path: string; order: number; active: boolean }[];
  faqs: { id: string; question: string; answer: string; category: string; order: number }[];
  seo: {
    title: string;
    metaDescription: string;
    keywords: string;
    ogImage: string;
  };
}

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

export interface WebsiteSettings {
  businessName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  currencySymbol: string;
  currencyCode: string;
  maintenanceMode: boolean;
  contactNumber: string;
  whatsappNumber: string;
  supportEmail: string;
  officeAddress: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  gstPercent: number;
}

export interface PublishedSnapshot {
  products: any[];
  categories: CategoryItem[];
  banners: BannerItem[];
  sales: SaleItem[];
  content: WebsiteContent;
  settings: WebsiteSettings;
  publishedAt: string;
  publishedBy: string;
}

export interface DatabaseSchema {
  adminUsers: AdminUser[];
  products: any[];
  categories: CategoryItem[];
  banners: BannerItem[];
  sales: SaleItem[];
  orders: any[];
  customers: CustomerProfile[];
  content: WebsiteContent;
  media: MediaFile[];
  settings: WebsiteSettings;
  published?: PublishedSnapshot;
  hasUnpublishedChanges?: boolean;
  pendingChangesCount?: number;
}

// Initial default seed categories
const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'prebuilt-pcs', name: 'Prebuilt PCs', description: 'Factory-assembled desktop setups ready to use', icon: 'Monitor', count: '14 Models', displayOrder: 1, isActive: true },
  { id: 'gaming-pcs', name: 'Gaming PCs', description: 'Liquid-cooled Esports & AAA 4K Battle Stations', icon: 'Gamepad2', count: '18 Models', displayOrder: 2, isActive: true },
  { id: 'editing-pcs', name: 'Editing PCs', description: 'High-thread workstations for Premiere Pro, Blender & After Effects', icon: 'Video', count: '8 Models', displayOrder: 3, isActive: true },
  { id: 'basic-pcs', name: 'Office PCs', description: 'Quiet, dependable desktop systems for schools, Tally & corporate firms', icon: 'Briefcase', count: '12 Models', displayOrder: 4, isActive: true },
  { id: 'processors', name: 'Processors', description: 'Intel Core 12th-14th Gen & AMD Ryzen 5000/7000/9000 Series', icon: 'Cpu', count: '28 Models', displayOrder: 5, isActive: true },
  { id: 'graphics-cards', name: 'Graphics Cards', description: 'NVIDIA GeForce RTX 40-Series & AMD Radeon RX 7000', icon: 'Layers', count: '34 Models', displayOrder: 6, isActive: true },
  { id: 'motherboards', name: 'Motherboards', description: 'Intel Z790/B760 & AMD X670E/B650 motherboards', icon: 'Grid', count: '42 Models', displayOrder: 7, isActive: true },
  { id: 'ram-memory', name: 'RAM', description: 'High-speed DDR5 6000MHz & DDR4 3200MHz RGB Memory Kits', icon: 'Zap', count: '30 Kits', displayOrder: 8, isActive: true },
  { id: 'storage-ssd', name: 'SSD and Hard Drives', description: 'Gen4 NVMe M.2 SSDs up to 7400MB/s & high-capacity enterprise HDDs', icon: 'HardDrive', count: '25 Drives', displayOrder: 9, isActive: true },
  { id: 'cabinets', name: 'Cabinets', description: 'Panoramic dual-chamber fish-tank and high-airflow mesh PC cases', icon: 'Box', count: '22 Cases', displayOrder: 10, isActive: true },
  { id: 'monitors', name: 'Monitors', description: '165Hz to 360Hz Fast-IPS & OLED gaming and color-accurate creator displays', icon: 'Tv', count: '18 Displays', displayOrder: 11, isActive: true },
  { id: 'printers', name: 'Printers', description: 'All-in-one wireless ink tank and laser printers for home and business', icon: 'Printer', count: '9 Models', displayOrder: 12, isActive: true },
  { id: 'keyboards', name: 'Keyboards', description: 'Hot-swappable mechanical keyboards with RGB and custom switches', icon: 'Keyboard', count: '24 Keyboards', displayOrder: 13, isActive: true },
  { id: 'mouse', name: 'Mouse', description: 'Ultra-lightweight wireless esports mice with 8000Hz polling rate', icon: 'Mouse', count: '20 Mice', displayOrder: 14, isActive: true },
  { id: 'speakers', name: 'Speakers', description: 'Studio monitors and 2.1 gaming soundbars with deep bass', icon: 'Speaker', count: '12 Speakers', displayOrder: 15, isActive: true },
  { id: 'accessories', name: 'Computer Accessories', description: 'Thermal paste, sleeve cables, anti-sag brackets, and webcams', icon: 'Wrench', count: '35 Accessories', displayOrder: 16, isActive: true },
  { id: 'laptops', name: 'Laptops', description: 'Thin & light creator notebooks and RTX 40-Series gaming laptops', icon: 'Laptop', count: '16 Laptops', displayOrder: 17, isActive: true },
];

// Initial default seed banners
const DEFAULT_BANNERS: BannerItem[] = [
  {
    id: 'banner-diwali',
    badge: 'Diwali Festive Mega Celebration | Special Offers Live',
    floatingBadge: 'Happy Diwali 🪔 Computer Galaxy',
    title: 'Festival of Lights Mega Celebration & Exclusive Deals',
    subtitle: 'Computer Galaxy wishes you and your family endless joy, prosperity, and light! Celebrate this festive season with exclusive discounts across all custom gaming rigs, Intel/AMD processors, and NVIDIA RTX GPUs.',
    ctaText: 'Shop Festive Deals',
    ctaLink: '#catalog-section',
    secondaryCtaText: 'Diwali PC Builder',
    secondaryCtaLink: '#custom-builder',
    desktopImage: '/assets/aistudio/Orange_And_Pink_Vibrant_Diwali_Greetings_Video_9f51bd3e.mp4',
    mediaType: 'video',
    videoUrl: '/assets/aistudio/Orange_And_Pink_Vibrant_Diwali_Greetings_Video_9f51bd3e.mp4',
    tag: 'Priority crating across India',
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'banner-builder',
    badge: 'INTERACTIVE PC CONFIGURATOR',
    title: 'Build Your Dream Custom PC with Real-Time Compatibility Engine',
    subtitle: 'Configure Intel Core 14th Gen or AMD Ryzen rigs with instant socket validation, RAM matching, and power wattage calculations.',
    ctaText: 'Configure Custom PC',
    ctaLink: '#custom-builder',
    desktopImage: '/src/assets/images/custom_pc_builder_promo_1793788644706.jpg',
    tag: '3-Year Doorstep Warranty Included',
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 'banner-gpu',
    badge: 'EXCLUSIVE GRAPHICS CARDS',
    title: 'GeForce RTX 40-Series & Liquid Cooled GPUs at Street Market Prices',
    subtitle: 'Official Indian brand warranty on ASUS, MSI, Gigabyte, and ZOTAC with GST tax invoice.',
    ctaText: 'Shop Graphics Cards',
    ctaLink: '#catalog-section',
    desktopImage: '/src/assets/images/product_liquid_cooled_gpu_1793788644826.jpg',
    tag: 'Extra ₹2,000 Off with Code GALAXY2000',
    displayOrder: 3,
    isActive: true,
  },
];

// Initial default seed sales
const DEFAULT_SALES: SaleItem[] = [
  {
    id: 'sale-festive-2026',
    title: 'Computer Galaxy Mega Hardware Sale',
    discountInfo: 'Up to 35% Off on Custom Rigs & Selected Components',
    description: 'Use coupon code GALAXY500 for flat ₹500 off on all orders above ₹2,000. Free shipping across India.',
    couponCode: 'GALAXY500',
    bannerImage: '/src/assets/images/custom_pc_builder_promo_1793788644706.jpg',
    startDate: '2026-11-01',
    endDate: '2026-11-30',
    isActive: true,
    discountPercent: 15,
    promotionalProductIds: ['pc-supernova-ultra', 'gpu-rtx4080s', 'cpu-i9-14900k'],
  },
  {
    id: 'sale-student-office',
    title: 'Office & Student PC Package Deal',
    discountInfo: 'Flat ₹1,000 Off on Basic & Commercial Desktops',
    description: 'Special pricing for schools, CA firms, accounting departments, and student setups.',
    couponCode: 'OFFICE1000',
    bannerImage: '/src/assets/images/hero_gaming_pc_setup_1793788644736.jpg',
    startDate: '2026-11-01',
    endDate: '2026-12-15',
    isActive: true,
    discountPercent: 10,
    promotionalProductIds: ['pc-office-i3', 'pc-office-ryzen5'],
  },
];

// Initial default seed content
const DEFAULT_CONTENT: WebsiteContent = {
  homepage: {
    heroTitle: 'Computer Galaxy - India\'s Trusted Custom PC & Hardware Store',
    heroSubtitle: 'Hand-crafted gaming PCs, workstation rigs, and genuine computer components delivered securely across 19,000+ pin codes.',
    announcementText: '🔥 FESTIVE MEGA SALE: Up to 35% Off on Gaming Rigs + Zero Assembly Fees! Use code GALAXY500.',
    announcementActive: true,
    sections: [
      { id: 'diwali-banner', name: 'Sale & Greetings Banner', visible: true, order: 1 },
      { id: 'top-pc-selector', name: 'PC Category Selector (Basic, Gaming, Custom)', visible: true, order: 2 },
      { id: 'categories', name: 'Shop By Category Grid', visible: true, order: 3 },
      { id: 'catalog', name: 'Main Product Catalog', visible: true, order: 4 },
      { id: 'custom-builder-promo', name: 'Custom PC Assembly Studio Promo', visible: true, order: 5 },
      { id: 'gaming-pcs-collection', name: 'Pre-configured Gaming Rig Collection', visible: true, order: 6 },
      { id: 'bestsellers', name: 'Bestselling Hardware & Components', visible: true, order: 7 },
      { id: 'popular-brands', name: 'Official Brand Partners Grid', visible: true, order: 8 },
      { id: 'why-choose-us', name: 'Why Choose Computer Galaxy', visible: true, order: 9 },
      { id: 'google-reviews', name: 'Verified Google Customer Reviews', visible: true, order: 10 },
    ],
  },
  about: {
    heading: 'Engineering Excellence in PC Hardware Since 2018',
    description: 'Computer Galaxy was founded with a mission to bridge the gap between volatile grey-market pricing and professional corporate warranty standards. We build custom gaming PCs, visual effects render farms, and high-reliability office machines with 100% serialized authorized importer stock, stress testing every build for 24 hours before safe delivery.',
    establishedYear: '2018',
    highlights: [
      'Over 50,000 custom computers deployed across India',
      'Authorized partners with ASUS ROG, MSI, Gigabyte, Intel & AMD',
      '100% genuine serialized products with official manufacturer GST invoices',
      'Free lifetime technical support and BIOS/driver consultation',
    ],
    storeAddress: 'Computer Galaxy Flagship Experience Center, Shop 14-16, IT Mall, MG Road, Pune, Maharashtra 411001',
    storePhotos: [
      '/src/assets/images/custom_pc_builder_promo_1793788644706.jpg',
      '/src/assets/images/hero_gaming_pc_setup_1793788644736.jpg',
    ],
  },
  contact: {
    businessName: 'Computer Galaxy Hardware & Systems',
    phone: '+91 70144 43922',
    whatsapp: '+91 70144 43922',
    email: 'sales@computergalaxy.in',
    address: 'Shop 14-16, IT Hardware Plaza, MG Road, Camp, Pune, Maharashtra 411001, India',
    workingHours: 'Monday - Saturday: 10:30 AM to 8:30 PM IST (Sunday Closed)',
    googleMapsEmbedUrl: 'https://maps.google.com/?q=Computer+Galaxy+Pune',
    socialLinks: {
      youtube: 'https://youtube.com/@computergalaxyindia',
      instagram: 'https://instagram.com/computergalaxy.official',
      facebook: 'https://facebook.com/computergalaxyindia',
      twitter: 'https://x.com/computergalaxyin',
    },
  },
  footer: {
    description: 'Computer Galaxy is India\'s premier enthusiast PC hardware store offering custom liquid-cooled gaming rigs, commercial office desktops, and verified components with 100% transit insurance and Indian distributor warranty.',
    gstNumber: 'GSTIN: 27AABCC1234D1Z8',
    copyrightText: '© 2026 Computer Galaxy Hardware & Systems. All Rights Reserved. All brand logos are property of their respective manufacturers.',
    quickLinks: [
      { label: 'Basic & Office PCs', url: '#basic-pcs' },
      { label: 'Gaming Rigs', url: '#gaming-pcs' },
      { label: 'Custom PC Builder', url: '#custom-builder' },
      { label: 'All Components', url: '#catalog-section' },
      { label: 'Track My Order', url: '#track-order' },
      { label: 'Warranty & Support Policy', url: '#warranty' },
    ],
  },
  navigation: [
    { id: 'nav-home', label: 'Home', path: 'home', order: 1, active: true },
    { id: 'nav-basic', label: 'Basic Computers', path: 'basic-computers', order: 2, active: true },
    { id: 'nav-gaming', label: 'Gaming Computers', path: 'gaming-computers', order: 3, active: true },
    { id: 'nav-builder', label: 'Custom PC Builder', path: 'custom-pc', order: 4, active: true },
    { id: 'nav-catalog', label: 'Hardware Catalog', path: 'catalog', order: 5, active: true },
    { id: 'nav-contact', label: 'Contact Us', path: 'contact', order: 6, active: true },
  ],
  faqs: [
    {
      id: 'faq-1',
      question: 'Are all components 100% genuine with official Indian warranty?',
      answer: 'Yes! Every CPU, GPU, motherboard, RAM, and SSD carries authorized Indian distributor stickers (Rashi Peripherals, Acro, Supertron, Kaizen, Redington) and comes with an official GST invoice for direct brand warranty claims across India.',
      category: 'Warranty & Genuine Products',
      order: 1,
    },
    {
      id: 'faq-2',
      question: 'How are custom PCs shipped safely to other states?',
      answer: 'We use custom Instapak expanding foam inside the cabinet to immobilize the heavy graphics card and cooler, wrap the system in multi-layered air cushioning, box it in double-corrugated cartons, and dispatch via BlueDart Air with 100% transit loss and damage insurance.',
      category: 'Shipping & Delivery',
      order: 2,
    },
    {
      id: 'faq-3',
      question: 'Do you charge extra for custom PC assembly and OS installation?',
      answer: 'Zero assembly fees! We provide complimentary professional assembly with clean cable management, Thermal Grizzly thermal paste, updated motherboard BIOS, and pre-activated Windows 11 installation with 24-hour stress testing.',
      category: 'Custom PC Assembly',
      order: 3,
    },
    {
      id: 'faq-4',
      question: 'What payment options are supported?',
      answer: 'We support UPI (Google Pay, PhonePe, Paytm), Net Banking across all Indian banks, Credit/Debit cards, and No-Cost EMI options.',
      category: 'Payments',
      order: 4,
    },
  ],
  seo: {
    title: 'Computer Galaxy - Gaming PC, Custom PC & Computer Hardware Store India',
    metaDescription: 'Shop custom gaming PCs, basic office computers, Intel Core 14th Gen, AMD Ryzen 7000, and RTX 40-Series graphics cards with pan-India insured delivery and 3-year warranty.',
    keywords: 'computer galaxy, gaming pc india, custom pc builder, rtx 4080 super, intel 14700k, amd ryzen 7800x3d, office desktop, pc components india',
    ogImage: '/src/assets/images/hero_gaming_pc_setup_1793788644736.jpg',
  },
};

// Initial default settings
const DEFAULT_SETTINGS: WebsiteSettings = {
  businessName: 'Computer Galaxy',
  tagline: 'Gaming PC & Hardware Store',
  logoUrl: '',
  faviconUrl: '',
  primaryColor: '#783D1B',
  secondaryColor: '#FFB020',
  currencySymbol: '₹',
  currencyCode: 'INR',
  maintenanceMode: false,
  contactNumber: '+91 70144 43922',
  whatsappNumber: '+91 70144 43922',
  supportEmail: 'sales@computergalaxy.in',
  officeAddress: 'Shop 14-16, IT Mall, MG Road, Camp, Pune, Maharashtra 411001',
  freeShippingThreshold: 2000,
  standardShippingFee: 99,
  gstPercent: 18,
};

import { PRODUCTS_CATALOG } from '../src/data/products.ts';

// Simple secure hash helper (deterministic SHA-256 in Node.js)
import crypto from 'crypto';

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_cg_salt_2026').digest('hex');
}

// Initial default admin user:
// Email: admin@computergalaxy.in
// Password: GalaxyAdmin@2026
const DEFAULT_ADMIN_USER: AdminUser = {
  id: 'admin-super-01',
  email: 'admin@computergalaxy.in',
  passwordHash: hashPassword('GalaxyAdmin@2026'),
  name: 'Chief Administrator',
  role: 'superadmin',
  createdAt: new Date().toISOString(),
};

const DEFAULT_SAMPLE_ORDER = {
  id: 'CG-89210',
  createdAt: '03 Nov 2026, 04:30 PM',
  customer: {
    fullName: 'Aniket Verma',
    phone: '9820198201',
    email: 'aniket.v@gmail.com',
    addressLine: 'B-702, Lodha Park, Senapati Bapat Marg, Lower Parel',
    city: 'Mumbai',
    state: 'Maharashtra',
    pinCode: '400013',
    paymentMethod: 'upi',
  },
  items: [
    {
      product: PRODUCTS_CATALOG[0],
      quantity: 1,
    },
  ],
  subtotal: 249999,
  discount: 35001,
  deliveryCharge: 0,
  total: 249999,
  status: 'Processing',
  paymentStatus: 'Paid',
  trackingNumber: 'BD-IN-7890123',
  gstInvoiceNumber: 'GST-CG26-4491',
  internalNotes: 'Customer requested double-layer corner padding for BlueDart Air transit.',
};

const DEFAULT_SAMPLE_CUSTOMER: CustomerProfile = {
  id: 'cust-89201',
  fullName: 'Aniket Verma',
  email: 'aniket.v@gmail.com',
  phone: '9820198201',
  city: 'Mumbai',
  state: 'Maharashtra',
  pinCode: '400013',
  addressLine: 'B-702, Lodha Park, Senapati Bapat Marg, Lower Parel',
  ordersCount: 1,
  totalSpent: 249999,
  lastOrderDate: '03 Nov 2026, 04:30 PM',
  createdAt: '03 Nov 2026, 04:30 PM',
};

// Initial in-memory cache and disk persistence
class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure all required top-level collections exist and products has seed
        const loaded: DatabaseSchema = {
          adminUsers: parsed.adminUsers && parsed.adminUsers.length > 0 ? parsed.adminUsers : [DEFAULT_ADMIN_USER],
          products: parsed.products && parsed.products.length > 0 ? parsed.products : PRODUCTS_CATALOG,
          categories: parsed.categories && parsed.categories.length > 0 ? parsed.categories : DEFAULT_CATEGORIES,
          banners: parsed.banners && parsed.banners.length > 0 ? parsed.banners : DEFAULT_BANNERS,
          sales: parsed.sales && parsed.sales.length > 0 ? parsed.sales : DEFAULT_SALES,
          orders: parsed.orders && parsed.orders.length > 0 ? parsed.orders : [DEFAULT_SAMPLE_ORDER],
          customers: parsed.customers && parsed.customers.length > 0 ? parsed.customers : [DEFAULT_SAMPLE_CUSTOMER],
          content: parsed.content || DEFAULT_CONTENT,
          media: parsed.media || [],
          settings: parsed.settings || DEFAULT_SETTINGS,
          published: parsed.published || {
            products: JSON.parse(JSON.stringify(parsed.products || PRODUCTS_CATALOG)),
            categories: JSON.parse(JSON.stringify(parsed.categories || DEFAULT_CATEGORIES)),
            banners: JSON.parse(JSON.stringify(parsed.banners || DEFAULT_BANNERS)),
            sales: JSON.parse(JSON.stringify(parsed.sales || DEFAULT_SALES)),
            content: JSON.parse(JSON.stringify(parsed.content || DEFAULT_CONTENT)),
            settings: JSON.parse(JSON.stringify(parsed.settings || DEFAULT_SETTINGS)),
            publishedAt: new Date().toISOString(),
            publishedBy: 'Initial Setup',
          },
          hasUnpublishedChanges: Boolean(parsed.hasUnpublishedChanges),
          pendingChangesCount: parsed.pendingChangesCount || 0,
        };
        return loaded;
      }
    } catch (err) {
      console.error('[DB] Error loading database file:', err);
    }

    // Default seed
    const initial: DatabaseSchema = {
      adminUsers: [DEFAULT_ADMIN_USER],
      products: PRODUCTS_CATALOG,
      categories: DEFAULT_CATEGORIES,
      banners: DEFAULT_BANNERS,
      sales: DEFAULT_SALES,
      orders: [DEFAULT_SAMPLE_ORDER],
      customers: [DEFAULT_SAMPLE_CUSTOMER],
      content: DEFAULT_CONTENT,
      media: [],
      settings: DEFAULT_SETTINGS,
      published: {
        products: JSON.parse(JSON.stringify(PRODUCTS_CATALOG)),
        categories: JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)),
        banners: JSON.parse(JSON.stringify(DEFAULT_BANNERS)),
        sales: JSON.parse(JSON.stringify(DEFAULT_SALES)),
        content: JSON.parse(JSON.stringify(DEFAULT_CONTENT)),
        settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS)),
        publishedAt: new Date().toISOString(),
        publishedBy: 'Initial Setup',
      },
      hasUnpublishedChanges: false,
      pendingChangesCount: 0,
    };
    this.save(initial);
    return initial;
  }

  public save(dataToSave?: DatabaseSchema): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const data = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Error saving database file:', err);
    }
  }

  public get(): DatabaseSchema {
    return this.data;
  }

  public update(updater: (db: DatabaseSchema) => void): DatabaseSchema {
    updater(this.data);
    this.save();
    return this.data;
  }
}

export const db = new Database();
