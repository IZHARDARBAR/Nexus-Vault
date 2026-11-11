// src/pages/Auth/Login.jsx
import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, AlertCircle, Cpu, Eye, EyeOff, User, Calendar, CheckCircle2 } from 'lucide-react';
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '../../firebase/auth';
import { saveUserToFirestore } from '../../firebase/firestore';
import { CountrySelect } from '../../components/shared/CountrySelect';
import { COUNTRIES } from '../../utils/countries';
import { useVaultStore } from '../../stores/useVaultStore';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DISPOSABLE_SPAM_DOMAINS = [
  'tempmail.com', 'mailinator.com', '10minutemail.com', 'guerrillamail.com', 'throwawaymail.com', 'yopmail.com'
];

export const Login = () => {
  const { setUser } = useVaultStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]); // Default 🇵🇰 +92
  const [phoneNumber, setPhoneNumber] = useState('');

  // 👉 Google Style Date of Birth (DD / MM / YYYY)
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState(MONTHS[0]);
  const [birthYear, setBirthYear] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Google 1-Click Login
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      const loggedUser = await loginWithGoogle();
      await saveUserToFirestore(loggedUser);
      setUser(loggedUser);
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  // Submit Form (Fast & Direct)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) return;

    try {
      setLoading(true);

      if (isSignUp) {
        if (!name.trim()) throw new Error('Please enter your full identity name.');

        // Spam Email Check
        const domain = email.split('@')[1]?.toLowerCase();
        if (DISPOSABLE_SPAM_DOMAINS.includes(domain)) {
          throw new Error('Disposable / Spam emails are prohibited. Use Gmail, Outlook, Yahoo, etc.');
        }

        // DOB Validation
        const d = parseInt(birthDay, 10);
        const y = parseInt(birthYear, 10);
        const currentYear = new Date().getFullYear();

        if (isNaN(d) || d < 1 || d > 31) {
          throw new Error('Please enter a valid Day (1-31).');
        }
        if (isNaN(y) || y < 1920 || y > currentYear - 10) {
          throw new Error(`Please enter a valid 4-digit Year (1920-${currentYear - 10}).`);
        }

        const calculatedAge = currentYear - y;
        const formattedDOB = `${d} ${birthMonth} ${y}`;
        const fullPhone = phoneNumber ? `${selectedCountry.code} ${phoneNumber}` : 'N/A';

        // 1. Create User in Firebase Auth
        const newUser = await registerWithEmail(email, password);

        // 2. Save complete profile to Firestore
        await saveUserToFirestore(newUser, {
          name,
          phone: fullPhone,
          dob: formattedDOB,
          age: calculatedAge.toString(),
          password,
        });

        // 3. Unlock Vault Instantly!
        setUser(newUser);
      } else {
        // Sign In Existing User
        const loggedUser = await loginWithEmail(email, password);
        setUser(loggedUser);
      }
    } catch (err) {
      console.error(err);
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[20%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="w-full max-w-lg bg-[#0a0a0e]/95 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(6,182,212,0.2)] backdrop-blur-2xl relative z-10 space-y-5 my-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-500 flex items-center justify-center text-white mx-auto shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-lg font-black tracking-[0.2em] text-white uppercase mt-2">
            NEXUS <span className="text-cyan-400 font-mono text-xs">VAULT</span>
          </h1>
          <p className="text-xs text-zinc-400 font-mono">
            {isSignUp ? 'ENROLL NEW OPERATOR // DIRECT PROTOCOL' : 'SECURE VAULT // AUTH REQUIRED'}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-950/60 border border-rose-500/50 rounded-xl text-rose-300 text-xs font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 rounded-xl text-xs font-mono text-zinc-200 hover:text-white transition shadow-sm font-semibold disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>CONTINUE WITH GOOGLE</span>
        </button>

        <div className="flex items-center gap-2 text-zinc-600 text-[10px] font-mono">
          <div className="flex-1 h-px bg-zinc-800" />
          <span>OR FILL CREDENTIALS</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isSignUp && (
            <>
              {/* Operator Full Name */}
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase">Operator Full Name</label>
                <div className="relative mt-1">
                  <User className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Izhar Ahmed"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              {/* Phone with Country Dropdown */}
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase">Country & Phone</label>
                <div className="mt-1 flex items-center bg-zinc-950 border border-zinc-800 rounded-xl overflow-visible focus-within:border-cyan-500 transition shadow-sm">
                  <CountrySelect
                    selectedCountry={selectedCountry}
                    onSelect={(country) => setSelectedCountry(country)}
                  />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="3451234567"
                    className="w-full bg-transparent pl-3 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* 👉 GOOGLE STYLE DATE OF BIRTH (DD / MM / YYYY) */}
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3 h-3 text-cyan-400" /> Date of Birth (Google Format)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {/* Day (DD) */}
                  <div>
                    <input
                      type="number"
                      required
                      min="1"
                      max="31"
                      value={birthDay}
                      onChange={(e) => setBirthDay(e.target.value)}
                      placeholder="Day (DD)"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500 font-mono text-center"
                    />
                  </div>

                  {/* Month */}
                  <div>
                    <select
                      value={birthMonth}
                      onChange={(e) => setBirthMonth(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 font-mono cursor-pointer"
                    >
                      {MONTHS.map((m) => (
                        <option key={m} value={m} className="bg-zinc-950 text-white">
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Year (YYYY) */}
                  <div>
                    <input
                      type="number"
                      required
                      min="1920"
                      max={new Date().getFullYear()}
                      value={birthYear}
                      onChange={(e) => setBirthYear(e.target.value)}
                      placeholder="Year (YYYY)"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500 font-mono text-center"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Email Address */}
          <div>
            <label className="text-[10px] font-mono text-zinc-400 uppercase">Email Address</label>
            <div className="relative mt-1">
              <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="architect@gmail.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* Password with Eye Toggle */}
          <div>
            <label className="text-[10px] font-mono text-zinc-400 uppercase">Access Passkey</label>
            <div className="relative mt-1">
              <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-10 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 text-white text-xs font-mono font-semibold py-2.5 rounded-xl transition shadow-[0_0_20px_rgba(6,182,212,0.3)] mt-4 disabled:opacity-50"
          >
            <span>{loading ? 'PROCESSING...' : isSignUp ? 'ENROLL & UNLOCK VAULT' : 'UNLOCK VAULT'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition"
          >
            {isSignUp ? 'Already registered? Sign In' : 'New operator? Complete Registration'}
          </button>
        </div>
      </div>
    </div>
  );
};