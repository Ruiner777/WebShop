import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ordersAPI, paymentAPI } from '../api'
import './OrderDetailPage.css'

function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [paymentMessage, setPaymentMessage] = useState(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await ordersAPI.getById(id)
        setOrder(response.data)
      } catch (err) {
        console.error('Ошибка при загрузке заказа:', err)
        setError(err.response?.data?.detail || 'Заказ не найден')
        if (err.response?.status === 404 || err.response?.status === 403) {
          setTimeout(() => navigate('/'), 3000)
        }
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchOrder()
    }
  }, [id, navigate])

  // Обработка параметров URL (редирект от Stripe)
  useEffect(() => {
    const paid = searchParams.get('paid')
    const canceled = searchParams.get('canceled')

    if (paid === 'true') {
      setPaymentMessage({
        type: 'success',
        text: 'Payment was successful! Your order has been paid.'
      })

      // Резервный механизм: обновить статус заказа через API
      const updateOrderStatus = async () => {
        try {
          console.log('🔄 REACT: Calling markPaid API for order:', id)
          const response = await ordersAPI.markPaid(id)
          console.log('✅ REACT: Order status updated via API:', response)
        } catch (error) {
          console.error('❌ REACT: Failed to update order status:', error)
          console.error('❌ REACT: Error details:', error.response?.data || error.message)
        }
      }

      updateOrderStatus()

      // Обновить локальный статус заказа
      if (order && !order.paid) {
        setOrder(prevOrder => ({ ...prevOrder, paid: true }))
      }

      // Очистить URL параметры
      navigate(`/orders/${id}`, { replace: true })
    } else if (canceled === 'true') {
      setPaymentMessage({
        type: 'warning',
        text: 'Payment was canceled. You can try again.'
      })
      // Очистить URL параметры
      navigate(`/orders/${id}`, { replace: true })
    }
  }, [searchParams, navigate, id, order])

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handlePayment = async () => {
    if (!order || order.paid) return

    setPaymentProcessing(true)
    try {
      const response = await paymentAPI.createCheckoutSession(order.id)
      // Перенаправление на Stripe Checkout
      window.location.href = response.data.url
    } catch (err) {
      console.error('Ошибка при создании платежной сессии:', err)
      alert('Ошибка при создании платежа. Попробуйте снова.')
    } finally {
      setPaymentProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="order-detail-loading">
        <p>Загрузка заказа...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="order-detail-error">
        <p>{error || 'Заказ не найден'}</p>
        <p>Перенаправление на главную страницу...</p>
      </div>
    )
  }

  return (
    <div className="order-detail-container">
      <div className="order-detail-content">
        <h1 className="order-detail-title">Order № {order.id}</h1>

        {paymentMessage && (
          <div className={`payment-message ${paymentMessage.type}`}>
            <p>{paymentMessage.text}</p>
          </div>
        )}

        <div className="order-info-section">
          <h2>Order Information</h2>
          <div className="order-info-row">
            <span className="order-info-label">Status:</span>
            <span className={`order-status ${order.paid ? 'paid' : 'unpaid'}`}>
              {order.paid ? 'Paid' : 'Unpaid'}
            </span>
          </div>
          <div className="order-info-row">
            <span className="order-info-label">Date:</span>
            <span>{formatDate(order.created)}</span>
          </div>
          <div className="order-info-row">
            <span className="order-info-label">Total Cost:</span>
            <span className="order-total-cost">$ {order.total_cost?.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        <div className="order-customer-section">
          <h2>Customer Information</h2>
          <div className="order-info-row">
            <span className="order-info-label">Name:</span>
            <span>{order.first_name} {order.last_name}</span>
          </div>
          <div className="order-info-row">
            <span className="order-info-label">Email:</span>
            <span>{order.email}</span>
          </div>
          <div className="order-info-row">
            <span className="order-info-label">Address:</span>
            <span>{order.address}, {order.city}, {order.postal_code}</span>
          </div>
        </div>

        <div className="order-items-section">
          <h2>Order Items</h2>
          <div className="orderss">
            {order.items && order.items.length > 0 ? (
              order.items.map((item) => {
                const product = item.product
                return (
                  <div key={item.id} className="orders-carts">
                    <div className="order-item-row">
                      <span className="dadad">Name: </span>
                      <Link to={`/shop/${product?.slug}`} className="order-item-link">
                        {product?.name || 'Product removed'}
                      </Link>
                    </div>
                    <div className="order-item-row">
                      <span className="dadad">Quantity: </span>
                      <span>{item.quantity}</span>
                    </div>
                    <div className="order-item-row">
                      <span className="dadad">Price: </span>
                      <span>$ {item.price?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="order-item-row">
                      <span className="dadad">Total: </span>
                      <span>$ {item.cost?.toFixed(2) || (item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <p>No items in this order</p>
            )}
          </div>
        </div>

        <div className="order-detail-actions">
          {!order.paid && (
            <button
              onClick={handlePayment}
              disabled={paymentProcessing}
              className="btn btn-success payment-btn"
            >
              {paymentProcessing ? 'Processing...' : 'Pay Now'}
            </button>
          )}
          <Link to="/orders" className="btn btn-secondary">Back to Orders</Link>
          <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailPage

