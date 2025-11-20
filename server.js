const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------
// Middleware Setup
// ---------------------------

// Parse JSON bodies
app.use(bodyParser.json());

// Custom Logger Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Authentication Middleware (simple API key check)
// app.use((req, res, next) => {
//   const apiKey = req.headers['api-key'];
  
//   if (!apiKey || apiKey !== '12345') {
//     return res.status(401).json({ error: 'Unauthorized. Missing or invalid API key.' });
//   }

//   next();
// });

// Sample in-memory database
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false
  }
];

// ---------------------------
// Routes
// ---------------------------

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Product API! Go to /api/products to see all products.');
});

// GET all products (with optional category filter & pagination)
app.get('/api/products', (req, res) => {
  let { category, page = 1, limit = 5 } = req.query;

  let data = [...products];

  if (category) {
    data = data.filter(p => p.category === category);
  }

  // Pagination
  const start = (page - 1) * limit;
  const end = start + Number(limit);

  res.json({
    total: data.length,
    page: Number(page),
    products: data.slice(start, end)
  });
});

// GET specific product
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json(product);
});

// POST create new product
app.post('/api/products', (req, res) => {
  const { name, description, price, category, inStock } = req.body;

  // Validation Middleware (manual)
  if (!name || !description || price === undefined || !category || inStock === undefined) {
    return res.status(400).json({ error: 'Missing required product fields' });
  }

  const newProduct = {
    id: uuidv4(),
    name,
    description,
    price,
    category,
    inStock
  };

  products.push(newProduct);

  res.status(201).json(newProduct);
});

// PUT update product
app.put('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const updated = { ...products[index], ...req.body };
  products[index] = updated;

  res.json(updated);
});

// DELETE product
app.delete('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const deleted = products.splice(index, 1);

  res.json({ message: 'Product deleted successfully', deleted });
});

// SEARCH products by name
app.get('/api/products-search', (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'Missing search term: name' });
  }

  const results = products.filter(p =>
    p.name.toLowerCase().includes(name.toLowerCase())
  );

  res.json(results);
});

// Product statistics
app.get('/api/products-stats', (req, res) => {
  const stats = {};

  products.forEach(p => {
    stats[p.category] = (stats[p.category] || 0) + 1;
  });

  res.json(stats);
});

// ---------------------------
// Global Error Handler
// ---------------------------
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
