import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import AppRoutes from '../App';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Mock the IncidentsPage component
jest.mock('../pages/IncidentsPage', () => () => <div>Инциденты</div>);

// Mock the Layout component
jest.mock('../components/Layout', () => ({ children }) => <div>{children}</div>);

// Mock the auth context
const mockAuthContext = {
  user: null,
  isInitialized: true,
  login: jest.fn(),
  logout: jest.fn()
};

jest.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }) => <>{children}</>
}));

describe('App', () => {
  beforeEach(() => {
    // Reset mock before each test
    mockAuthContext.user = null;
  });

  test('renders login page by default', () => {
    render(<AppRoutes />);
    expect(screen.getByText('Вход в систему')).toBeInTheDocument();
  });

  test('renders incidents page when user is logged in', async () => {
    mockAuthContext.user = { id: 1, email: 'test@example.com' };
    window.history.pushState({}, 'Incidents page', '/incidents');
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Инциденты')).toBeInTheDocument();
    });
  });
}); 