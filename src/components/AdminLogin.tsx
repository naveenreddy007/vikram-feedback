import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, Card } from './ui';
import useHapticFeedback from '../hooks/useHapticFeedback';

interface AdminLoginProps {
  onLogin: (token: string, user: any) => void;
  onBack: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onBack }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { feedback } = useHapticFeedback();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('Please enter both username and password');
      feedback.error();
      return;
    }

    setIsLoading(true);
    setError(null);
    feedback.formSubmit();

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        feedback.success();
        localStorage.setItem('adminToken', data.data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.data.user));
        onLogin(data.data.token, data.data.user);
      } else {
        throw new Error(data.error?.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      feedback.error();
      setError(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={onBack}
            className="mb-6"
          >
            ← Back to Home
          </Button>
          
          <motion.h1 
            className="text-4xl md:text-5xl lewish-text text-accent-blue mb-4"
            animate={{
              textShadow: [
                "0 0 10px #00d4ff",
                "0 0 20px #00d4ff, 0 0 30px #00d4ff",
                "0 0 10px #00d4ff"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ADMIN LOGIN
          </motion.h1>
          
          <p className="text-gray-300 text-lg">
            Access the admin dashboard to view feedback analytics
          </p>
        </div>

        {/* Login Form */}
        <Card variant="glass" className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <motion.div
                className="text-4xl mb-4"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                🔐
              </motion.div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                Welcome Back, Vikram
              </h2>
              <p className="text-gray-400">
                Sign in to access your feedback dashboard
              </p>
            </div>

            <Input
              label="Username"
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Enter your username"
              icon={<span className="text-xl">👤</span>}
              disabled={isLoading}
            />

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Enter your password"
              icon={<span className="text-xl">🔑</span>}
              disabled={isLoading}
            />

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-red-400 text-xl">⚠️</span>
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              disabled={!formData.username || !formData.password}
              className="w-full lewish-text"
            >
              {isLoading ? 'SIGNING IN...' : 'SIGN IN ✨'}
            </Button>

            <div className="text-center">
              <p className="text-gray-500 text-sm">
                Secure admin access for feedback management
              </p>
            </div>
          </form>
        </Card>

        {/* Demo Credentials */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Card variant="glass" className="p-4">
            <h3 className="text-sm font-semibold text-accent-orange mb-2">
              Demo Credentials
            </h3>
            <p className="text-xs text-gray-400 mb-2">
              For development testing:
            </p>
            <div className="text-xs text-gray-300 space-y-1">
              
            </div>
            <p className="text-xs text-gray-500 mt-2">
              (Create admin user in database first)
            </p>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;