import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_SQUARE_SANDBOX_URL,
  headers: {
    "Authorization": `Bearer ${process.env.REACT_APP_SQUARE_ACCESS_TOKEN}`,
    "Content-Type": "application/json"
  }
});

export const createCatalogItem = async () => {
  const data = {
    idempotencyKey: crypto.randomUUID(),
    object: {
      type: "ITEM",
      id: "#TestOrder",
      itemData: {
        name: "Test Order",
        variations: [
          {
            type: "ITEM_VARIATION",
            id: "#TestOrderVariation",
            itemVariationData: {
              pricingType: "FIXED_PRICING",
              price: {
                amount: 0,
                currency: "USD"
              }
            }
          }
        ],
        channels: ["ONLINE"]
      }
    }
  };

  const response = await api.post("/catalog/object", data);
  return response.data;
};

export const createOrder = async (variationId) => {
  const data = {
    order: {
      lineItems: [
        {
          catalogObjectId: variationId,
          quantity: "1"
        }
      ],
      fulfillments: [
        {
          type: "PICKUP",
          state: "PROPOSED",
          pickupDetails: {
            recipient: {
              displayName: "Test Customer"
            },
            pickupAt: new Date(Date.now() + 3600000).toISOString()
          }
        }
      ]
    },
    idempotencyKey: crypto.randomUUID()
  };

  const response = await api.post("/orders", data);
  return response.data;
};

export const deleteCatalogItem = async (itemId) => {
  const response = await api.delete(`/catalog/object/${itemId}`);
  return response.data;
};
