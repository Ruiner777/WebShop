import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { productsAPI, categoriesAPI } from '../api'
import './ProductsPage.css'

function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    totalPages: 1
  })
  // Получаем параметры из URL
  const categorySlug = searchParams.get('category')
  const page = parseInt(searchParams.get('page') || '1')
  const search = searchParams.get('search') || ''
  const [searchQuery, setSearchQuery] = useState(search)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Загружаем категории
        const categoriesResponse = await categoriesAPI.getAll()
        const categoriesData = categoriesResponse.data.results || categoriesResponse.data
        setCategories(categoriesData)

        // Находим выбранную категорию
        let currentCategory = null
        if (categorySlug) {
          currentCategory = categoriesData.find(c => c.slug === categorySlug) || null
        }
        setSelectedCategory(currentCategory)

        // Подготавливаем параметры для запроса продуктов
        const params = {
          page: page,
          available: 'true'
        }

        // Добавляем поиск
        if (search) {
          params.search = search
        }

        // Загружаем продукты
        const productsResponse = await productsAPI.getAll(params)
        let productsData = productsResponse.data.results || productsResponse.data
        
        // Фильтруем по категории на клиенте, если нужно
        // (API не поддерживает фильтрацию по category напрямую через query params)
        if (categorySlug && currentCategory) {
          productsData = productsData.filter(p => p.category?.slug === categorySlug)
        }

        setProducts(productsData)

        // Обрабатываем пагинацию
        if (productsResponse.data.count !== undefined) {
          setPagination({
            count: productsResponse.data.count,
            next: productsResponse.data.next,
            previous: productsResponse.data.previous,
            currentPage: page,
            totalPages: Math.ceil(productsResponse.data.count / 20) // PAGE_SIZE из settings
          })
        }
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err)
        setError('Не удалось загрузить продукты')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    // Синхронизируем searchQuery с параметром search из URL
    setSearchQuery(search)
  }, [categorySlug, page, search])

  const handleCategoryClick = (slug) => {
    const newParams = new URLSearchParams()
    if (slug) {
      newParams.set('category', slug)
    }
    newParams.set('page', '1') // Сбрасываем на первую страницу
    if (search) {
      newParams.set('search', search)
    }
    setSearchParams(newParams)
  }

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('page', newPage.toString())
    setSearchParams(newParams)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const newParams = new URLSearchParams(searchParams)
    if (searchQuery) {
      newParams.set('search', searchQuery)
    } else {
      newParams.delete('search')
    }
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  const getImageUrl = (product) => {
    if (product.image) {
      if (product.image.startsWith('http')) {
        return product.image
      }
      return `http://localhost:8000/media/${product.image}`
    }
    return 'http://localhost:8000/static/img/noimage.jpg'
  }

  // Генерируем номера страниц для пагинации
  const getPageNumbers = () => {
    const pages = []
    const startPage = Math.max(1, pagination.currentPage - 2)
    const endPage = Math.min(pagination.totalPages, pagination.currentPage + 2)
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    return pages
  }

  if (loading) {
    return (
      <div className="products-loading">
        <p>Загрузка продуктов...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="products-error">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="llist d-flex">
      <div className="sidebar">
        <h3>Categories</h3>
        <ul>
          <li className={!selectedCategory ? 'selected' : ''}>
            <Link to="/shop" onClick={() => handleCategoryClick(null)}>All</Link>
          </li>
          {categories.map((category) => (
            <li 
              key={category.id} 
              className={selectedCategory?.slug === category.slug ? 'selected' : ''}
            >
              <Link 
                to={`/shop?category=${category.slug}`}
                onClick={() => handleCategoryClick(category.slug)}
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="main">
        <div className="main-title">
          {selectedCategory ? selectedCategory.name : 'Products'}
        </div>
        
        {/* Поиск */}
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">Search</button>
        </form>

        <div className="product-list">
          <div className="items">
            {products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className="item">
                  <Link 
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
                </div>
              ))
            ) : (
              <div className="no-products">
                <p>No products found</p>
              </div>
            )}
          </div>
        </div>

        {/* Пагинация */}
        {pagination.totalPages > 1 && (
          <ul className="pagination">
            <li className={!pagination.previous ? 'disabled' : ''}>
              <button
                onClick={() => pagination.previous && handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.previous}
                className="pagination-btn"
              >
                Previous
              </button>
            </li>
            {getPageNumbers().map((pageNum) => (
              <li key={pageNum}>
                <button
                  onClick={() => handlePageChange(pageNum)}
                  className={`pagination-btn ${pagination.currentPage === pageNum ? 'active' : ''}`}
                >
                  {pageNum}
                </button>
              </li>
            ))}
            <li className={!pagination.next ? 'disabled' : ''}>
              <button
                onClick={() => pagination.next && handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.next}
                className="pagination-btn"
              >
                Next
              </button>
            </li>
          </ul>
        )}
      </div>
    </div>
  )
}

export default ProductsPage

