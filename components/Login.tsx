'use client';

import { useState } from 'react';
import { useGame } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { AlertCircle, Scroll, Zap, Users, Heart, Sparkles, Sword } from 'lucide-react';

export default function Login() {
  const { login, register } = useGame();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        if (!email || !password) {
          throw new Error('Please fill in all fields');
        }
        await login(email, password);
      } else {
        if (!email || !username || !password || !confirmPassword) {
          throw new Error('Please fill in all fields');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        await register(email, username, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#F5F2F2' }}
    >
      {/* Background decoration elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-5">
        <div 
          className="absolute top-20 left-10 w-48 h-48 rounded-full"
          style={{ backgroundColor: '#FEB05D' }}
        />
        <div 
          className="absolute bottom-20 right-10 w-56 h-56 rounded-full"
          style={{ backgroundColor: '#5A7ACD' }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
          style={{ backgroundColor: '#2B2A2A' }}
        />
      </div>

      <div className="w-full max-w-6xl relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* LEFT SIDE - Details Panel */}
        <div className="hidden lg:flex flex-col justify-center space-y-8">
          {/* Logo and Title */}
          <div className="space-y-3">
            <div 
              className="inline-flex items-center justify-center w-20 h-20 rounded-xl"
              style={{ backgroundColor: '#FEB05D' }}
            >
              <Scroll className="w-10 h-10 text-white" />
            </div>
            <h1 
              className="text-4xl font-bold"
              style={{ color: '#2B2A2A' }}
            >
              WellnessQuest
            </h1>
            <p 
              className="text-base"
              style={{ color: '#5A7ACD' }}
            >
              Welcome to the Adventure of a Lifetime
            </p>
          </div>

          {/* Features Section */}
          <div className="space-y-6">
            <div className="border-b-2" style={{ borderColor: '#5A7ACD' }} />
            
            <h2 
              className="text-xl font-bold"
              style={{ color: '#2B2A2A' }}
            >
              Embark on Your Epic Wellness Adventure
            </h2>

            {/* Feature 1 */}
            <div className="flex gap-4">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#5A7ACD' }}
              >
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: '#2B2A2A' }}>
                  Epic Quests & Adventures
                </p>
                <p className="text-sm mt-1" style={{ color: '#5A7ACD' }}>
                  Transform your wellness journey into legendary quests filled with rewards
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-4">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#FEB05D' }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: '#2B2A2A' }}>
                  Personalized Quest Board
                </p>
                <p className="text-sm mt-1" style={{ color: '#5A7ACD' }}>
                  AI-guided adventures crafted uniquely for your hero's journey
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-4">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#2B2A2A' }}
              >
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: '#2B2A2A' }}>
                  Guild Challenges & Glory
                </p>
                <p className="text-sm mt-1" style={{ color: '#5A7ACD' }}>
                  Join fellow adventurers in epic challenges and claim legendary rewards
                </p>
              </div>
            </div>

            <div className="border-b-2" style={{ borderColor: '#5A7ACD' }} />
            
            <p className="text-sm leading-relaxed" style={{ color: '#5A7ACD' }}>
              Your legendary adventure awaits! Complete epic quests, level up your hero, and unlock legendary treasures. No microtransactions—just pure adventure and glory!
            </p>
          </div>
        </div>

        {/* RIGHT SIDE - Login Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0 space-y-8">
          {/* Header - Mobile Only */}
          <div className="lg:hidden text-center space-y-3">
            <div 
              className="inline-flex items-center justify-center w-20 h-20 rounded-xl"
              style={{ backgroundColor: '#FEB05D' }}
            >
              <Scroll className="w-10 h-10 text-white" />
            </div>
            <h1 
              className="text-4xl font-bold"
              style={{ color: '#2B2A2A' }}
            >
              WellnessQuest
            </h1>
          </div>

          {/* Main Card */}
          <Card 
            className="p-8 border-2 space-y-6"
            style={{ borderColor: '#5A7ACD', backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
          >
            {/* Error Alert */}
            {error && (
              <div 
                className="p-4 rounded-lg flex gap-3 items-start border"
                style={{ backgroundColor: '#FEB05D', borderColor: '#FEB05D', color: '#2B2A2A' }}
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Form Title */}
            <div>
              <h2 
                className="text-2xl font-bold mb-1"
                style={{ color: '#2B2A2A' }}
              >
                {isLogin ? 'Continue Your Adventure' : 'Begin Your Quest'}
              </h2>
              <p 
                className="text-sm"
                style={{ color: '#5A7ACD' }}
              >
                {isLogin 
                  ? 'Welcome back, brave adventurer! Your quests await'
                  : 'Join thousands of heroes on their epic wellness adventure'
                }
              </p>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label style={{ color: '#2B2A2A' }} className="block text-sm font-bold mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={loading}
                  className="w-full border-2"
                  style={{ 
                    borderColor: '#5A7ACD',
                    color: '#2B2A2A'
                  }}
                />
              </div>

              {!isLogin && (
                <div>
                  <label style={{ color: '#2B2A2A' }} className="block text-sm font-bold mb-2">
                    Adventurer Name
                  </label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="What will heroes call you?"
                    disabled={loading}
                    className="w-full border-2"
                    style={{ 
                      borderColor: '#5A7ACD',
                      color: '#2B2A2A'
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{ color: '#2B2A2A' }} className="block text-sm font-bold mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full border-2"
                  style={{ 
                    borderColor: '#5A7ACD',
                    color: '#2B2A2A'
                  }}
                />
              </div>

              {!isLogin && (
                <div>
                  <label style={{ color: '#2B2A2A' }} className="block text-sm font-bold mb-2">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    className="w-full border-2"
                    style={{ 
                      borderColor: '#5A7ACD',
                      color: '#2B2A2A'
                    }}
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 font-bold text-white flex items-center justify-center gap-2 text-base rounded-lg transition-all hover:shadow-lg"
                style={{ backgroundColor: '#5A7ACD' }}
              >
                <Sparkles className="w-5 h-5" />
                {loading ? 'Embarking...' : isLogin ? 'Enter the Realm' : 'Begin Your Adventure'}
              </Button>
            </form>

            {/* Toggle Login/Register */}
            <div className="text-center pt-2">
              <p style={{ color: '#2B2A2A' }} className="text-sm">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setEmail('');
                    setUsername('');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  style={{ color: '#FEB05D' }}
                  className="font-bold hover:opacity-75 transition"
                >
                  {isLogin ? 'Create Now' : 'Sign In'}
                </button>
              </p>
            </div>
          </Card>

          {/* Mobile Info Section */}
          <div className="lg:hidden space-y-4">
            <div className="border-t-2" style={{ borderColor: '#5A7ACD' }} />
            
            <div className="space-y-3">
              <h3 
                className="text-sm font-bold"
                style={{ color: '#2B2A2A' }}
              >
                Your Adventure Awaits
              </h3>
              
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#5A7ACD' }}
                  >
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: '#2B2A2A' }}>
                      Epic Quests & Adventures
                    </p>
                    <p className="text-xs" style={{ color: '#5A7ACD' }}>
                      Transform your wellness journey into legendary quests filled with rewards
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#FEB05D' }}
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: '#2B2A2A' }}>
                      Personalized Quest Board
                    </p>
                    <p className="text-xs" style={{ color: '#5A7ACD' }}>
                      AI-guided adventures crafted uniquely for your hero's journey
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#2B2A2A' }}
                  >
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: '#2B2A2A' }}>
                      Community & Challenges
                    </p>
                    <p className="text-xs" style={{ color: '#5A7ACD' }}>
                      Compete in challenges and earn legendary achievements
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t-2" style={{ borderColor: '#5A7ACD' }} />
            
            <p className="text-xs text-center" style={{ color: '#5A7ACD', lineHeight: '1.6' }}>
              Your wellness journey awaits. Complete quests, level up your character, and unlock exclusive rewards. No microtransactions—just pure, health-driven adventure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
