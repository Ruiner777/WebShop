import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    // Показываем загрузку, пока проверяем аутентификацию
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        marginTop: '80px'
      }}>
        <p>Загрузка...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Перенаправляем на страницу входа с сохранением URL для редиректа обратно
    return <Navigate to="/user/login" state={{ from: location }} replace />
  }

  return children
}

export default PrivateRoute

