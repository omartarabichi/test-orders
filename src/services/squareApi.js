import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_SQUARE_SANDBOX_URL,
  headers: {
    "Authorization": `Bearer ${process.env.REACT_APP_SQUARE_ACCESS_TOKEN}`,
    "Content-Type": "application/json"
  }
});

export const createCatalogItem = async () => {
  const response = await api.post("/catalog/object", {
    idempotencyKey: Date.now().toString(),
    object: {
      type: "ITEM",
      itemData: {
        name: "Test Order",
        variations: [
          {
            type: "ITEM_VARIATION",
            id: "#variation",
            itemVariationData: {
              priceMoney: {
                amount: 0,
                currency: "USD"
              },
              pricing_type: "FIXED_PRICING"
            }
          }
        ],
        isArchived: false,
        presentAtAllLocations: true,
        productType: "REGULAR",
        visibility: "VISIBILITY_PUBLIC"
      }
    }
  });
  return response.data;
};

export const createOrder = async (itemVariationId) => {
  const response = await api.post("/orders", {
    idempotencyKey: Date.now().toString(),
    order: {
      lineItems: [
        {
          quantity: "1",
          catalogObjectId: itemVariationId
        }
      ]
    }
  });
  return response.data;
};

export const deleteCatalogItem = async (itemId) => {
  const response = await api.delete(`/catalog/object/${itemId}`);
  return response.data;
};
