import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider } from './contexts/CartContext'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetail from './pages/ProductDetail'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import PaymentCompleted from './pages/PaymentCompleted'
import PaymentCanceled from './pages/PaymentCanceled'
import OrderCreated from './pages/OrderCreated'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="shop" element={<ProductsPage />} />
              <Route path="shop/:slug" element={<ProductDetail />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="orders/create" element={<CheckoutPage />} />
              <Route path="orders" element={
                <PrivateRoute>
                  <OrdersPage />
                </PrivateRoute>
              } />
              <Route path="orders/:id" element={
                <PrivateRoute>
                  <OrderDetailPage />
                </PrivateRoute>
              } />
              <Route path="user/login" element={<LoginPage />} />
              <Route path="user/registration" element={<RegisterPage />} />
              <Route path="user/profile" element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              } />
              <Route path="payment/completed" element={<PaymentCompleted />} />
              <Route path="payment/canceled" element={<PaymentCanceled />} />
              <Route path="orders/created" element={<OrderCreated />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App



