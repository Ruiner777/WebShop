import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';


function Header() {
  const { cart, clearCart } = useCart();
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const userDropdownRef = useRef(null);

  // Обработчик выхода из системы
  const handleLogout = async () => {
    try {
      await logout();
      clearCart();
      navigate('/');
      setShowUserDropdown(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Закрытие дропдауна пользователя при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="main-header">
      <div className="top-header">
        {/* Левая секция: кнопка Shop */}
        <div className="header-left">
          <Link to="/shop" className="nav-shop-link">All Products</Link>
        </div>

        {/* Центральная секция: Логотип */}
        <div className="header-logo-center">
          <Link to="/">
            <img 
              src="http://localhost:8000/static/img/logo2_1.png" 
              alt="Logo" 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </Link>
        </div>

        {/* Правая секция: Корзина и меню пользователя */}
        <div className="header-right">
          <Link to="/cart" className="cart-icon-wrapper">
            <i className="fas fa-shopping-cart"></i>
            {cart?.total_quantity > 0 && (
              <span className="cart-badge">{cart.total_quantity}</span>
            )}
          </Link>

          <div className="user-dropdown-wrapper" ref={userDropdownRef}>
            <i 
              className="fas fa-user-circle user-icon" 
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            ></i>
            {showUserDropdown && (
              <ul className="user-dropdown-menu">
                {!loading && user ? (
                  <>
                    <li><Link to="/user/profile" onClick={() => setShowUserDropdown(false)}>Profile</Link></li>
                    <li><Link to="/orders" onClick={() => setShowUserDropdown(false)}>Orders</Link></li>
                    <li><button onClick={handleLogout}>Logout</button></li>
                  </>
                ) : (
                  <>
                    <li><Link to="/user/login" onClick={() => setShowUserDropdown(false)}>Login</Link></li>
                    <li><Link to="/user/registration" onClick={() => setShowUserDropdown(false)}>Register</Link></li>
                  </>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
