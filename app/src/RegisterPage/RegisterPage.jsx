import { useState } from 'react'
import './RegisterPage.css'
import { roles } from '../data.js'

export default function RegisterPage({ onBack, onRegister, onLoginSuccess }) {
    const [login, setLogin] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const findUser = (login, password) => {
        return roles.find(user => user.login === login && user.password === password)
    }

    const handleLoginChange = (e) => {
        setLogin(e.target.value)
        setError('')
    }

    const handlePasswordChange = (e) => {
        setPassword(e.target.value)
        setError('')
    }

    const handleLogin = async () => {
        if (!login.trim()) {
            setError('Введите логин')
            return
        }
        
        if (!password.trim()) {
            setError('Введите пароль')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const user = findUser(login, password)
            
            if (user) {
                console.log('Успешный вход:', user)
                if (onLoginSuccess) {
                    onLoginSuccess(user)
                }
            } else {
                setError('Неверный логин или пароль')
            }
        } catch (err) {
            console.error('Ошибка:', err)
            setError('Ошибка при входе. Попробуйте позже.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleLogin()
        }
    }

    return(
        <div className="register-page">
            <div className="register-card">
                <h2 className="register-title">Вход в систему</h2>
                
                {error && (
                    <div className="error-message">
                        ⚠️ {error}
                    </div>
                )}
                
                <div className="form-group">
                    <label className="form-label">Ваш логин</label>
                    <input 
                        className="form-input" 
                        type="text" 
                        value={login}
                        onChange={handleLoginChange}
                        onKeyPress={handleKeyPress}
                        placeholder="your_login"
                        disabled={isLoading}
                    />
                </div>
                
                <div className="form-group">
                    <label className="form-label">Ваш пароль</label>
                    <input 
                        className="form-input" 
                        type="password" 
                        value={password}
                        onChange={handlePasswordChange}
                        onKeyPress={handleKeyPress}
                        placeholder="········"
                        disabled={isLoading}
                    />
                    <a href="#" className="forgot-link">Забыли пароль?</a>
                </div>
                
                <button 
                    onClick={handleLogin} 
                    className="login-button"
                    disabled={isLoading}
                >
                    {isLoading ? 'Вход...' : 'Войти в систему'}
                </button>
                
                <div className="register-divider">
                    <span className="divider-text">Еще нет аккаунта?</span>
                </div>
                
                <button 
                    onClick={onRegister} 
                    className="register-button"
                    disabled={isLoading}
                >
                    Зарегистрироваться
                </button>
            </div>
        </div>
    )
}