import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import PaymentCompleted from './pages/PaymentCompleted'
import PaymentCanceled from './pages/PaymentCanceled'
import OrderCreated from './pages/OrderCreated'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="payment/completed" element={<PaymentCompleted />} />
          <Route path="payment/canceled" element={<PaymentCanceled />} />
          <Route path="orders/created" element={<OrderCreated />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App



