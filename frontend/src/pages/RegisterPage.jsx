import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './RegisterPage.css'

function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    password2: '',
  })
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Очищаем ошибки при изменении поля
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
    if (error) setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setIsSubmitting(true)

    // Валидация на клиенте
    if (formData.password !== formData.password2) {
      setFieldErrors({ password2: 'Passwords do not match' })
      setIsSubmitting(false)
      return
    }

    if (formData.password.length < 8) {
      setFieldErrors({ password: 'Password must be at least 8 characters' })
      setIsSubmitting(false)
      return
    }

    try {
      // Отправляем все данные включая password2 - сериализатор использует его для валидации
      const result = await register(formData)
      if (result.success) {
        // Перенаправляем на главную страницу после успешной регистрации
        navigate('/', { replace: true })
      } else {
        // Обрабатываем ошибки от сервера
        if (result.error) {
          if (typeof result.error === 'object') {
            setFieldErrors(result.error)
          } else {
            setError(result.error)
          }
        }
      }
    } catch (err) {
      setError('Ошибка при регистрации. Пожалуйста, попробуйте снова.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="login-reg d-flex">
      <div className="login-title">
        <h2>Registration</h2>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="register-error">
              <p>{error}</p>
            </div>
          )}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="id_first_name" className="form-label form-stylereg">First Name</label>
              <input
                type="text"
                className="form-control form-stylereg"
                id="id_first_name"
                name="first_name"
                placeholder="Your First Name"
                value={formData.first_name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              {fieldErrors.first_name && (
                <div className="field-error">{fieldErrors.first_name}</div>
              )}
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="id_last_name" className="form-label form-stylereg">Last Name</label>
              <input
                type="text"
                className="form-control form-stylereg"
                id="id_last_name"
                name="last_name"
                placeholder="Your Last Name"
                value={formData.last_name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              {fieldErrors.last_name && (
                <div className="field-error">{fieldErrors.last_name}</div>
              )}
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="id_username" className="form-label form-stylereg">Username</label>
              <input
                type="text"
                className="form-control form-stylereg"
                id="id_username"
                name="username"
                placeholder="Your Username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              {fieldErrors.username && (
                <div className="field-error">{fieldErrors.username}</div>
              )}
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="id_email" className="form-label form-stylereg">Email</label>
              <input
                type="email"
                className="form-control form-stylereg"
                id="id_email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              {fieldErrors.email && (
                <div className="field-error">{fieldErrors.email}</div>
              )}
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="id_password1" className="form-label form-stylereg">Password</label>
              <input
                type="password"
                className="form-control form-stylereg"
                id="id_password1"
                name="password"
                placeholder="Your Password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              {fieldErrors.password && (
                <div className="field-error">{fieldErrors.password}</div>
              )}
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="id_password2" className="form-label form-stylereg">Confirm Password</label>
              <input
                type="password"
                className="form-control form-stylereg"
                id="id_password2"
                name="password2"
                placeholder="Your Password"
                value={formData.password2}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              {fieldErrors.password2 && (
                <div className="field-error">{fieldErrors.password2}</div>
              )}
            </div>
          </div>
          <button 
            type="submit" 
            className="login-btn form-style"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Регистрация...' : 'Register'}
          </button>
        </form>
        <div className="reset-pass">
          <hr />
          <div className="mt-3">
            <Link to="/user/login">Already have an account? Login</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default RegisterPage

