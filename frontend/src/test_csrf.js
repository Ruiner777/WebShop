// Тест CSRF токена - временный файл для отладки
// Добавьте этот скрипт в index.html для тестирования

// Функция для получения CSRF токена из куки
function getCSRFToken() {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Тест
console.log('🔍 CSRF Test:');
console.log('All cookies:', document.cookie);
console.log('CSRF token:', getCSRFToken());

// Тест запроса
async function testPaymentAPI() {
  const orderId = 1; // Замените на реальный ID заказа
  const csrfToken = getCSRFToken();

  console.log('📤 Testing payment API...');
  console.log('Order ID:', orderId);
  console.log('CSRF Token:', csrfToken);

  try {
    const response = await fetch(`/api/v1/payment/create-checkout-session/${orderId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include',
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', [...response.headers.entries()]);

    const data = await response.json();
    console.log('📥 Response data:', data);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Вызовите testPaymentAPI() в консоли браузера для тестирования
