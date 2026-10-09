import { Shield, ArrowLeft, Users } from 'lucide-react';
import type { useStore } from '../store/useStore';

interface AdminPanelProps {
  store: ReturnType<typeof useStore>;
  onBack: () => void;
}

export default function AdminPanel({ store, onBack }: AdminPanelProps) {
  const users = store.getAllUsers();
  const currentUser = store.getCurrentUser()!;
  const isSuperAdmin = currentUser.username.toLowerCase() === 'dome4437';

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="card-solid rounded-xl p-8 text-center">
          <Shield size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Acceso Restringido</h2>
          <p className="text-slate-400">No tienes permisos para acceder al panel de administración.</p>
          <button onClick={onBack} className="btn-primary mt-4 px-6 py-2 rounded-lg">Volver</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
          <Shield size={24} className="text-purple-400" />
          Panel de Administración
        </h2>
        <button onClick={onBack} className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg">
          <ArrowLeft size={18} />
          Volver
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-elevated rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users size={20} className="text-blue-400" />
            <p className="text-sm text-slate-400">Total Usuarios</p>
          </div>
          <p className="text-3xl font-bold text-white">{users.length}</p>
        </div>
        <div className="card-elevated rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={20} className="text-purple-400" />
            <p className="text-sm text-slate-400">Administradores</p>
          </div>
          <p className="text-3xl font-bold text-white">{users.filter(u => u.role === 'admin').length}</p>
        </div>
        <div className="card-elevated rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users size={20} className="text-emerald-400" />
            <p className="text-sm text-slate-400">Usuarios Regulares</p>
          </div>
          <p className="text-3xl font-bold text-white">{users.filter(u => u.role === 'user').length}</p>
        </div>
      </div>

      <div className="card-solid rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Usuarios Registrados</h3>
        <div className="space-y-3">
          {users.map(user => (
            <div key={user.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold">{user.name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      user.role === 'admin' 
                        ? 'bg-purple-500/20 text-purple-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">@{user.username}</p>
                  {user.email && <p className="text-xs text-slate-500">{user.email}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Registrado</p>
                  <p className="text-xs text-slate-500">{new Date(user.createdAt).toLocaleDateString('es-ES')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
