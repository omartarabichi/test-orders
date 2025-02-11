const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Debug check - remove this in production
console.log('=== Environment Check ===');
console.log('SQUARE_ACCESS_TOKEN:', process.env.SQUARE_ACCESS_TOKEN ? 'Present' : 'Missing');
console.log('Token starts with:', process.env.SQUARE_ACCESS_TOKEN?.substring(0, 10));

// Most permissive CORS settings
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-app-name.netlify.app'],
  credentials: true
}));

// Basic middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Debug environment variables
console.log('=== Server Starting ===');
console.log('Environment variables:');
console.log('SQUARE_ACCESS_TOKEN:', process.env.SQUARE_ACCESS_TOKEN ? 'Present' : 'Missing');
console.log('SQUARE_ENVIRONMENT:', process.env.SQUARE_ENVIRONMENT);
console.log('PORT:', process.env.PORT);

// Add test routes
app.get('/', (req, res) => {
  console.log('Root endpoint hit');
  res.json({ message: 'Server is working!' });
});

app.get('/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working',
    token: process.env.SQUARE_ACCESS_TOKEN ? 'Present' : 'Missing'
  });
});

const squareClient = axios.create({
  baseURL: 'https://connect.squareupsandbox.com/v2',
  headers: {
    'Square-Version': '2024-01-17',
    'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Locations route
app.get('/api/locations', async (req, res) => {
  try {
    console.log('Getting locations...');
    const response = await squareClient.get('/locations');
    console.log('Response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error getting locations:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get locations' });
  }
});

app.post('/api/catalog/object', async (req, res) => {
  try {
    console.log('Forwarding to Square:', JSON.stringify(req.body, null, 2));
    const response = await squareClient.post('/catalog/object', req.body);
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
    const response = await squareClient.post('/orders', req.body);
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
    await squareClient.delete(`/catalog/object/${req.params.objectId}`);
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
    const response = await squareClient.post('/payments', req.body);
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
    const response = await squareClient.post('/customers', req.body);
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
    await squareClient.delete(`/customers/${req.params.customerId}`);
    console.log('Customer deleted successfully');
    res.json({ success: true });
  } catch (error) {
    console.error('Customer deletion error:', error.response?.data || error);
    res.status(error.response?.status || 500).json(error.response?.data || error);
  }
});

// Create test order with all components
app.post('/api/create-test-order', async (req, res) => {
  try {
    const { locationId } = req.body;
    console.log('Starting test order creation for location:', locationId);

    // 1. Create a catalog item
    console.log('Creating catalog item...');
    const catalogResponse = await squareClient.post('/catalog/object', {
      idempotency_key: Date.now().toString(),
      object: {
        type: 'ITEM',
        id: '#test-item',
        item_data: {
          name: 'Test Item',
          variations: [
            {
              type: 'ITEM_VARIATION',
              id: '#test-variation',
              item_variation_data: {
                item_id: '#test-item',
                name: 'Regular',
                pricing_type: 'FIXED_PRICING',
                price_money: {
                  amount: 0,
                  currency: 'USD'
                }
              }
            }
          ]
        }
      }
    });

    const itemId = catalogResponse.data.catalog_object.id;
    const variationId = catalogResponse.data.catalog_object.item_data.variations[0].id;

    // 2. Create a test customer
    console.log('Creating test customer...');
    const customerResponse = await squareClient.post('/customers', {
      idempotency_key: Date.now().toString(),
      given_name: 'Test',
      family_name: 'Customer',
      email_address: `test.${Date.now()}@example.com`
    });

    const customerId = customerResponse.data.customer.id;

    // 3. Create the order
    console.log('Creating order...');
    const orderResponse = await squareClient.post('/orders', {
      idempotency_key: Date.now().toString(),
      order: {
        location_id: locationId,
        customer_id: customerId,
        line_items: [
          {
            catalog_object_id: variationId,
            quantity: '1',
            note: 'Test Order Item'
          }
        ],
        state: 'OPEN',
        fulfillments: [
          {
            type: 'PICKUP',
            state: 'PROPOSED',
            pickup_details: {
              recipient: {
                display_name: 'Test Customer',
                email_address: `test.${Date.now()}@example.com`,
                phone_number: '+12025550123'
              },
              pickup_at: new Date(Date.now() + 3600000).toISOString(),
              note: 'Test pickup order',
              is_curbside_pickup: false,
              auto_complete_duration: 'P0D',
              schedule_type: 'SCHEDULED',
              prep_time_duration: 'PT30M'
            }
          }
        ],
        metadata: {
          source: 'Test Order App'
        },
        source: {
          name: 'Test Order App'
        }
      }
    });

    // 4. Create a payment for the order
    console.log('Creating payment...');
    const paymentResponse = await squareClient.post('/payments', {
      idempotency_key: Date.now().toString(),
      source_id: 'EXTERNAL',
      amount_money: {
        amount: 0,
        currency: 'USD'
      },
      order_id: orderResponse.data.order.id,
      external_details: {
        type: 'OTHER',
        source: 'Test Payment'
      }
    });

    // 5. Clean up - delete the test catalog item and customer
    setTimeout(async () => {
      try {
        console.log('Cleaning up test data...');
        
        // Delete catalog item
        await squareClient.delete(`/catalog/object/${itemId}`);
        console.log('Test item deleted');
        
        // Delete customer
        await squareClient.delete(`/customers/${customerId}`);
        console.log('Test customer deleted');
      } catch (error) {
        console.error('Error during cleanup:', error.response?.data || error.message);
      }
    }, 5000);

    res.json({
      message: 'Test order created successfully',
      order: orderResponse.data.order
    });

  } catch (error) {
    console.error('Error creating test order:', error.response?.data);
    res.status(500).json({ 
      error: 'Failed to create test order',
      details: error.response?.data || error.message 
    });
  }
});

// Add this new endpoint to check orders
app.get('/api/check-orders', async (req, res) => {
  try {
    console.log('Checking recent orders...');
    const response = await squareClient.post('/orders/search', {
      location_ids: [process.env.SQUARE_LOCATION_ID || 'LQT8KPJSD84DH'],
      limit: 10
    });
    
    console.log('Orders found:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error checking orders:', error.response?.data);
    res.status(500).json({ 
      error: 'Failed to check orders',
      details: error.response?.data || error.message 
    });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Token:', process.env.SQUARE_ACCESS_TOKEN ? 'Present' : 'Missing');
}); 