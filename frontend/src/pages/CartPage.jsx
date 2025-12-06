import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import './CartPage.css'

function CartPage() {
  const { cart, loading, error, updateQuantity, removeItem } = useCart()
  const [updatingItems, setUpdatingItems] = useState(new Set())

  const getImageUrl = (product) => {
    if (product?.image) {
      if (product.image.startsWith('http')) {
        return product.image
      }
      return `http://localhost:8000/media/${product.image}`
    }
    return 'http://localhost:8000/static/img/noimage.jpg'
  }

  const handleQuantityChange = async (productId, newQuantity) => {
    setUpdatingItems(prev => new Set(prev).add(productId))
    await updateQuantity(productId, newQuantity)
    setUpdatingItems(prev => {
      const next = new Set(prev)
      next.delete(productId)
      return next
    })
  }

  const handleRemove = async (productId) => {
    setUpdatingItems(prev => new Set(prev).add(productId))
    await removeItem(productId)
    setUpdatingItems(prev => {
      const next = new Set(prev)
      next.delete(productId)
      return next
    })
  }

  if (loading && (!cart.items || cart.items.length === 0)) {
    return (
      <div className="cart-loading">
        <p>Загрузка корзины...</p>
      </div>
    )
  }

  if (error && (!cart.items || cart.items.length === 0)) {
    return (
      <div className="cart-error">
        <p>Ошибка при загрузке корзины: {error}</p>
        <Link to="/shop" className="cart-btn">Continue Shopping</Link>
      </div>
    )
  }

  return (
    <section className="cart d-flex">
      <div className="cart-title">
        <h2>Shopping Cart</h2>
      </div>
      <div className="cart-cards">
        {(!cart.items || cart.items.length === 0) ? (
          <div className="cart-empty">
            <p>Your cart is empty</p>
            <Link to="/shop" className="cart-btn">Continue Shopping</Link>
          </div>
        ) : (
          cart.items.map((item) => {
            const product = item.product
            const isUpdating = updatingItems.has(product.id)
            
            return (
              <div key={product.id} className="cart-card d-flex">
                <div className="cart-card-img">
                  <img 
                    src={getImageUrl(product)} 
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = 'http://localhost:8000/static/img/noimage.jpg'
                    }}
                  />
                </div>
                <div className="cart-card-info">
                  <div className="cart-card-name">
                    <p>{product.name}</p>
                  </div>
                  <div className="cart-card-q">
                    <p>Quantity: </p>
                    <select
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value))}
                      disabled={isUpdating}
                      className="quantity-select"
                    >
                      {[...Array(10)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(product.id)}
                  disabled={isUpdating}
                  className="remove-btn"
                >
                  {isUpdating ? '...' : 'Remove'}
                </button>
                <div className="cart-card-price">
                  {product.discount > 0 ? (
                    <div className="cart-discount d-flex gap-2">
                      <p className="line">$ {product.price}</p>
                      <p>$ {product.sell_price}</p>
                    </div>
                  ) : (
                    <p className="price">$ {product.price}</p>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
      {cart.items && cart.items.length > 0 && (
        <>
          <div className="total">
            <h5>Total sum: $ {cart.total_price}</h5>
          </div>
          <div className="cart-buttons d-flex gap-3">
            <Link to="/shop" className="cart-btn">Continue Shopping</Link>
            <Link to="/orders/create" className="cart-btn">Checkout</Link>
          </div>
        </>
      )}
    </section>
  )
}

export default CartPage

