const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../models/Category');
const Product = require('../models/Product');
const connectDB = require('../config/db');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const categories = [
  { name: 'Laptops & Accessories', slug: 'laptops-accessories', description: 'Premium laptops and essential accessories' },
  { name: 'Computer Peripherals', slug: 'computer-peripherals', description: 'Keyboards, mice, and more' },
  { name: 'Mobile Accessories', slug: 'mobile-accessories', description: 'Chargers, cases, and power banks' },
  { name: 'Storage', slug: 'storage', description: 'SSDs, HDDs, and flash drives' },
  { name: 'Networking', slug: 'networking', description: 'Routers, switches, and adapters' },
  { name: 'Audio', slug: 'audio', description: 'Headphones, speakers, and microphones' },
  { name: 'Monitors', slug: 'monitors', description: 'High-resolution displays for work and gaming' },
];

const productsData = [
  {
    name: 'Pro Wireless Gaming Mouse',
    SKU: 'PER-MSE-001',
    categoryName: 'Computer Peripherals',
    brand: 'Logitech',
    description: 'Ultra-lightweight wireless gaming mouse with 25K sensor.',
    price: 129.99,
    costPrice: 75.00,
    stock: 45,
    images: ['https://images.unsplash.com/photo-1527814050087-379381547336?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
    specifications: { DPI: '25600', Weight: '63g', Connectivity: 'Wireless' }
  },
  {
    name: 'Mechanical Keyboard MX',
    SKU: 'PER-KBD-002',
    categoryName: 'Computer Peripherals',
    brand: 'Keychron',
    description: 'Wireless mechanical keyboard with tactile switches and RGB backlight.',
    price: 149.99,
    costPrice: 85.00,
    stock: 30,
    images: ['https://images.unsplash.com/photo-1595225476474-87563907a212?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
    specifications: { Switches: 'Tactile Brown', Layout: '75%', Connectivity: 'Bluetooth/Wired' }
  },
  {
    name: 'USB-C Multiport Hub',
    SKU: 'LAP-HUB-003',
    categoryName: 'Laptops & Accessories',
    brand: 'Anker',
    description: '7-in-1 USB-C hub with 4K HDMI, 100W Power Delivery, and SD card reader.',
    price: 49.99,
    costPrice: 22.00,
    stock: 120,
    images: ['https://images.unsplash.com/photo-1598284687625-f71f00889c2f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
    specifications: { Ports: '7', HDMI: '4K@30Hz', PowerDelivery: '100W' }
  },
  {
    name: 'Ergonomic Laptop Stand',
    SKU: 'LAP-STD-004',
    categoryName: 'Laptops & Accessories',
    brand: 'Rain Design',
    description: 'Aluminum laptop stand for better ergonomics and cooling.',
    price: 39.99,
    costPrice: 15.00,
    stock: 85,
    images: ['https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
    specifications: { Material: 'Aluminum', Compatibility: '11-17 inch laptops' }
  },
  {
    name: '4K Streaming Webcam',
    SKU: 'PER-CAM-005',
    categoryName: 'Computer Peripherals',
    brand: 'Logitech',
    description: 'Ultra HD 4K webcam for professional video conferencing and streaming.',
    price: 199.99,
    costPrice: 110.00,
    stock: 25,
    images: ['https://images.unsplash.com/photo-1621644715873-10023a7e28b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
    specifications: { Resolution: '4K/30fps', FieldOfView: '90 degrees', Microphone: 'Dual omni-directional' }
  },
  {
    name: '1TB NVMe Gen4 SSD',
    SKU: 'STO-SSD-006',
    categoryName: 'Storage',
    brand: 'Samsung',
    description: 'Ultra-fast PCIe Gen4 NVMe M.2 SSD for gaming and content creation.',
    price: 109.99,
    costPrice: 65.00,
    stock: 60,
    images: ['https://images.unsplash.com/photo-1597848212624-a19eb35e2651?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
    specifications: { Capacity: '1TB', Interface: 'PCIe Gen4 x4', ReadSpeed: '7000 MB/s' }
  },
  {
    name: '2TB External HDD',
    SKU: 'STO-HDD-007',
    categoryName: 'Storage',
    brand: 'WD',
    description: 'Reliable and portable 2TB external hard drive with USB 3.0.',
    price: 79.99,
    costPrice: 40.00,
    stock: 100,
    images: ['https://images.unsplash.com/photo-1579768297775-8025211918a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
    specifications: { Capacity: '2TB', Interface: 'USB 3.0', FormFactor: '2.5 inch' }
  },
  {
    name: 'Wi-Fi 6 Mesh Router',
    SKU: 'NET-ROU-008',
    categoryName: 'Networking',
    brand: 'TP-Link',
    description: 'Next-gen Wi-Fi 6 mesh system for whole-home coverage.',
    price: 249.99,
    costPrice: 140.00,
    stock: 20,
    images: ['https://images.unsplash.com/photo-1544158440-62299d21ceeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
    specifications: { Standard: 'Wi-Fi 6 (802.11ax)', Coverage: 'Up to 5800 sq. ft.', Speed: 'AX3000' }
  },
  {
    name: 'Active Noise Cancelling Headphones',
    SKU: 'AUD-HDP-009',
    categoryName: 'Audio',
    brand: 'Sony',
    description: 'Industry-leading noise cancellation, exceptional sound quality.',
    price: 349.99,
    costPrice: 210.00,
    stock: 40,
    images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
    specifications: { Type: 'Over-ear', BatteryLife: '30 hours', NoiseCancelling: 'Active' }
  },
  {
    name: 'Portable Bluetooth Speaker',
    SKU: 'AUD-SPK-010',
    categoryName: 'Audio',
    brand: 'JBL',
    description: 'Waterproof portable Bluetooth speaker with deep bass.',
    price: 119.99,
    costPrice: 60.00,
    stock: 75,
    images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
    specifications: { Waterproof: 'IP67', Playtime: '12 hours', Bluetooth: '5.1' }
  },
  {
    name: '27-inch 4K IPS Monitor',
    SKU: 'MON-4K-011',
    categoryName: 'Monitors',
    brand: 'Dell',
    description: 'Crisp 4K resolution with USB-C connectivity and ergonomic stand.',
    price: 449.99,
    costPrice: 280.00,
    stock: 15,
    images: ['https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
    specifications: { Resolution: '3840x2160', PanelType: 'IPS', RefreshRate: '60Hz' }
  },
  {
    name: '34-inch Ultrawide Gaming Monitor',
    SKU: 'MON-UW-012',
    categoryName: 'Monitors',
    brand: 'LG',
    description: 'Immersive curved ultrawide monitor with 144Hz refresh rate.',
    price: 599.99,
    costPrice: 380.00,
    stock: 10,
    images: ['https://images.unsplash.com/photo-1586952518485-11b180e92764?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
    specifications: { Resolution: '3440x1440', RefreshRate: '144Hz', Curve: '1500R' }
  },
  {
    name: '10000mAh Power Bank',
    SKU: 'MOB-PWR-013',
    categoryName: 'Mobile Accessories',
    brand: 'Anker',
    description: 'Compact 10000mAh portable charger with 20W Power Delivery.',
    price: 29.99,
    costPrice: 12.00,
    stock: 150,
    images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
    specifications: { Capacity: '10000mAh', Output: '20W USB-C PD', Weight: '212g' }
  },
  {
    name: '65W GaN Fast Charger',
    SKU: 'MOB-CHG-014',
    categoryName: 'Mobile Accessories',
    brand: 'Ugreen',
    description: 'Ultra-compact 3-port charger powered by GaN tech.',
    price: 45.99,
    costPrice: 20.00,
    stock: 90,
    images: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
    specifications: { Power: '65W', Ports: '2x USB-C, 1x USB-A', Tech: 'GaN' }
  },
  {
    name: 'Wireless Gaming Headset',
    SKU: 'AUD-GHD-015',
    categoryName: 'Audio',
    brand: 'SteelSeries',
    description: 'High-fidelity audio with lossless wireless connectivity.',
    price: 179.99,
    costPrice: 100.00,
    stock: 35,
    images: ['https://images.unsplash.com/photo-1612222869049-d8ec83637a3c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
    specifications: { Wireless: '2.4GHz Lossless', Battery: '24 Hours', Mic: 'ClearCast Gen 2' }
  },
  {
    name: 'USB Condenser Microphone',
    SKU: 'AUD-MIC-016',
    categoryName: 'Audio',
    brand: 'Blue',
    description: 'Professional USB mic for recording and streaming.',
    price: 129.99,
    costPrice: 70.00,
    stock: 45,
    images: ['https://images.unsplash.com/photo-1598550476439-6847785fcea6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
    specifications: { Type: 'Condenser', Patterns: 'Cardioid, Bidirectional, Omnidirectional, Stereo' }
  },
  {
    name: 'Gigabit Ethernet Switch',
    SKU: 'NET-SWT-017',
    categoryName: 'Networking',
    brand: 'Netgear',
    description: '8-Port Gigabit Ethernet unmanaged switch.',
    price: 39.99,
    costPrice: 18.00,
    stock: 50,
    images: ['https://images.unsplash.com/photo-1558227691-41ea78d1f631?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
    specifications: { Ports: '8x Gigabit', Type: 'Unmanaged', Enclosure: 'Metal' }
  },
  {
    name: 'High-Speed USB Flash Drive',
    SKU: 'STO-USB-018',
    categoryName: 'Storage',
    brand: 'SanDisk',
    description: '256GB USB 3.2 flash drive for rapid file transfers.',
    price: 34.99,
    costPrice: 15.00,
    stock: 200,
    images: ['https://images.unsplash.com/photo-1622286342621-4bd786c2447c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
    specifications: { Capacity: '256GB', Interface: 'USB 3.2 Gen 1', ReadSpeed: '400 MB/s' }
  },
  {
    name: '14-inch Business Laptop',
    SKU: 'LAP-SYS-019',
    categoryName: 'Laptops & Accessories',
    brand: 'Lenovo',
    description: 'Powerful and portable 14" laptop with Intel Core i7 and 16GB RAM.',
    price: 1199.99,
    costPrice: 850.00,
    stock: 25,
    images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
    specifications: { CPU: 'Intel Core i7-1260P', RAM: '16GB', Storage: '512GB SSD', Display: '14" FHD' }
  },
  {
    name: 'Magnetic Wireless Charger',
    SKU: 'MOB-MAG-020',
    categoryName: 'Mobile Accessories',
    brand: 'Apple',
    description: 'MagSafe compatible wireless charger for fast charging.',
    price: 39.00,
    costPrice: 18.00,
    stock: 120,
    images: ['https://images.unsplash.com/photo-1615526653139-4402660d3fc3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
    specifications: { Output: '15W', Compatibility: 'MagSafe devices' }
  }
];

const seedData = async () => {
  try {
    await connectDB();
    console.log('MongoDB Connected for Seeding');

    let categoryCount = 0;
    let productCount = 0;

    // Seed Categories
    const categoryMap = {};
    for (const cat of categories) {
      const existing = await Category.findOne({ slug: cat.slug });
      if (existing) {
        categoryMap[cat.name] = existing._id;
      } else {
        const newCat = await Category.create(cat);
        categoryMap[cat.name] = newCat._id;
        categoryCount++;
      }
    }

    // Seed Products
    for (const prod of productsData) {
      const categoryId = categoryMap[prod.categoryName];
      if (!categoryId) {
        console.warn(`Category not found for product: ${prod.name}`);
        continue;
      }

      const existingProd = await Product.findOne({ SKU: prod.SKU });
      if (!existingProd) {
        const productToCreate = {
          ...prod,
          category: categoryId
        };
        delete productToCreate.categoryName;
        await Product.create(productToCreate);
        productCount++;
      }
    }

    console.log('Seeding Complete!');
    console.log(`Categories inserted: ${categoryCount}`);
    console.log(`Products inserted: ${productCount}`);
    process.exit(0);
  } catch (error) {
    console.error('Error with data import', error);
    process.exit(1);
  }
};

seedData();
