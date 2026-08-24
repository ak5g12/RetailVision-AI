const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');

dotenv.config();

const categories = [
  { name: 'Laptops', slug: 'laptops', description: 'High performance laptops' },
  { name: 'Monitors', slug: 'monitors', description: '4K and gaming monitors' },
  { name: 'Keyboards', slug: 'keyboards', description: 'Mechanical and membrane keyboards' },
  { name: 'Headphones', slug: 'headphones', description: 'Over-ear and in-ear headphones' },
  { name: 'Smartwatches', slug: 'smartwatches', description: 'Fitness and lifestyle smartwatches' }
];

const seedData = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.log('MONGO_URI is not set. Skipping seed.');
      return;
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Product.deleteMany();
    await Category.deleteMany();

    const createdCategories = await Category.insertMany(categories);
    console.log('Categories seeded');

    const catMap = {};
    createdCategories.forEach(c => {
      catMap[c.name] = c._id;
    });

    const products = [
      {
        name: 'MacBook Pro 16',
        SKU: 'MBP-16-2023',
        category: catMap['Laptops'],
        brand: 'Apple',
        description: 'M2 Max, 32GB RAM, 1TB SSD',
        price: 2499.99,
        costPrice: 2000.00,
        stock: 15
      },
      {
        name: 'Dell XPS 13',
        SKU: 'DXPS-13-9315',
        category: catMap['Laptops'],
        brand: 'Dell',
        description: 'Intel Core i7, 16GB RAM, 512GB SSD',
        price: 1299.99,
        costPrice: 950.00,
        stock: 25
      },
      {
        name: 'LG UltraGear 27"',
        SKU: 'LG-UG-27',
        category: catMap['Monitors'],
        brand: 'LG',
        description: '1440p, 144Hz, 1ms Response Time',
        price: 349.99,
        costPrice: 250.00,
        stock: 40
      },
      {
        name: 'Keychron K2',
        SKU: 'KEY-K2-V2',
        category: catMap['Keyboards'],
        brand: 'Keychron',
        description: 'Wireless Mechanical Keyboard',
        price: 79.99,
        costPrice: 45.00,
        stock: 60
      },
      {
        name: 'Sony WH-1000XM5',
        SKU: 'SONY-WH5',
        category: catMap['Headphones'],
        brand: 'Sony',
        description: 'Wireless Noise Canceling Headphones',
        price: 398.00,
        costPrice: 280.00,
        stock: 30
      },
      {
        name: 'Apple Watch Series 9',
        SKU: 'AW-S9-45',
        category: catMap['Smartwatches'],
        brand: 'Apple',
        description: '45mm, GPS + Cellular',
        price: 499.00,
        costPrice: 380.00,
        stock: 50
      }
    ];

    await Product.insertMany(products);
    console.log('Products seeded');

    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
