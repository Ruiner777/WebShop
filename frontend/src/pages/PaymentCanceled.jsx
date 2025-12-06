import React from 'react'
import './PaymentCanceled.css'

function PaymentCanceled() {
  return (
    <div className="payment-canceled-container">
      <div className="payment-canceled-content">
        <h1>Payment was canceled</h1>
        <p className="payment-message">
          Your payment was canceled. No charges were made to your account.
        </p>
        <div className="payment-actions">
          <a href="/" className="btn btn-primary">Return to Home</a>
          <a href="/shop" className="btn btn-secondary">Continue Shopping</a>
        </div>
      </div>
    </div>
  )
}

export default PaymentCanceled

