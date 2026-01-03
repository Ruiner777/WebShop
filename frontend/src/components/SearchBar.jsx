import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../api';
import './SearchBar.css'; // Создадим этот файл стилей

function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const debounceTimeoutRef = useRef(null);
  const searchBarRef = useRef(null);

  // Обработка ввода с дебаунсом
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (value.length > 2) { // Начинаем поиск после 2 символов
      debounceTimeoutRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 300); // Дебаунс 300ms
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Запрос к API автодополнения
  const fetchSuggestions = useCallback(async (searchQuery) => {
    try {
      const response = await productsAPI.autocomplete(searchQuery); // productsAPI.autocomplete нужно будет создать
      setSuggestions(response.data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Ошибка при автодополнении поиска:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  // Переход на страницу деталей продукта при клике на подсказку
  const handleSuggestionClick = (slug) => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    navigate(`/shop/${slug}`);
  };

  // Переход на страницу полного поиска при нажатии Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (query.trim()) {
        setSuggestions([]);
        setShowSuggestions(false);
        navigate(`/search?q=${query}`);
      }
    }
  };

  // Закрытие подсказок при клике вне SearchBar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="search-bar-container" ref={searchBarRef}>
      <div className="search-input-wrapper">
        <input
          type="text"
          placeholder="Поиск товаров..."
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="search-input"
        />
        <button className="search-button" onClick={() => handleKeyPress({ key: 'Enter' })}>
          <i className="fa fa-search"></i> {/* Иконка лупы - предполагается Font Awesome */}
        </button>
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-dropdown">
          {suggestions.map((product) => (
            <li 
              key={product.id} 
              onClick={() => handleSuggestionClick(product.slug)}
              className="suggestion-item"
            >
              {product.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;

