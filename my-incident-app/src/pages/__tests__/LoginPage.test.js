import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import LoginPage from '../LoginPage';

// Mock the auth context
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(),
    user: null,
    logout: jest.fn()
  })
}));

// Mock the API
jest.mock('../../api/api', () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn()
  }
}));

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders login form by default', () => {
    renderLoginPage();
    
    // Check if login form elements are present
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
    expect(screen.getByText('Войти')).toBeInTheDocument();
  });

  test('switches to registration form', () => {
    renderLoginPage();
    
    // Click the registration link
    fireEvent.click(screen.getByText('зарегистрироваться'));
    
    // Check if registration form elements are present
    expect(screen.getByPlaceholderText('Имя пользователя')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
    expect(screen.getByText('Зарегистрироваться')).toBeInTheDocument();
  });

  test('shows error message on failed login', async () => {
    const { authApi } = require('../../api/api');
    authApi.login.mockRejectedValueOnce(new Error('Invalid credentials'));

    renderLoginPage();
    
    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), {
      target: { value: 'password123' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Войти'));
    
    // Check if error message appears
    expect(await screen.findByText('Произошла ошибка при авторизации')).toBeInTheDocument();
  });
}); 