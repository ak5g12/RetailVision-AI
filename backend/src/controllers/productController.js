const Product = require('../models/Product');
const Category = require('../models/Category');

// GET /api/products
const getProducts = async (req, res) => {
  try {
    const { keyword, category, brand, minPrice, maxPrice, sort, page, limit } = req.query;
    
    const filter = {};
    
    // If not Staff/Manager/Owner/Admin, only show active products
    if (!req.user || req.user.role === 'CUSTOMER') {
      filter.active = true;
    }

    if (keyword) {
      filter.name = { $regex: keyword, $options: 'i' };
    }
    if (category) {
      filter.category = category;
    }
    if (brand) {
      filter.brand = { $regex: brand, $options: 'i' };
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Pagination
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    let sortObj = {};
    if (sort) {
      const [field, order] = sort.split(':');
      sortObj[field] = order === 'desc' ? -1 : 1;
    } else {
      sortObj = { createdAt: -1 };
    }

    const count = await Product.countDocuments(filter);
    let products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    if (!req.user || req.user.role === 'CUSTOMER') {
      products = products.map(p => {
        const doc = p.toObject();
        delete doc.costPrice;
        return doc;
      });
    }

    res.json({
      products,
      page: pageNum,
      pages: Math.ceil(count / limitNum),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if ((!req.user || req.user.role === 'CUSTOMER') && !product.active) {
      return res.status(403).json({ message: 'Access denied to inactive product' });
    }
    let productData = product.toObject();
    if (!req.user || req.user.role === 'CUSTOMER') {
      delete productData.costPrice;
    }
    res.json(productData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/products
const createProduct = async (req, res) => {
  try {
    const { name, SKU, category, brand, description, price, costPrice, stock, images, specifications, active } = req.body;
    
    if (!name || !SKU || !category || price === undefined || costPrice === undefined || stock === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    if (price < 0 || costPrice < 0 || stock < 0) {
      return res.status(400).json({ message: 'Price, cost, and stock must be non-negative' });
    }

    // Validate category
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const skuExists = await Product.findOne({ SKU });
    if (skuExists) {
      return res.status(400).json({ message: 'SKU already exists' });
    }

    const product = await Product.create({
      name, SKU, category, brand, description, price, costPrice, stock, images, specifications, active
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { name, SKU, category, brand, description, price, costPrice, stock, images, specifications, active } = req.body;

    if (price !== undefined && price < 0) return res.status(400).json({ message: 'Price cannot be negative' });
    if (costPrice !== undefined && costPrice < 0) return res.status(400).json({ message: 'Cost cannot be negative' });
    if (stock !== undefined && stock < 0) return res.status(400).json({ message: 'Stock cannot be negative' });

    if (category && category !== product.category.toString()) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) return res.status(400).json({ message: 'Invalid category ID' });
      product.category = category;
    }

    if (SKU && SKU !== product.SKU) {
      const skuExists = await Product.findOne({ SKU, _id: { $ne: req.params.id } });
      if (skuExists) return res.status(400).json({ message: 'SKU already exists' });
      product.SKU = SKU;
    }

    if (name) product.name = name;
    if (brand !== undefined) product.brand = brand;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (costPrice !== undefined) product.costPrice = costPrice;
    if (stock !== undefined) product.stock = stock;
    if (images !== undefined) product.images = images;
    if (specifications !== undefined) product.specifications = specifications;
    if (active !== undefined) product.active = active;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
