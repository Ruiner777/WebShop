import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Проверка текущего пользователя при загрузке
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await authAPI.getProfile()
      setUser(response.data)
    } catch (err) {
      // Если пользователь не авторизован, это нормально
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Регистрация
  const register = useCallback(async (userData) => {
    try {
      setLoading(true)
      setError(null)
      const response = await authAPI.register(userData)
      setUser(response.data)
      return { success: true, user: response.data }
    } catch (err) {
      // Обрабатываем ошибки валидации от DRF
      let errorMessage
      if (err.response?.data) {
        // Если это объект с ошибками полей (например, {password2: ["This field is required."]})
        if (typeof err.response.data === 'object' && !err.response.data.error) {
          errorMessage = err.response.data
        } else {
          errorMessage = err.response.data.error || Object.values(err.response.data).flat().join(', ')
        }
      } else {
        errorMessage = err.message
      }
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  // Вход
  const login = useCallback(async (username, password) => {
    try {
      setLoading(true)
      setError(null)
      const response = await authAPI.login({ username, password })
      setUser(response.data)
      return { success: true, user: response.data }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
        (err.response?.data ? Object.values(err.response.data).flat().join(', ') : 'Invalid credentials')
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  // Выход
  const logout = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      await authAPI.logout()
      setUser(null)
      return { success: true }
    } catch (err) {
      // Даже если запрос не удался, очищаем локальное состояние
      setUser(null)
      const errorMessage = err.response?.data?.error || err.message
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  // Обновление профиля
  const updateProfile = useCallback(async (userData) => {
    try {
      setLoading(true)
      setError(null)
      const response = await authAPI.updateProfile(userData)
      setUser(response.data)
      return { success: true, user: response.data }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
        (err.response?.data ? Object.values(err.response.data).flat().join(', ') : err.message)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  // Смена пароля
  const changePassword = useCallback(async (passwordData) => {
    try {
      setLoading(true)
      setError(null)
      await authAPI.changePassword(passwordData)
      return { success: true }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
        (err.response?.data ? Object.values(err.response.data).flat().join(', ') : err.message)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  // Проверяем аутентификацию при монтировании
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

