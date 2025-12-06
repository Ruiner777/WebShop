import React from 'react'
import './OrderCreated.css'

function OrderCreated() {
  return (
    <div className="order-created-container">
      <div className="order-created-content">
        <h1>Your order was created</h1>
        <p className="order-message">
          Thank you! Your order has been successfully created and is being processed.
        </p>
        <div className="order-actions">
          <a href="/" className="btn btn-primary">Return to Home</a>
          <a href="/shop" className="btn btn-secondary">Continue Shopping</a>
        </div>
      </div>
    </div>
  )
}

export default OrderCreated

