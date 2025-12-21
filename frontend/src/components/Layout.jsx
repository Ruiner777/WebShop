import { Outlet, Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import './Layout.css'

function Layout() {
  const { cart } = useCart()
  const { user, loading, logout } = useAuth()
  
  const handleLogout = async () => {
    await logout()
  }

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
              {!loading && user && (
                <li>
                  <Link to="/orders" className="nav-a m-3">Orders</Link>
                </li>
              )}
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
                  <>
                    <Link to="/user/profile" className="m-2">PROFILE</Link>
                    <button 
                      onClick={handleLogout} 
                      className="m-2 logout-btn"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                        color: 'inherit',
                        textDecoration: 'none',
                        padding: 0,
                        margin: '0 8px'
                      }}
                    >
                      LOGOUT
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/user/login" className="m-2">LOGIN</Link>
                    <Link to="/user/registration" className="m-2">REGISTER</Link>
                  </>
                )}
                <p className="cart-quantity">
                  {cart.total_quantity > 0 ? cart.total_quantity : 0}
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

