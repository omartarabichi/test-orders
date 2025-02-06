import React, { useState } from "react";
import {
  ChakraProvider,
  Box,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleCreateTestOrder = async () => {
    // We will add the Square API calls here
    alert("Button clicked!");
  };

  return (
    <ChakraProvider>
      <Box p={8}>
        <Button
          colorScheme="blue"
          onClick={handleCreateTestOrder}
          isLoading={isLoading}
          loadingText="Creating order..."
          mb={4}
        >
          Create test order
        </Button>
      </Box>
    </ChakraProvider>
  );
}

export default App;
