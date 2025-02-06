import React, { useState } from 'react';
import { createCatalogItem, createOrder, deleteCatalogItem } from '../services/squareApi';

function SquareTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleTestOrder = async () => {
    setIsLoading(true);
    setStatus('Starting test...');
    
    try {
      // Step 1: Create catalog item
      setStatus('Creating test item...');
      const catalogResponse = await createCatalogItem();
      console.log('Catalog item created:', catalogResponse);
      
      // Step 2: Create order
      setStatus('Creating order...');
      const variationId = catalogResponse.catalog_object.item_data.variations[0].id;
      const orderResponse = await createOrder(variationId);
      console.log('Order created:', orderResponse);
      
      // Step 3: Cleanup
      setStatus('Cleaning up...');
      await deleteCatalogItem(catalogResponse.catalog_object.id);
      console.log('Catalog item deleted');
      
      setStatus('Test completed successfully!');
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      setStatus(`Error: ${error.response?.data?.errors?.[0]?.detail || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Square API Test</h1>
      <button 
        onClick={handleTestOrder} 
        disabled={isLoading}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: isLoading ? 'not-allowed' : 'pointer'
        }}
      >
        {isLoading ? 'Processing...' : 'Create Test Order'}
      </button>
      {status && (
        <p style={{ marginTop: '20px' }}>{status}</p>
      )}
    </div>
  );
}

export default SquareTest; 