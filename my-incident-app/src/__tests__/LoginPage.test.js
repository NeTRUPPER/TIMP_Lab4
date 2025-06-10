import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import { authApi } from '../api/api';

// Mock the API
jest.mock('../api/api', () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn()
  }
}));

// Mock the auth context
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(),
    user: null,
    isInitialized: true
  })
}));

describe('LoginPage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders login form', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument();
  });

  test('shows error message when login fails', async () => {
    // Mock API error
    authApi.login.mockRejectedValue({
      code: 'AUTH_ERROR',
      message: 'Неверный email или пароль'
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), {
      target: { value: 'password123' }
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Войти' }));

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Неверный email или пароль')).toBeInTheDocument();
    });
  });

  test('successful login calls auth context login', async () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    const mockToken = 'fake-token';
    
    // Mock successful login
    authApi.login.mockResolvedValue({
      user: mockUser,
      token: mockToken
    });

    const mockLogin = jest.fn();
    jest.spyOn(require('../context/AuthContext'), 'useAuth').mockReturnValue({
      login: mockLogin,
      user: null,
      isInitialized: true
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), {
      target: { value: 'password123' }
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Войти' }));

    // Verify API was called with correct data
    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(mockLogin).toHaveBeenCalledWith(mockUser);
    });
  });
}); 