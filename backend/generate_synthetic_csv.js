const http = require('http');
const fs = require('fs');

const performRequest = (options, data) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(responseBody || '{}') });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: responseBody });
        }
      });
    });
    req.on('error', (e) => reject(e));
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

async function generateCsv() {
  try {
    // 1. Fetch products
    const productsRes = await performRequest({
      hostname: 'localhost', port: 5000, path: '/api/products', method: 'GET'
    });
    
    if (!productsRes.data || !productsRes.data.products) {
      console.error('Failed to fetch products');
      return;
    }
    const products = productsRes.data.products;
    console.log(`Fetched ${products.length} products`);

    const csvRows = ['date,sku,quantity,price'];
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    let totalGenerated = 0;
    
    for (let i = 180; i >= 1; i--) {
      const currentDate = new Date(today.getTime());
      currentDate.setDate(currentDate.getDate() - i);
      
      const dayOfWeek = currentDate.getDay(); 
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const trendMultiplier = 1 + (180 - i) / 360; 
      
      for (const product of products) {
        if (!product.SKU) continue;
        let saleProb = 0.3; 
        const weekendMultiplier = isWeekend ? 1.5 : 1.0;
        const priceMultiplier = Math.max(0.2, 50 / (product.price || 50));
        
        const isAnomaly = Math.random() < 0.01;
        const anomalyMultiplier = isAnomaly ? (3 + Math.random() * 3) : 1.0;
        
        if (Math.random() < saleProb) continue; 
        
        let qty = Math.ceil((Math.random() * 3) * trendMultiplier * weekendMultiplier * priceMultiplier * anomalyMultiplier);
        
        if (qty > 0) {
          const dateStr = currentDate.toISOString().split('T')[0];
          csvRows.push(`${dateStr},${product.SKU},${qty},${product.price}`);
          totalGenerated++;
        }
      }
    }
    
    fs.writeFileSync('synthetic_sales.csv', csvRows.join('\n'));
    console.log(`Generated ${totalGenerated} synthetic records in synthetic_sales.csv`);
  } catch (error) {
    console.error('Error:', error);
  }
}

generateCsv();
