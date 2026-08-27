import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ChallengePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); // Can be used if necessary, but we manage localStorage below
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  // Extract state
  const challengeType = location.state?.challengeType || new URLSearchParams(location.search).get('challengeType') || 'captcha';
  const email = location.state?.email;
  const tempToken = location.state?.tempToken;

  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  // Captcha State
  

  useEffect(() => {
    if (!email || !tempToken) {
      navigate('/signin');
    }
    
  }, [email, tempToken, challengeType, navigate]);

  useEffect(() => {
    if (challengeType === 'otp' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [challengeType, timeLeft]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifySuccess = (data) => {
    // We follow AuthContext keys: 'vibe_token' and 'vibe_user'
    const userData = { ...data.user, role: data.user?.role || 'user' };
    localStorage.setItem('vibe_token', data.token);
    localStorage.setItem('vibe_user', JSON.stringify(userData));
    window.location.href = '/';
  };

  const handleFailure = (msg) => {
    setError(msg);
    const newAttempt = attempt + 1;
    setAttempt(newAttempt);
    if (newAttempt >= 3) {
      navigate('/signin');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tempToken, code })
      });
      const data = await res.json();
      if (res.ok) {
        verifySuccess(data);
      } else {
        handleFailure(data.error || 'Verification failed');
      }
    } catch (err) {
      handleFailure('Network error');
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-20 pb-12">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-500/8 blur-[120px]" />
        <div className="absolute right-1/4 top-1/3 h-64 w-64 rounded-full bg-pink-400/6 blur-[100px]" />
        <div className="absolute left-1/4 bottom-1/4 h-48 w-48 rounded-full bg-lime-400/5 blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="animate-fade-in-up mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 via-pink-400 to-lime-400 shadow-lg shadow-brand-500/25">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </span>
            <span className="font-display text-2xl font-black tracking-tight text-white">
              VI<span className="text-gradient-vibe">BE</span>
            </span>
          </Link>
          <p className="mt-3 text-sm text-gray-500">Security Challenge</p>
        </div>

        <div className="animate-fade-in-up-delay-1 rounded-2xl border border-white/5 bg-surface-900 p-8 shadow-2xl shadow-black/30">
          
          {error && (
            <div className="mb-6 rounded-xl border border-pink-400/20 bg-pink-400/10 px-4 py-3 text-sm text-pink-400">
              {error}
            </div>
          )}

          {challengeType === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center text-sm text-gray-400">
                <p>We've sent a 6-digit code to</p>
                <p className="font-bold text-white mt-1">{email}</p>
              </div>

              <div className="flex justify-center gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => inputRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-white/10 bg-surface-800 text-white outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
                  />
                ))}
              </div>

              <div className="text-center text-sm text-gray-500">
                Time remaining: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition-all hover:shadow-brand-500/40 hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              
              <div className="text-center">
                <button type="button" className="text-sm text-brand-500 hover:text-brand-400">
                  Resend Code
                </button>
              </div>
            </form>
          )}

          
        </div>
      </div>
    </div>
  );
}
