import { Outlet, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { usersAPI } from '../api'
import './Layout.css'

function Layout() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cartQuantity, setCartQuantity] = useState(0)

  useEffect(() => {
    // Проверяем, есть ли токен аутентификации
    const token = localStorage.getItem('authToken')
    if (token) {
      // Загружаем информацию о пользователе
      usersAPI.getMe()
        .then(response => {
          setUser(response.data)
        })
        .catch(() => {
          // Если токен недействителен, удаляем его
          localStorage.removeItem('authToken')
          setUser(null)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }

    // TODO: Загрузить количество товаров в корзине через API
    // Пока используем значение по умолчанию
    setCartQuantity(0)
  }, [])

  return (
    <div className="layout">
      <header className="header sticky-top">
        <div className="header-container d-flex">
          <nav className="header-nav pt-4">
            <ul className="header-list d-flex">
              <li>
                <Link to="/" className="nav-a m-3">Home</Link>
              </li>
              <li>
                <Link to="/shop" className="nav-a m-3">Shop</Link>
              </li>
            </ul>
          </nav>
          <div className="header-logo">
            <Link to="/">
              <img 
                src="http://localhost:8000/static/img/logo2_1.png" 
                alt="Logo" 
                className="logo"
                onError={(e) => {
                  // Fallback если изображение не найдено
                  e.target.style.display = 'none'
                }}
              />
            </Link>
          </div>
          <div className="header-profile pt-2">
            <Link to="/cart">
              <img 
                src="http://localhost:8000/static/img/grob.png" 
                className="grob" 
                alt="Cart"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </Link>
            {!loading && (
              <>
                {user ? (
                  <Link to="/user/profile" className="m-2">PROFILE</Link>
                ) : (
                  <Link to="/user/login" className="m-2">LOGIN</Link>
                )}
                <p className="cart-quantity">
                  {cartQuantity > 0 ? cartQuantity : 0}
                </p>
              </>
            )}
          </div>
        </div>
      </header>
      <div className="container">
        <Outlet />
      </div>
      <img 
        src="http://localhost:8000/static/img/mblshka_sleva4_2.png" 
        className="frame3" 
        alt=""
        onError={(e) => {
          e.target.style.display = 'none'
        }}
      />
      <img 
        src="http://localhost:8000/static/img/mblshka_sprava3_2.png" 
        className="frame4" 
        alt=""
        onError={(e) => {
          e.target.style.display = 'none'
        }}
      />
    </div>
  )
}

export default Layout

