import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { cartAPI } from '../api'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total_price: '0.00', total_quantity: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Загрузить корзину
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await cartAPI.getCart()
      // Убеждаемся, что items всегда массив
      const cartData = response.data
      if (!cartData.items) {
        cartData.items = []
      }
      setCart(cartData)
    } catch (err) {
      console.error('Ошибка при загрузке корзины:', err)
      setError(err.message)
      // Если корзина пуста, устанавливаем пустые значения
      setCart({ items: [], total_price: '0.00', total_quantity: 0 })
    } finally {
      setLoading(false)
    }
  }, [])

  // Добавить товар в корзину
  const addItem = useCallback(async (productId, quantity = 1, overrideQuantity = false) => {
    try {
      setLoading(true)
      setError(null)
      const response = await cartAPI.addItem(productId, quantity, overrideQuantity)
      const cartData = response.data
      if (!cartData.items) {
        cartData.items = []
      }
      setCart(cartData)
      return { success: true }
    } catch (err) {
      console.error('Ошибка при добавлении товара в корзину:', err)
      setError(err.response?.data?.error || err.message)
      return { success: false, error: err.response?.data?.error || err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Обновить количество товара
  const updateQuantity = useCallback(async (productId, quantity) => {
    try {
      setLoading(true)
      setError(null)
      const response = await cartAPI.updateQuantity(productId, quantity)
      const cartData = response.data
      if (!cartData.items) {
        cartData.items = []
      }
      setCart(cartData)
      return { success: true }
    } catch (err) {
      console.error('Ошибка при обновлении количества:', err)
      setError(err.response?.data?.error || err.message)
      return { success: false, error: err.response?.data?.error || err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Удалить товар из корзины
  const removeItem = useCallback(async (productId) => {
    try {
      setLoading(true)
      setError(null)
      const response = await cartAPI.removeItem(productId)
      const cartData = response.data
      if (!cartData.items) {
        cartData.items = []
      }
      setCart(cartData)
      return { success: true }
    } catch (err) {
      console.error('Ошибка при удалении товара из корзины:', err)
      setError(err.response?.data?.error || err.message)
      return { success: false, error: err.response?.data?.error || err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Получить количество товаров в корзине
  const getQuantity = useCallback(async () => {
    try {
      const response = await cartAPI.getQuantity()
      return response.data.quantity
    } catch (err) {
      console.error('Ошибка при получении количества товаров:', err)
      return 0
    }
  }, [])

  // Загрузить корзину при монтировании
  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const value = {
    cart,
    loading,
    error,
    fetchCart,
    addItem,
    updateQuantity,
    removeItem,
    getQuantity,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

