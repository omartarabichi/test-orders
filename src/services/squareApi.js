import axios from "axios";

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add logging
api.interceptors.request.use(request => {
  console.log('Starting Request:', request);
  return request;
});

api.interceptors.response.use(
  response => {
    console.log('Response:', response);
    return response;
  },
  error => {
    console.log('Error:', error.response);
    return Promise.reject(error);
  }
);

// Add function to get locations
export const getLocations = async () => {
  const response = await api.get('/locations');
  return response.data;
};

export const createCatalogItem = async () => {
  try {
    const itemId = '#TestItem' + Date.now();
    const data = {
      idempotency_key: Date.now().toString(),
      object: {
        id: itemId,
        type: "ITEM",
        item_data: {
          name: "Test Item",
          description: "This is a test item",
          variations: [
            {
              type: "ITEM_VARIATION",
              id: "#TestVariation" + Date.now(),
              item_variation_data: {
                item_id: itemId,
                name: "Regular",
                pricing_type: "FIXED_PRICING",
                price_money: {
                  amount: 1000,
                  currency: "USD"
                }
              }
            }
          ]
        }
      }
    };

    console.log('Creating catalog item with data:', JSON.stringify(data, null, 2));
    const response = await api.post('/catalog/object', data);
    console.log('Catalog item created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating catalog item:', error.response?.data || error);
    throw error;
  }
};

// Helper function to wait
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export const createOrder = async () => {
  let customerId = null;
  let catalogItemId = null;
  let catalogVariationId = null;
  let orderId = null;

  try {
    // First, get the locations
    const locationsResponse = await api.get('/locations');
    console.log('Available locations:', JSON.stringify(locationsResponse.data, null, 2));
    const locationId = locationsResponse.data.locations[0].id;
    console.log('Using location ID:', locationId);

    // Create a catalog item first with $0 price
    const catalogData = {
      idempotency_key: Date.now().toString(),
      object: {
        type: "ITEM",
        id: `#TestItem${Date.now()}`,
        item_data: {
          name: "Test Item",
          description: "Test item for order",
          variations: [{
            type: "ITEM_VARIATION",
            id: `#TestVar${Date.now()}`,
            item_variation_data: {
              name: "Regular",
              pricing_type: "FIXED_PRICING",
              price_money: {
                amount: 0,
                currency: "USD"
              }
            }
          }]
        }
      }
    };

    console.log('Creating catalog item with data:', JSON.stringify(catalogData, null, 2));
    const catalogResponse = await api.post('/catalog/object', catalogData);
    console.log('Catalog response:', JSON.stringify(catalogResponse.data, null, 2));
    
    catalogItemId = catalogResponse.data.catalog_object.id;
    catalogVariationId = catalogResponse.data.catalog_object.item_data.variations[0].id;
    console.log('Catalog item ID:', catalogItemId);
    console.log('Catalog variation ID:', catalogVariationId);

    // Wait for catalog item to be ready
    await delay(2000);

    // Create a customer
    const customerData = {
      idempotency_key: Date.now().toString(),
      given_name: "Test",
      family_name: "Customer",
      email_address: "test@example.com",
      phone_number: "+12025550123",
      address: {
        address_line_1: "123 Main St",
        locality: "San Francisco",
        administrative_district_level_1: "CA",
        postal_code: "94105",
        country: "US"
      }
    };

    console.log('Creating customer with data:', JSON.stringify(customerData, null, 2));
    const customerResponse = await api.post('/customers', customerData);
    console.log('Customer response:', JSON.stringify(customerResponse.data, null, 2));
    
    customerId = customerResponse.data.customer.id;
    console.log('Customer ID:', customerId);

    // Create the order
    const orderData = {
      idempotency_key: Date.now().toString(),
      order: {
        location_id: locationId,
        source: {
          name: "Online Store"
        },
        customer_id: customerId,
        line_items: [
          {
            catalog_object_id: catalogVariationId,
            quantity: "1"
          }
        ],
        state: "OPEN",
        fulfillments: [
          {
            type: "PICKUP",
            state: "PROPOSED",
            pickup_details: {
              recipient: {
                display_name: "Test Customer",
                email_address: "test@example.com",
                phone_number: "+12025550123"
              },
              pickup_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              note: "Test pickup order",
              is_curbside_pickup: false
            }
          }
        ]
      }
    };

    console.log('Creating order with data:', JSON.stringify(orderData, null, 2));
    const orderResponse = await api.post('/orders', orderData);
    console.log('Order response:', JSON.stringify(orderResponse.data, null, 2));
    orderId = orderResponse.data.order.id;

    // Create a $0 payment for the order
    const paymentData = {
      idempotency_key: Date.now().toString(),
      source_id: "EXTERNAL",
      amount_money: {
        amount: 0,
        currency: "USD"
      },
      order_id: orderId,
      location_id: locationId,
      external_details: {
        type: "CARD",
        source: "Test Payment"
      }
    };

    console.log('Creating payment with data:', JSON.stringify(paymentData, null, 2));
    const paymentResponse = await api.post('/payments', paymentData);
    console.log('Payment response:', JSON.stringify(paymentResponse.data, null, 2));

    // Clean up: Delete catalog item and customer
    if (catalogItemId) {
      console.log('Deleting catalog item:', catalogItemId);
      await api.delete(`/catalog/object/${catalogItemId}`);
      console.log('Catalog item deleted successfully');
    }

    if (customerId) {
      console.log('Deleting customer:', customerId);
      await api.delete(`/customers/${customerId}`);
      console.log('Customer deleted successfully');
    }

    return orderResponse.data;
  } catch (error) {
    console.error('Error details:', error.response?.data || error);
    throw error;
  }
};

export const deleteCatalogItem = async (itemId) => {
  const response = await api.delete(`/catalog/object/${itemId}`);
  return response.data;
};
