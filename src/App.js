import React, { useState } from 'react';
import { createOrder } from './services/squareApi';
import './App.css';

function App() {
  const [status, setStatus] = useState(null);

  const handleCreateOrder = async () => {
    try {
      setStatus('Creating order...');
      await createOrder();
      setStatus('Success! Check your Order Manager for the new order.');
    } catch (err) {
      console.error('Error:', err);
      setStatus('Error creating order. Please check console for details.');
    }
  };

  return (
    <div>
      <h1>Square Online Test Orders</h1>
      <p>
        Use this app to demo how your online orders will
        show up on your POS, KDS, Dashboard and printed
        receipts.
      </p>
      <p>
        You should see a new order with a
        $0 amount set for pickup.
      </p>
      <p>
        The catalog item and customer created for this test order will
        be automatically deleted after the order is completed.
      </p>
      <button onClick={handleCreateOrder}>Create Test Order</button>
      {status && (
        <p style={{ 
          marginTop: '20px',
          color: status.includes('Error') ? '#D0021B' : '#006AFF'
        }}>
          {status}
        </p>
      )}
    </div>
  );
}

export default App;
