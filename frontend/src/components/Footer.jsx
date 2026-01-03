import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-content container">
        <div className="footer-column about-shop">
          <div className="footer-logo">
            <img 
              src="http://localhost:8000/static/img/logo2_1.png" 
              alt="ShopName Logo" 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <p>Ваш любимый интернет-магазин с широким ассортиментом товаров высокого качества.</p>
        </div>

        <div className="footer-column customer-service">
          <h3>Customer Service</h3>
          <ul>
            <li><Link to="#">Shipping</Link></li>
            <li><Link to="#">Returns</Link></li>
            <li><Link to="#">Privacy Policy</Link></li>
            <li><Link to="#">FAQ</Link></li>
          </ul>
        </div>

        <div className="footer-column quick-links">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shop">Shop</Link></li>
            <li><Link to="/shop?category=all">Categories</Link></li> {/* Пример ссылки на все категории */}
            <li><Link to="#">New Arrivals</Link></li>
          </ul>
        </div>

        <div className="footer-column contact-info">
          <h3>Contact</h3>
          <p>Адрес: ул. Примерная, 123, Город</p>
          <p>Телефон: +1 234 567 890</p>
          <p>Email: info@shopname.com</p>
          <div className="social-icons">
            <a href="#" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>
            <a href="#" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
            <a href="#" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></a>
            <a href="#" target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube"></i></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} ShopName. All rights reserved.</p>
          <div className="bottom-links">
            <Link to="#">Terms</Link>
            <Link to="#">Privacy</Link>
            <Link to="#">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

