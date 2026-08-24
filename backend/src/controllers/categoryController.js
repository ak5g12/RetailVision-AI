const Category = require('../models/Category');

// GET /api/categories
const getCategories = async (req, res) => {
  try {
    const filter = {};
    // If not Staff/Manager/Owner/Admin, only show active categories
    if (!req.user || req.user.role === 'CUSTOMER') {
      filter.active = true;
    }
    const categories = await Category.find(filter).lean();
    
    // Add product counts for each category based on real active products
    const Product = require('../models/Product');
    const categoriesWithCounts = await Promise.all(categories.map(async (c) => {
      const prodFilter = { category: c._id };
      if (!req.user || req.user.role === 'CUSTOMER') {
        prodFilter.active = true;
      }
      c.count = await Product.countDocuments(prodFilter);
      return c;
    }));
    
    res.json(categoriesWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/categories/:id
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    if ((!req.user || req.user.role === 'CUSTOMER') && !category.active) {
      return res.status(403).json({ message: 'Access denied to inactive category' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/categories
const createCategory = async (req, res) => {
  try {
    const { name, slug, description, active } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ message: 'Name and slug are required' });
    }
    const exists = await Category.findOne({ $or: [{ name }, { slug }] });
    if (exists) {
      return res.status(400).json({ message: 'Category name or slug already exists' });
    }
    const category = await Category.create({ name, slug, description, active });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/categories/:id
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    const { name, slug, description, active } = req.body;
    
    // Check duplicates if name or slug changed
    if ((name && name !== category.name) || (slug && slug !== category.slug)) {
      const exists = await Category.findOne({
        _id: { $ne: req.params.id },
        $or: [{ name: name || category.name }, { slug: slug || category.slug }]
      });
      if (exists) {
        return res.status(400).json({ message: 'Category name or slug already exists' });
      }
    }

    category.name = name || category.name;
    category.slug = slug || category.slug;
    if (description !== undefined) category.description = description;
    if (active !== undefined) category.active = active;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    await category.deleteOne();
    res.json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
