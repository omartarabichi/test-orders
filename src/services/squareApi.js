import axios from "axios";

const api = axios.create({
  baseURL: 'http://localhost:4000',
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
  const response = await api.get('/api/locations');
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
    const response = await api.post('/api/catalog/object', data);
    console.log('Catalog item created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating catalog item:', error.response?.data || error);
    throw error;
  }
};

export const createOrder = async () => {
  try {
    console.log('Starting test order creation...');
    
    // First get locations
    const locationsResponse = await api.get('/api/locations');
    const locationId = locationsResponse.data.locations[0].id;
    console.log('Using location:', locationId);

    // Create the test order
    console.log('Sending create-test-order request...');
    const orderResponse = await api.post('/api/create-test-order', { locationId });
    console.log('Order creation response:', orderResponse.data);

    return orderResponse.data;
  } catch (error) {
    console.error('Error creating order:', error.response?.data || error);
    throw error;
  }
};

export const deleteCatalogItem = async (itemId) => {
  const response = await api.delete(`/api/catalog/object/${itemId}`);
  return response.data;
};
