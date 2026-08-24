const csv = require('csv-parser');
const fs = require('fs');
const Product = require('../models/Product');
const HistoricalSales = require('../models/HistoricalSales');

// Helper to parse CSV
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
};

const validateRows = async (rows) => {
  const validRows = [];
  const invalidRows = [];
  const productCache = {}; // Cache SKUs to ObjectId

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const errors = [];
    
    // Check required
    if (!row.date) errors.push('Missing date');
    if (!row.sku) errors.push('Missing sku');
    if (!row.quantity) errors.push('Missing quantity');
    if (!row.price) errors.push('Missing price');

    // Parse values
    const date = new Date(row.date);
    const qty = parseInt(row.quantity);
    const price = parseFloat(row.price);

    if (isNaN(date.getTime())) errors.push('Invalid date format');
    if (isNaN(qty) || qty <= 0) errors.push('Quantity must be a positive integer');
    if (isNaN(price) || price < 0) errors.push('Price must be a positive number');

    let productId = null;
    if (row.sku) {
      if (productCache[row.sku]) {
        productId = productCache[row.sku];
      } else {
        const p = await Product.findOne({ SKU: row.sku });
        if (p) {
          productCache[row.sku] = p._id;
          productId = p._id;
        } else {
          errors.push(`Unknown product SKU: ${row.sku}`);
        }
      }
    }

    if (errors.length > 0) {
      invalidRows.push({ rowNumber: i + 2, data: row, errors });
    } else {
      validRows.push({
        product: productId,
        date: date,
        quantity: qty,
        price: price,
        source: 'IMPORTED'
      });
    }
  }

  return { validRows, invalidRows };
};

exports.previewImport = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    
    const rows = await parseCSV(req.file.path);
    const { validRows, invalidRows } = await validateRows(rows);
    
    // Cleanup file
    fs.unlinkSync(req.file.path);

    // Save valid rows to session or return to client to re-upload on confirm
    // For REST, client will send the file again for confirm, or we cache it.
    // To keep it simple & stateless, we just return preview stats. 
    // Wait, if we return validRows, the client can just send `validRows` to `/confirm`!
    
    res.json({
      totalRows: rows.length,
      validCount: validRows.length,
      invalidCount: invalidRows.length,
      invalidRows: invalidRows.slice(0, 50), // Send top 50 errors max
      sampleValid: validRows.slice(0, 5),
      // We pass the raw validated data back so client can POST it to confirm
      validDataPayload: validRows 
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Preview failed', error: error.message });
  }
};

exports.confirmImport = async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: 'No valid data provided for import' });
    }

    let insertedCount = 0;
    try {
      const result = await HistoricalSales.insertMany(data, { ordered: false });
      insertedCount = result.length;
    } catch (err) {
      if (err.name === 'BulkWriteError' && err.code === 11000) {
        insertedCount = err.result.nInserted;
      } else {
        throw err;
      }
    }

    res.json({ message: `Successfully imported ${insertedCount} new records. Ignored duplicates.`, count: insertedCount });
  } catch (error) {
    res.status(500).json({ message: 'Import failed', error: error.message });
  }
};
