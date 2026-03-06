import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'https://my-crm-backend-dw59.onrender.com';

// 1. Описываем интерфейсы для порядка в коде
interface Service {
  id: number;
  name: string;
  price: number;
}

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

function App() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Интеграция с Telegram
    const tg = (window as any).Telegram?.WebApp;
    
    if (tg) {
      tg.ready();
      tg.expand();
      setUser(tg.initDataUnsafe?.user);
    }

    // Загрузка данных с обработкой ошибок
    const fetchServices = async () => {
      try {
        const res = await fetch(`${API_URL}/api/services`);
        if (!res.ok) throw new Error('Ошибка сервера');
        const data = await res.json();
        setServices(data.services || []);
      } catch (err) {
        setError('Не удалось загрузить список услуг 🛠️');
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Функция для записи (теперь отправляет данные на бэкенд)
  const handleBook = async (service: Service) => {
    const tg = (window as any).Telegram?.WebApp;

    try {
      // Здесь мы можем отправить POST запрос на создание брони
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: service.id,
          user_id: user?.id,
          user_name: user?.first_name
        })
      });

      if (response.ok) {
        tg?.showAlert(`Запись на "${service.name}" создана!`);
        tg?.HapticFeedback.notificationOccurred('success');
      }
    } catch (e) {
      alert("Ошибка при записи. Попробуйте позже.");
    }
  };

  if (loading) return <div className="loader">Загрузка Plitka CRM...</div>;
  if (error) return <div className="error-screen">{error}</div>;

  return (
    <div className="app">
      <header>
        <h1>Plitka CRM 🛠️</h1>
        {user && <p className="welcome">Мастер готов к работе, {user.first_name}!</p>}
      </header>

      <main>
        <div className="section-header">
          <h2>Доступные услуги</h2>
          <span className="badge">{services.length}</span>
        </div>

        <div className="services-grid">
          {services.length > 0 ? (
            services.map((s) => (
              <div key={s.id} className="card">
                <div className="card-info">
                  <h3>{s.name}</h3>
                  <p className="price">{s.price.toLocaleString()} ₽</p>
                </div>
                <button className="book-btn" onClick={() => handleBook(s)}>
                  Записаться
                </button>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>Услуг пока нет. Добавьте их в панели мастера.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
