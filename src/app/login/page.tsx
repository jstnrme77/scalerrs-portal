'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/forms/Input';
import Button from '@/components/ui/forms/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // With Vercel, we can simply use the AuthContext login function
      const success = await login(email, password);

      if (success) {
        router.push('/home');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-lightGray dark:bg-dark">
      <div className="w-full max-w-md p-8 bg-white dark:bg-darkGray rounded-scalerrs shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-dark dark:text-white">Scalerrs Portal</h1>
          <p className="text-mediumGray dark:text-gray-400 mt-2">Sign in to your account</p>
          <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
            <p><strong>Demo Credentials:</strong></p>
            <p>Email: admin@example.com or client@example.com</p>
            <p>Password: any password will work</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="mb-4"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="mb-6"
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}
