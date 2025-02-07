require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json());

// Add test routes
app.get('/', (req, res) => {
  console.log('Root endpoint hit');
  res.json({ message: 'Server is working!' });
});

app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ message: 'API endpoint is working!' });
});

const squareApi = axios.create({
  baseURL: 'https://connect.squareupsandbox.com/v2',
  headers: {
    'Authorization': `Bearer ${process.env.REACT_APP_SQUARE_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
    'Square-Version': '2024-02-22'
  }
});

// Add locations endpoint
app.get('/api/locations', async (req, res) => {
  try {
    const response = await squareApi.get('/locations');
    console.log('Locations response:', JSON.stringify(response.data, null, 2));
    res.json(response.data);
  } catch (error) {
    console.error('Locations error:', error.response?.data || error);
    res.status(error.response?.status || 500).json(error.response?.data || error);
  }
});

app.post('/api/catalog/object', async (req, res) => {
  try {
    console.log('Forwarding to Square:', JSON.stringify(req.body, null, 2));
    const response = await squareApi.post('/catalog/object', req.body);
    console.log('Square response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Square error:', error.response?.data || error);
    res.status(error.response?.status || 500).json(error.response?.data || error);
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    console.log('Creating order with data:', JSON.stringify(req.body, null, 2));
    const response = await squareApi.post('/orders', req.body);
    console.log('Order created successfully:', JSON.stringify(response.data, null, 2));
    res.json(response.data);
  } catch (error) {
    console.error('Order creation error:', error.response?.data || error);
    res.status(error.response?.status || 500).json(error.response?.data || error);
  }
});

app.delete('/api/catalog/object/:objectId', async (req, res) => {
  try {
    console.log('Deleting catalog object:', req.params.objectId);
    await squareApi.delete(`/catalog/object/${req.params.objectId}`);
    console.log('Catalog object deleted successfully');
    res.json({ success: true });
  } catch (error) {
    console.error('Catalog deletion error:', error.response?.data || error);
    res.status(error.response?.status || 500).json(error.response?.data || error);
  }
});

app.post('/api/payments', async (req, res) => {
  try {
    console.log('Creating payment:', JSON.stringify(req.body, null, 2));
    const response = await squareApi.post('/payments', req.body);
    console.log('Payment created:', JSON.stringify(response.data, null, 2));
    res.json(response.data);
  } catch (error) {
    console.error('Payment error:', error.response?.data || error);
    res.status(error.response?.status || 500).json(error.response?.data || error);
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    console.log('Creating customer:', JSON.stringify(req.body, null, 2));
    const response = await squareApi.post('/customers', req.body);
    console.log('Customer created:', JSON.stringify(response.data, null, 2));
    res.json(response.data);
  } catch (error) {
    console.error('Customer error:', error.response?.data || error);
    res.status(error.response?.status || 500).json(error.response?.data || error);
  }
});

app.delete('/api/customers/:customerId', async (req, res) => {
  try {
    console.log('Deleting customer:', req.params.customerId);
    await squareApi.delete(`/customers/${req.params.customerId}`);
    console.log('Customer deleted successfully');
    res.json({ success: true });
  } catch (error) {
    console.error('Customer deletion error:', error.response?.data || error);
    res.status(error.response?.status || 500).json(error.response?.data || error);
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('=================================');
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Try these URLs:');
  console.log(`1. http://localhost:${PORT}/`);
  console.log(`2. http://localhost:${PORT}/api/test`);
  console.log('=================================');
}); 