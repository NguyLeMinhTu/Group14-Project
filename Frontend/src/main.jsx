import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { setAuthFromLocalStorage } from './lib/api'

// initialize axios auth header from saved token (if any)
setAuthFromLocalStorage();

createRoot(document.getElementById('root')).render(
  <>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </>,
)
