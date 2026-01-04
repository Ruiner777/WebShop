import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productsAPI } from '../api'
import './HomePage.css'

function HomePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Получаем доступные продукты (первые 3)
        const response = await productsAPI.getAvailable()
        const availableProducts = response.data.results || response.data
        
        // Берем первые 3 продукта
        setProducts(availableProducts.slice(0, 3))
      } catch (err) {
        console.error('Ошибка при загрузке продуктов:', err)
        setError('Не удалось загрузить продукты')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const getImageUrl = (product) => {
    if (product.image) {
      // Если изображение начинается с http, возвращаем как есть
      if (product.image.startsWith('http')) {
        return product.image
      }
      // Иначе добавляем базовый URL Django media
      return `http://localhost:8000/media/${product.image}`
    }
    return 'http://localhost:8000/static/img/noimage.jpg'
  }

  if (loading) {
    return (
      <div className="home-loading">
        <p>Загрузка...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="home-error">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <section className="home d-flex flex-column">
      <div className="home-title d-flex flex-column align-items-center">
        <h1 className="home-welcome">Welcome to WebShop</h1>
        <p className="home-description">Discover unique accessories and fashion items for every style</p>
        <Link to="/shop" className="home-btn mt-4">ALL PRODUCTS</Link>
      </div>
      <div className="home-recomendation">
        <div className="rec-title mb-4">
          <h3><span>Popular Accessoires</span></h3>
        </div>
      </div>
      <div className="home-cards d-flex gap-4">
        {products.map((product) => (
          <Link 
            key={product.id} 
            to={`/shop/${product.slug}`} 
            className="home-card d-flex flex-column align-items-center text-center"
          >
            <img 
              src={getImageUrl(product)} 
              className="card-img" 
              alt={product.name}
              onError={(e) => {
                e.target.src = 'http://localhost:8000/static/img/noimage.jpg'
              }}
            />
            <h5 className="title-card">{product.name}</h5>
            {product.discount > 0 ? (
              <div className="cart-discount d-flex gap-2">
                <p className="line">$ {product.price}</p>
                <p>$ {product.sell_price}</p>
              </div>
            ) : (
              <p className="price">$ {product.price}</p>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}

export default HomePage

