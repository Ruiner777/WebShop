import { useState, useEffect } from 'react'
import { productsAPI, categoriesAPI } from '../api'
import './Home.css'

function Home() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Проверка связи с бэкендом
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Загружаем категории и продукты параллельно
        const [categoriesResponse, productsResponse] = await Promise.all([
          categoriesAPI.getAll(),
          productsAPI.getAll()
        ])

        setCategories(categoriesResponse.data.results || categoriesResponse.data)
        setProducts(productsResponse.data.results || productsResponse.data)
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err)
        setError(
          err.response?.data?.detail || 
          err.message || 
          'Не удалось подключиться к серверу. Убедитесь, что бэкенд запущен на localhost:8000'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading">Загрузка данных...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="error">
          <h2>Ошибка подключения</h2>
          <p>{error}</p>
          <p className="error-hint">
            Убедитесь, что Django сервер запущен: <code>cd shop && python manage.py runserver</code>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <header>
        <h1>WebShop - React Frontend</h1>
        <p className="subtitle">Связь с Django REST Framework API установлена! ✅</p>
      </header>

      <main>
        <section className="categories-section">
          <h2>Категории ({categories.length})</h2>
          <div className="categories-grid">
            {categories.length > 0 ? (
              categories.map((category) => (
                <div key={category.id} className="category-card">
                  <h3>{category.name}</h3>
                  <p>Slug: {category.slug}</p>
                </div>
              ))
            ) : (
              <p>Категории не найдены</p>
            )}
          </div>
        </section>

        <section className="products-section">
          <h2>Продукты ({products.length})</h2>
          <div className="products-grid">
            {products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className="product-card">
                  <h3>{product.name}</h3>
                  <p className="product-price">
                    {product.discount > 0 ? (
                      <>
                        <span className="old-price">{product.price} ₽</span>
                        <span className="new-price">{product.sell_price} ₽</span>
                        <span className="discount">-{product.discount}%</span>
                      </>
                    ) : (
                      <span>{product.price} ₽</span>
                    )}
                  </p>
                  <p className="product-category">Категория: {product.category?.name || 'N/A'}</p>
                  <p className="product-status">
                    {product.available ? '✅ В наличии' : '❌ Нет в наличии'}
                  </p>
                  {product.description && (
                    <p className="product-description">{product.description.substring(0, 100)}...</p>
                  )}
                </div>
              ))
            ) : (
              <p>Продукты не найдены</p>
            )}
          </div>
        </section>
      </main>

      <footer>
        <p>API Endpoint: <code>/api/v1/</code></p>
        <p>Backend: <code>http://localhost:8000</code></p>
        <p>Frontend: <code>http://localhost:3000</code></p>
      </footer>
    </div>
  )
}

export default Home

