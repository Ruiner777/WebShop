import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { ordersAPI } from '../api'
import './CheckoutPage.css'

function CheckoutPage() {
  const { cart, loading: cartLoading, clearCart } = useCart()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    city: '',
    address: '',
    postal_code: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    
    // Проверяем что корзина не пуста
    if (!cart.items || cart.items.length === 0) {
      setError('Корзина пуста. Добавьте товары перед оформлением заказа.')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Создаем заказ
      const response = await ordersAPI.create(formData)
      const orderId = response.data.id
      
      // Очищаем корзину (хотя она уже очищена на бэкенде, но обновим состояние)
      await clearCart()
      
      // Перенаправляем на страницу деталей заказа
      navigate(`/orders/${orderId}`)
    } catch (err) {
      console.error('Ошибка при создании заказа:', err)
      setError(
        err.response?.data?.error || 
        err.response?.data?.detail || 
        'Ошибка при создании заказа. Пожалуйста, попробуйте снова.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (cartLoading) {
    return (
      <div className="checkout-loading">
        <p>Загрузка...</p>
      </div>
    )
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="checkout-empty">
        <p>Корзина пуста. Добавьте товары перед оформлением заказа.</p>
      </div>
    )
  }

  return (
    <div className="forcreate">
      <div className="profile bg-white p-4 mb-4 mx-2">
        <h2 className="mb-2">Create Order</h2>
        <form onSubmit={handleSubmit} className="order-form">
          <div className="col-md-12 mb-3">
            <label htmlFor="id_first_name" className="form-label">First Name</label>
            <input
              type="text"
              className="form-control form-styleprofile"
              id="id_first_name"
              name="first_name"
              placeholder="Your First Name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-12 mb-3">
            <label htmlFor="id_last_name" className="form-label">Last Name</label>
            <input
              type="text"
              className="form-control form-styleprofile"
              id="id_last_name"
              name="last_name"
              placeholder="Your Last Name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-12 mb-3">
            <label htmlFor="id_email" className="form-label">Email</label>
            <input
              type="email"
              className="form-control form-styleprofile"
              id="id_email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-12 mb-3">
            <label htmlFor="id_address" className="form-label">Address</label>
            <input
              type="text"
              className="form-control form-styleprofile"
              id="id_address"
              name="address"
              placeholder="Your Address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-12 mb-3">
            <label htmlFor="id_postal_code" className="form-label">Postal Code</label>
            <input
              type="text"
              className="form-control form-styleprofile"
              id="id_postal_code"
              name="postal_code"
              placeholder="Your Postal Code"
              value={formData.postal_code}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-12 mb-3">
            <label htmlFor="id_city" className="form-label">City</label>
            <input
              type="text"
              className="form-control form-styleprofile"
              id="id_city"
              name="city"
              placeholder="Your City"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>
          {error && (
            <div className="checkout-error">
              <p>{error}</p>
            </div>
          )}
          <p>
            <input 
              type="submit" 
              value={isSubmitting ? "Оформление..." : "Place Order"}
              disabled={isSubmitting}
            />
          </p>
        </form>
      </div>
      <div className="checkout">
        <h1>Checkout</h1>
        <div className="order-info">
          <ul>
            {cart.items.map((item) => {
              const product = item.product
              const totalPrice = item.total_price || (product?.sell_price || product?.price || 0) * item.quantity
              return (
                <li key={product.id}>
                  {item.quantity}* {product.name}
                  <p>$ {totalPrice.toFixed(2)}</p>
                </li>
              )
            })}
          </ul>
          <p className="order-total">Total: $ {cart.total_price || '0.00'}</p>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage

