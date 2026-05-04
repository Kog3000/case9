import { useState } from 'react';
import { login } from '../Api/auth';
import { useAuth } from '../Context/AuthContext';
import './RegisterPage.css';

export default function RegisterPage({ onRegister, onLoginSuccess }) {
    const [loginEmail, setLoginEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { loginUser } = useAuth();

    const handleLoginChange = (e) => {
        setLoginEmail(e.target.value);
        setError('');
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setError('');
    };

    const handleLogin = async () => {
        if (!loginEmail.trim()) {
            setError('Введите email');
            return;
        }
        
        if (!password.trim()) {
            setError('Введите пароль');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Отправляем запрос на /users/token
            const response = await login(loginEmail, password);
            
            // Получаем данные пользователя из ответа (теперь с pvz)
            const userData = response.user;
            if (!userData) {
                throw new Error('Не удалось получить данные пользователя');
            }

            // Обновляем контекст аутентификации
            loginUser(userData);
            
            // Вызываем колбэк, чтобы родительский компонент обновил состояние
            if (onLoginSuccess) {
                onLoginSuccess(userData);
            }
        } catch (err) {
            console.error('Ошибка входа:', err);
            setError(err.response?.data?.detail || 'Неверный email или пароль');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="register-page">
            <div className="register-card">
                <h2 className="register-title">Вход в систему</h2>
                
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                
                <div className="form-group">
                    <label className="form-label">Введите e-mail</label>
                    <input 
                        className="form-input" 
                        type="email" 
                        value={loginEmail}
                        onChange={handleLoginChange}
                        onKeyPress={handleKeyPress}
                        placeholder="your@email.com"
                        disabled={isLoading}
                    />
                </div>
                
                <div className="form-group">
                    <label className="form-label">Введите пароль</label>
                    <input 
                        className="form-input" 
                        type="password" 
                        value={password}
                        onChange={handlePasswordChange}
                        onKeyPress={handleKeyPress}
                        placeholder="········"
                        disabled={isLoading}
                    />
                    {/* <a href="#" className="forgot-link">Забыли пароль?</a> */}
                </div>
                
                <button 
                    onClick={handleLogin} 
                    className="login-button"
                    disabled={isLoading}>
                    {isLoading ? 'Вход...' : 'Войти в систему'}
                </button>
            </div>
        </div>
    );
}