import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import PaymentCompleted from './pages/PaymentCompleted'
import PaymentCanceled from './pages/PaymentCanceled'
import OrderCreated from './pages/OrderCreated'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/payment/completed" element={<PaymentCompleted />} />
        <Route path="/payment/canceled" element={<PaymentCanceled />} />
        <Route path="/orders/created" element={<OrderCreated />} />
      </Routes>
    </Router>
  )
}

export default App



