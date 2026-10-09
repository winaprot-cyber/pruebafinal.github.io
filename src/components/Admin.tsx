import { Users } from 'lucide-react';
import type { useStore } from '../store/useStore';

export default function Admin({ store }: { store: ReturnType<typeof useStore> }) {
  const users = store.getAllUsers();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Users size={24} className="text-purple-400" />
        Panel de Administración
      </h2>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-400 mb-4">Usuarios Registrados</h3>
        <div className="space-y-3">
          {users.map(user => (
            <div key={user.id} className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-white font-medium">{user.name}</p>
                  <p className="text-sm text-slate-400">@{user.username}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                </span>
              </div>
              {user.email && <p className="text-xs text-slate-500">{user.email}</p>}
              <p className="text-xs text-slate-500 mt-1">
                Registrado: {new Date(user.createdAt).toLocaleDateString('es-ES')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
