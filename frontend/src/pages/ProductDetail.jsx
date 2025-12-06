import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { productsAPI } from '../api'
import './ProductDetail.css'

function ProductDetail() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await productsAPI.getBySlug(slug)
        setProduct(response.data)
      } catch (err) {
        console.error('Ошибка при загрузке продукта:', err)
        if (err.response?.status === 404) {
          setError('Product not found')
        } else {
          setError('Не удалось загрузить продукт')
        }
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchProduct()
    }
  }, [slug])

  const getImageUrl = () => {
    if (product?.image) {
      if (product.image.startsWith('http')) {
        return product.image
      }
      return `http://localhost:8000/media/${product.image}`
    }
    return 'http://localhost:8000/static/img/noimage.jpg'
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    // TODO: Реализовать добавление в корзину через API
    // Пока заглушка - сохраняем логику Django
    console.log('Add to cart:', {
      productId: product.id,
      quantity: quantity
    })
    alert(`Added ${quantity} item(s) to cart! (This is a placeholder)`)
  }

  if (loading) {
    return (
      <div className="product-detail-loading">
        <p>Загрузка продукта...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="product-detail-error">
        <p>{error}</p>
        <Link to="/shop" className="back-link">← Back to Shop</Link>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="product-detail-error">
        <p>Product not found</p>
        <Link to="/shop" className="back-link">← Back to Shop</Link>
      </div>
    )
  }

  return (
    <div className="detail-product d-flex">
      <div className="detail-img">
        <img 
          src={getImageUrl()} 
          alt={product.name} 
          className="detail-image"
          onError={(e) => {
            e.target.src = 'http://localhost:8000/static/img/noimage.jpg'
          }}
        />
      </div>
      <div className="detail-description">
        <h2>{product.name}</h2>
        <h3>Category: {product.category ? product.category.name : 'N/A'}</h3>
        <p>
          <strong>Description:</strong> {product.description ? (
            <span dangerouslySetInnerHTML={{ 
              __html: product.description.replace(/\n/g, '<br />') 
            }} />
          ) : (
            'No description available'
          )}
        </p>
        {product.discount > 0 ? (
          <div className="cart-discount d-flex gap-2">
            <p className="line">$ {product.price}</p>
            <p>$ {product.sell_price}</p>
          </div>
        ) : (
          <p className="price">$ {product.price}</p>
        )}
        <form onSubmit={handleAddToCart} className="qform">
          <div className="cart-form">
            <label htmlFor="quantity" className="quantity-label">
              Quantity:
            </label>
            <select
              id="quantity"
              name="quantity"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="quantity-select"
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
          <input 
            type="submit" 
            className="add-to-cart-btn" 
            value="Add to cart"
          />
        </form>
        <div className="product-info">
          <p><strong>Available:</strong> {product.available ? 'Yes' : 'No'}</p>
          {product.discount > 0 && (
            <p><strong>Discount:</strong> {product.discount}%</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetail

