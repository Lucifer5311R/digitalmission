import React, { useState, FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { ROUTES } from '../utils/constants';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { LogIn } from 'lucide-react';

export function LoginPage() {
  const { login, isAuthenticated, isLoading, user, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated && user) {
    const redirectTo = user.role === UserRole.SUPERVISOR ? ROUTES.SUPERVISOR_HOME : ROUTES.TRAINER_HOME;
    return <Navigate to={redirectTo} replace />;
  }

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email format';
    if (!password) errors.password = 'Password is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await login(email, password);
    } catch {
      // Error is handled by AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-1">Sign in to your attendance account</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); clearError(); }}
              error={formErrors.email}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); clearError(); }}
              error={formErrors.password}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            <Button
              type="submit"
              isLoading={submitting}
              className="w-full"
              size="lg"
            >
              Sign In
            </Button>
          </form>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 font-medium mb-2">Demo Accounts</p>
          <div className="space-y-1 text-xs text-gray-600">
            <p><span className="font-medium">Supervisor:</span> admin@attendance.com / admin123</p>
            <p><span className="font-medium">Trainer:</span> trainer1@attendance.com / trainer123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
