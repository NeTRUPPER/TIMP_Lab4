import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Mock the auth context
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isInitialized: true
  })
}));

describe('App', () => {
  test('renders login page by default', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Вход в систему')).toBeInTheDocument();
  });

  test('renders navigation when user is logged in', () => {
    // Mock authenticated user
    jest.spyOn(require('../context/AuthContext'), 'useAuth').mockReturnValue({
      user: { id: 1, email: 'test@example.com' },
      isInitialized: true
    });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Incidents')).toBeInTheDocument();
  });
}); 