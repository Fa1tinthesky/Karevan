import { useState } from 'react'
import './App.css'

import {
    QueryClient,
    QueryClientProvider
} from '@tanstack/react-query'

const queryClient = new QueryClient();
function App() {
  const [count, setCount] = useState(0)

  return (
  <QueryClientProvider client={queryClient}>
      <h1>Hello There</h1>  
  </QueryClientProvider>
  )
}

export default App
