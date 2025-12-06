import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider } from './contexts/CartContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetail from './pages/ProductDetail'
import CartPage from './pages/CartPage'
import PaymentCompleted from './pages/PaymentCompleted'
import PaymentCanceled from './pages/PaymentCanceled'
import OrderCreated from './pages/OrderCreated'
import './App.css'

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="shop" element={<ProductsPage />} />
            <Route path="shop/:slug" element={<ProductDetail />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="payment/completed" element={<PaymentCompleted />} />
            <Route path="payment/canceled" element={<PaymentCanceled />} />
            <Route path="orders/created" element={<OrderCreated />} />
          </Route>
        </Routes>
      </Router>
    </CartProvider>
  )
}

export default App



