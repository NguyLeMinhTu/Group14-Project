import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import { setTokenFromStorage, fetchProfile } from './store/authSlice'

// Initialize auth from localStorage (set axios header) and fetch profile if token exists
store.dispatch(setTokenFromStorage());
if (store.getState().auth.token) {
  // fetchProfile is idempotent — it will populate user or clear token on failure
  store.dispatch(fetchProfile());
}

createRoot(document.getElementById('root')).render(
  <>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </>,
)
