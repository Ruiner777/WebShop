import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './LoginPage.css'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Получаем redirect URL из location state или query параметра
  const from = location.state?.from?.pathname || location.search?.replace('?next=', '') || '/'

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Очищаем ошибку при изменении поля
    if (error) setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const result = await login(formData.username, formData.password)
      if (result.success) {
        // Перенаправляем на страницу, откуда пришел пользователь, или на главную
        navigate(from, { replace: true })
      } else {
        setError(result.error || 'Ошибка входа')
      }
    } catch (err) {
      setError('Ошибка при входе. Пожалуйста, попробуйте снова.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="login d-flex">
      <div className="login-title">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="login-error">
              <p>{error}</p>
            </div>
          )}
          <div className="mb-3">
            <label htmlFor="id_username" className="form-label font-style">Username</label>
            <input
              type="text"
              className="form-control form-style"
              value={formData.username}
              name="username"
              id="id_username"
              placeholder="Input username"
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="id_password" className="form-label font-style">Password</label>
            <input
              type="password"
              className="form-control form-style"
              name="password"
              id="id_password"
              placeholder="Your password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>
          <button 
            type="submit" 
            className="login-btn form-style"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Вход...' : 'Login'}
          </button>
        </form>
        <div className="reset-pass">
          <hr />
          <div className="mt-3">
            <a href="#">Reset Password</a> | <Link to="/user/registration">Create Account</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LoginPage

