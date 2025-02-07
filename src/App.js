import React from 'react';
import { createOrder } from './services/squareApi';
import './App.css';

function App() {
  const [message, setMessage] = React.useState('');

  const handleCreateOrder = async () => {
    try {
      await createOrder();
      setMessage('Test completed successfully!');
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error creating test order. Check console for details.');
    }
  };

  return (
    <div className="App">
      <h1>Square Online Test Orders</h1>
      <button onClick={handleCreateOrder}>Create Test Order</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default App;
