import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ordersAPI } from '../api'
import './OrdersPage.css'

function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await ordersAPI.getAll()
        setOrders(response.data)
      } catch (err) {
        console.error('Ошибка при загрузке заказов:', err)
        if (err.response?.status === 401) {
          setError('Необходима авторизация для просмотра заказов')
        } else {
          setError(err.response?.data?.detail || 'Ошибка при загрузке заказов')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

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

  if (loading) {
    return (
      <div className="orders-loading">
        <p>Загрузка заказов...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="orders-error">
        <p>{error}</p>
        <Link to="/" className="btn btn-primary">Вернуться на главную</Link>
      </div>
    )
  }

  return (
    <div className="orders-container">
      <div className="orders-content">
        <h1 className="orders-title">Your Orders</h1>
        
        {orders && orders.length > 0 ? (
          <div className="orderss">
            {orders.map((order) => (
              <div key={order.id} className="order-cart">
                <div className="order-header">
                  <h5 className="order-title">Order № {order.id}</h5>
                  <div className="order-meta">
                    <span className={`order-status ${order.paid ? 'paid' : 'unpaid'}`}>
                      {order.paid ? 'Paid' : 'Unpaid'}
                    </span>
                    <span className="order-date">{formatDate(order.created)}</span>
                    <span className="order-total">Total: $ {order.total_cost?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
                <div className="order-desc">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item) => {
                      const product = item.product
                      return (
                        <div key={item.id} className="orders-carts">
                          <div className="order-item-info">
                            <span className="dadad">Name: </span>
                            <Link to={`/shop/${product?.slug}`} className="order-item-link">
                              {product?.name || 'Product removed'}
                            </Link>
                          </div>
                          <div className="order-item-info">
                            <span className="dadad">Quantity: </span>
                            <span>{item.quantity}</span>
                          </div>
                          <div className="order-item-info">
                            <span className="dadad">Price: </span>
                            <span>$ {item.price?.toFixed(2) || '0.00'}</span>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p>No items in this order</p>
                  )}
                </div>
                <div className="order-actions">
                  <Link to={`/orders/${order.id}`} className="btn btn-primary">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="orders-empty">
            <h4 className="notorders">You haven't ordered anything yet.</h4>
            <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrdersPage

