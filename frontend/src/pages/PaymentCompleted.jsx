import React from 'react'
import './PaymentCompleted.css'

function PaymentCompleted() {
  return (
    <div className="payment-completed-container">
      <div className="payment-completed-content">
        <h1>Payment was successful</h1>
        <p className="payment-message">
          Thank you for your purchase! Your order has been processed successfully.
        </p>
        <div className="payment-actions">
          <a href="/" className="btn btn-primary">Return to Home</a>
          <a href="/shop" className="btn btn-secondary">Continue Shopping</a>
        </div>
      </div>
    </div>
  )
}

export default PaymentCompleted

