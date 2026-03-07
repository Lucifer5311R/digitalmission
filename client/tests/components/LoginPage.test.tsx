import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '../../src/pages/LoginPage';

// Mock the AuthContext
const mockLogin = vi.fn();
const mockClearError = vi.fn();
let mockAuthState = {
  user: null as any,
  isAuthenticated: false,
  isLoading: false,
  error: null as string | null,
  login: mockLogin,
  logout: vi.fn(),
  clearError: mockClearError,
};

vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  LogIn: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'login-icon' }),
}));

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: mockLogin,
      logout: vi.fn(),
      clearError: mockClearError,
    };
  });

  it('renders the login form', () => {
    renderLoginPage();
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your attendance account')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('shows demo account info', () => {
    renderLoginPage();
    expect(screen.getByText('Demo Accounts')).toBeInTheDocument();
    expect(screen.getByText(/admin@attendance.com/)).toBeInTheDocument();
    expect(screen.getByText(/trainer1@attendance.com/)).toBeInTheDocument();
  });

  it('validates empty email', async () => {
    renderLoginPage();
    const submitBtn = screen.getByRole('button', { name: 'Sign In' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('validates invalid email format', async () => {
    renderLoginPage();
    const emailInput = screen.getByLabelText('Email');
    const submitBtn = screen.getByRole('button', { name: 'Sign In' });

    await userEvent.type(emailInput, 'invalid-email');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });
  });

  it('validates empty password', async () => {
    renderLoginPage();
    const emailInput = screen.getByLabelText('Email');
    const submitBtn = screen.getByRole('button', { name: 'Sign In' });

    await userEvent.type(emailInput, 'user@example.com');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('calls login on valid submission', async () => {
    mockLogin.mockResolvedValue(undefined);
    renderLoginPage();

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitBtn = screen.getByRole('button', { name: 'Sign In' });

    await userEvent.type(emailInput, 'user@example.com');
    await userEvent.type(passwordInput, 'password123');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'password123');
    });
  });

  it('displays API error from AuthContext', () => {
    mockAuthState.error = 'Invalid credentials';
    renderLoginPage();
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('clears error when typing in email', async () => {
    mockAuthState.error = 'Some error';
    renderLoginPage();

    const emailInput = screen.getByLabelText('Email');
    await userEvent.type(emailInput, 'a');

    expect(mockClearError).toHaveBeenCalled();
  });

  it('clears error when typing in password', async () => {
    mockAuthState.error = 'Some error';
    renderLoginPage();

    const passwordInput = screen.getByLabelText('Password');
    await userEvent.type(passwordInput, 'a');

    expect(mockClearError).toHaveBeenCalled();
  });
});
