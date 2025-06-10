// src/pages/LoginPage.js
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/api";

const LoginPage = () => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted, starting login process...');
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        console.log('Attempting login with email:', formData.email);
        const data = await authApi.login({
          email: formData.email,
          password: formData.password
        });
        console.log('Login API response:', data);
        
        if (data.user) {
          console.log('User data received, attempting to set in context...');
          try {
            await login(data.user);
            console.log('Login successful, user set in context');
          } catch (loginError) {
            console.error('Error in login context:', loginError);
            setError(loginError.message || 'Ошибка при входе в систему');
            setLoading(false);
            return;
          }
        } else {
          console.error('No user data in response');
          throw new Error('Ошибка при входе: данные пользователя не получены');
        }
      } else {
        console.log('Attempting registration...');
        const response = await authApi.register(formData);
        console.log('Registration response:', response);
        
        if (response.error) {
          throw new Error(response.error);
        }
        setIsLogin(true);
        setFormData({ username: '', password: '', email: '' });
        setError('Регистрация успешна! Теперь вы можете войти.');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Произошла ошибка при авторизации');
    } finally {
      console.log('Login process finished, setting loading to false');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({ username: '', password: '', email: '' });
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Вход в систему' : 'Регистрация'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin ? 'Или' : 'Уже есть аккаунт?'}{' '}
            <button
              onClick={toggleForm}
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              {isLogin ? 'зарегистрироваться' : 'войти'}
            </button>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className={`border-l-4 p-4 ${
              error.includes('успешна') 
                ? 'bg-green-50 border-green-400' 
                : 'bg-red-50 border-red-400'
            }`}>
              <div className="flex">
                <div className="ml-3">
                  <p className={`text-sm ${
                    error.includes('успешна') 
                      ? 'text-green-700' 
                      : 'text-red-700'
                  }`}>
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            {!isLogin && (
              <div>
                <label htmlFor="username" className="sr-only">
                  Имя пользователя
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Имя пользователя"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${
                  !isLogin ? '' : 'rounded-t-md'
                } focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                placeholder="Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Пароль"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
