import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AlertProvider } from "./components/AlertProvider.jsx";

import './index.css'
import App from './App.jsx'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <AlertProvider>
      <App />
    </AlertProvider>
  </QueryClientProvider>
)
