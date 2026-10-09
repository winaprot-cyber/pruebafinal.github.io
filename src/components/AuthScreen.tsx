import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Mail, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import type { useStore } from '../store/useStore';

interface AuthScreenProps {
  store: ReturnType<typeof useStore>;
}

export default function AuthScreen({ store }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = store.login(username, password);
    if (!success) {
      setError('Usuario o contraseña incorrectos');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !name) {
      setError('Nombre de usuario y nombre completo son obligatorios');
      return;
    }
    const result = store.register(username, name, email || undefined);
    if (result.success) {
      setGeneratedPassword(result.password!);
    } else {
      setError(result.error!);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    alert('Contraseña copiada al portapapeles');
  };

  if (generatedPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">¡Registro Exitoso!</h2>
            <p className="text-slate-400 text-sm">Tu cuenta ha sido creada correctamente</p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4 mb-6">
            <p className="text-xs text-slate-400 mb-2">Tu contraseña generada:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-slate-900/50 rounded px-3 py-2 text-emerald-400 font-mono text-lg">{generatedPassword}</code>
              <button onClick={handleCopyPassword} className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-3 py-2 rounded transition-colors">Copiar</button>
            </div>
            <p className="text-xs text-yellow-400 mt-2">⚠️ Guarda esta contraseña, la necesitarás para iniciar sesión</p>
          </div>
          <div className="space-y-3">
            <div className="text-sm text-slate-400">
              <p><strong>Usuario:</strong> {username}</p>
              <p><strong>Nombre:</strong> {name}</p>
              {email && <p><strong>Email:</strong> {email}</p>}
            </div>
          </div>
          <button onClick={() => { setGeneratedPassword(''); setMode('login'); setPassword(''); }} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3 rounded-lg font-medium transition-all mt-6">Continuar al Login</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Control Biométrico</h1>
          <p className="text-slate-400">by Hugo León</p>
        </div>
        <div className="flex gap-2 mb-6">
          <button onClick={() => { setMode('login'); setError(''); }} className={`flex-1 py-2 rounded-lg font-medium transition-all ${mode === 'login' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-700/30 text-slate-400 border border-slate-600/30'}`}>Iniciar Sesión</button>
          <button onClick={() => { setMode('register'); setError(''); }} className={`flex-1 py-2 rounded-lg font-medium transition-all ${mode === 'register' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700/30 text-slate-400 border border-slate-600/30'}`}>Registrarse</button>
        </div>
        <AnimatePresence mode="wait">
          {mode === 'login' ? (
            <motion.form key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 block mb-1">Usuario</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-3 py-2 text-white" placeholder="Ingresa tu usuario" required />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Contraseña</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-10 py-2 text-white" placeholder="Ingresa tu contraseña" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
              {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">{error}</div>}
              <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"><LogIn size={18} />Iniciar Sesión</button>
            </motion.form>
          ) : (
            <motion.form key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 block mb-1">Nombre de Usuario *</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-3 py-2 text-white" placeholder="Ej: juanperez" required />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Nombre Completo *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white" placeholder="Ej: Juan Pérez García" required />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Correo Electrónico (Opcional)</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-3 py-2 text-white" placeholder="Ej: juan@email.com" />
                </div>
              </div>
              {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">{error}</div>}
              <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"><UserPlus size={18} />Registrarse</button>
              <p className="text-xs text-slate-500 text-center">* El primer usuario registrado será administrador</p>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
