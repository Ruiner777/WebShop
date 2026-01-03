import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ordersAPI } from '../api'
import './ProfilePage.css'

function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Форма профиля
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    image: null,
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileError, setProfileError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  
  // Форма смены пароля
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    new_password2: '',
  })
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordError, setPasswordError] = useState(null)
  const [passwordSuccess, setPasswordSuccess] = useState(null)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Загружаем заказы
  useEffect(() => {
    console.log('Fetching orders...');
    const fetchOrders = async () => {
      try {
        setOrdersLoading(true)
        const response = await ordersAPI.getAll()
        console.log('Orders API response:', response.data);
      console.log('Orders count:', response.data.results.length);
      setOrders(response.data.results)
      } catch (err) {
        console.error('Ошибка при загрузке заказов:', err)
        console.error('Failed to fetch orders:', err.response || err);
      } finally {
        setOrdersLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Заполняем форму при загрузке пользователя
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: user.username || '',
        email: user.email || '',
        image: null,
      })
      if (user.image) {
        if (user.image.startsWith('http')) {
          setImagePreview(user.image)
        } else {
          setImagePreview(`http://localhost:8000/media/${user.image}`)
        }
      } else {
        setImagePreview('http://localhost:8000/static/img/noimage.jpg')
      }
      setLoading(false)
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (profileError) setProfileError(null)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }))
      // Показываем превью нового изображения
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileError(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('first_name', formData.first_name)
      formDataToSend.append('last_name', formData.last_name)
      formDataToSend.append('email', formData.email)
      if (formData.image) {
        formDataToSend.append('image', formData.image)
      }

      const result = await updateProfile(formDataToSend)
      if (result.success) {
        setSuccessMessage('Профиль успешно обновлен')
        // Обновляем preview изображения если оно было изменено
        if (result.user?.image) {
          if (result.user.image.startsWith('http')) {
            setImagePreview(result.user.image)
          } else {
            setImagePreview(`http://localhost:8000/media/${result.user.image}`)
          }
        }
      } else {
        setProfileError(result.error || 'Ошибка при обновлении профиля')
      }
    } catch (err) {
      setProfileError('Ошибка при обновлении профиля. Пожалуйста, попробуйте снова.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
    if (passwordError) setPasswordError(null)
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)
    
    if (passwordData.new_password !== passwordData.new_password2) {
      setPasswordError('Пароли не совпадают')
      return
    }

    setIsChangingPassword(true)

    try {
      const result = await changePassword(passwordData)
      if (result.success) {
        setPasswordSuccess('Пароль успешно изменен')
        setPasswordData({
          old_password: '',
          new_password: '',
          new_password2: '',
        })
        setShowPasswordForm(false)
      } else {
        setPasswordError(result.error || 'Ошибка при смене пароля')
      }
    } catch (err) {
      setPasswordError('Ошибка при смене пароля. Пожалуйста, попробуйте снова.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="profile-loading">
        <p>Загрузка профиля...</p>
      </div>
    )
  }

  return (
    <div className="d-flex">
      <div className="windowp d-flex bg-white p-4 mb-4 mx-2 rounded">
        <form onSubmit={handleProfileSubmit} encType="multipart/form-data">
          <h2 className="mb-2">Profile</h2>
          {profileError && (
            <div className="profile-error">
              <p>{profileError}</p>
            </div>
          )}
          {successMessage && (
            <div className="profile-success">
              <p>{successMessage}</p>
            </div>
          )}
          <div className="d-flex">
            <div className="box1">
              <div className="col-md-12 mb-3">
                <img 
                  src={imagePreview || 'http://localhost:8000/static/img/noimage.jpg'} 
                  alt="Avatar" 
                  className="img-fluid"
                  style={{ maxWidth: '150px', maxHeight: '150px', marginBottom: '10px' }}
                  onError={(e) => {
                    e.target.src = 'http://localhost:8000/static/img/noimage.jpg'
                  }}
                />
                <input
                  type="file"
                  className="form-control form-styleprofile mt-2"
                  id="id_image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              <div className="col-md-12 mb-3">
                <label htmlFor="id_first_name" className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-control form-styleprofile"
                  id="id_first_name"
                  name="first_name"
                  placeholder="Your First Name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="col-md-12 mb-3">
                <label htmlFor="id_last_name" className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-control form-styleprofile"
                  id="id_last_name"
                  name="last_name"
                  placeholder="Your Last Name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="box2">
              <div className="col-md-12 mb-3">
                <label htmlFor="id_username" className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control form-styleprofile"
                  id="id_username"
                  name="username"
                  placeholder="Your Username"
                  value={formData.username}
                  disabled
                />
              </div>
              <div className="col-md-12 mb-3">
                <label htmlFor="id_email" className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control form-styleprofile"
                  id="id_email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
          <div className="btns d-flex gap-4 mt-4">
            <button 
              type="submit" 
              className="profile-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Сохранение...' : 'Save'}
            </button>
            <button
              type="button"
              className="profile-btn"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
            >
              Change Password
            </button>
          </div>
        </form>

        {showPasswordForm && (
          <div className="password-form-section">
            <h3>Change Password</h3>
            {passwordError && (
              <div className="profile-error">
                <p>{passwordError}</p>
              </div>
            )}
            {passwordSuccess && (
              <div className="profile-success">
                <p>{passwordSuccess}</p>
              </div>
            )}
            <form onSubmit={handlePasswordSubmit}>
              <div className="col-md-12 mb-3">
                <label htmlFor="id_old_password" className="form-label">Old Password</label>
                <input
                  type="password"
                  className="form-control form-styleprofile"
                  id="id_old_password"
                  name="old_password"
                  value={passwordData.old_password}
                  onChange={handlePasswordChange}
                  required
                  disabled={isChangingPassword}
                />
              </div>
              <div className="col-md-12 mb-3">
                <label htmlFor="id_new_password" className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control form-styleprofile"
                  id="id_new_password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  required
                  disabled={isChangingPassword}
                />
              </div>
              <div className="col-md-12 mb-3">
                <label htmlFor="id_new_password2" className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control form-styleprofile"
                  id="id_new_password2"
                  name="new_password2"
                  value={passwordData.new_password2}
                  onChange={handlePasswordChange}
                  required
                  disabled={isChangingPassword}
                />
              </div>
              <button
                type="submit"
                className="profile-btn"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? 'Изменение...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}

        <div className="orders">
          <h2 className="mb-2">Your Orders</h2>
          {ordersLoading ? (
            <p>Загрузка заказов...</p>
          ) : orders && orders.length > 0 ? (
            <div className="orderss">
              {orders.map((order) => (
                <div key={order.id} className="order-cart">
                  <h5 className="order-title">Order № {order.id}</h5>
                  <p className="order-desc">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item) => {
                        const product = item.product
                        return (
                          <div key={item.id} className="orders-carts">
                            <span className="dadad">Name: </span>
                            <Link to={`/shop/${product?.slug}`} className="order-item-link">
                              {product?.name || 'Product removed'}
                            </Link>
                            <br />
                            <span className="dadad">Quantity: </span> {item.quantity},
                            <span className="dadad"> Price: $ {item.price?.toFixed(2) || '0.00'}</span>
                            <br />
                            <span className="dadad">Date:</span> {formatDate(order.created)}
                            <br />
                          </div>
                        )
                      })
                    ) : (
                      <p>No items in this order</p>
                    )}
                  </p>
                  <div className="order-actions">
                    <Link to={`/orders/${order.id}`} className="btn btn-primary">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <h4 className="notorders">You haven't ordered anything yet.</h4>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage

