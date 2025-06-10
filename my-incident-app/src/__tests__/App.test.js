import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import App from '../App';

// Mock the auth context
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(),
    user: null,
    logout: jest.fn()
  })
}));

const renderApp = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('App', () => {
  test('renders login page by default', () => {
    renderApp();
    expect(screen.getByText('Вход в систему')).toBeInTheDocument();
  });

  test('renders navigation when user is logged in', () => {
    // Mock the auth context to return a logged-in user
    jest.spyOn(require('../context/AuthContext'), 'useAuth').mockImplementation(() => ({
      login: jest.fn(),
      user: { id: 1, email: 'test@example.com' },
      logout: jest.fn()
    }));

    renderApp();
    expect(screen.getByText('Инциденты')).toBeInTheDocument();
  });
}); 