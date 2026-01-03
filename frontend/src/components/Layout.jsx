import { Outlet } from 'react-router-dom'
import Header from './Header' // Импортируем новый Header компонент
import Footer from './Footer' // Импортируем Footer компонент
import './Layout.css'

function Layout() {

  return (
    <div className="layout">
      <Header />
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
      <Footer />
    </div>
  )
}

export default Layout
