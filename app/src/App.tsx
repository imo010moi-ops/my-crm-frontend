import { useState, useEffect } from 'react';
import './App.css';

// ❗ Укажи адрес своего бэкенда на Render
const API_URL = 'https://my-crm-backend-dw59.onrender.com';

function App() {
  const [user, setUser] = useState<any>(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Получаем данные пользователя из Telegram WebApp
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.expand(); // Развернуть на весь экран
      setUser(tg.initDataUnsafe?.user);
    }

    // 2. Загружаем услуги с твоего сервера
    fetch(`${API_URL}/api/services`)
      .then(res => res.json())
      .then(data => {
        setServices(data.services || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Ошибка загрузки API:", err);
        setLoading(false);
      });
  }, []);

  const handleBook = (service: any) => {
    alert(`Запись на "${service.name}" принята! Мастер свяжется с вами.`);
  };

  if (loading) return <div className="loader">Загрузка Plitka CRM...</div>;

  return (
    <div className="app">
      <header>
        <h1>Plitka CRM 🛠️</h1>
        {user && <p>Привет, {user.first_name}!</p>}
      </header>

      <main>
        <h2>Доступные услуги:</h2>
        <div className="services-grid">
          {services.length > 0 ? services.map((s: any) => (
            <div key={s.id} className="card">
              <h3>{s.name}</h3>
              <p className="price">{s.price} ₽</p>
              <button onClick={() => handleBook(s)}>Записаться</button>
            </div>
          )) : (
            <p>Услуг пока нет. Добавьте их в панели мастера.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
