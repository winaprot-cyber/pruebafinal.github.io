import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Download, Upload, User, Shield, LogOut, Smartphone } from 'lucide-react';
import type { useStore } from '../store/useStore';

interface UserMenuProps {
  store: ReturnType<typeof useStore>;
  onOpenAdmin: () => void;
}

export default function UserMenu({ store, onOpenAdmin }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const user = store.getCurrentUser()!;
  
  // Verificar si es el usuario admin especial
  const isSuperAdmin = user.username.toLowerCase() === 'dome4437';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportData = () => {
    const data = store.exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `control_biometrico_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            store.importAllData(data);
            alert('✅ Datos importados correctamente');
            window.location.reload();
          } catch (error) {
            alert('❌ Error al importar datos: archivo inválido');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
    setIsOpen(false);
  };

  const handleDownloadAPK = () => {
    // Abrir PWABuilder en una nueva pestaña para generar el APK
    const pwabuilderUrl = 'https://www.pwabuilder.com/';
    window.open(pwabuilderUrl, '_blank');
    
    // Mostrar instrucciones
    alert(
      '📱 Para generar el APK de Android:\n\n' +
      '1. Se abrió PWABuilder.com en una nueva pestaña\n' +
      '2. Ingresa la URL de tu aplicación desplegada\n' +
      '3. Haz clic en "Package for stores"\n' +
      '4. Selecciona "Android"\n' +
      '5. Descarga el archivo APK generado\n\n' +
      '📖 También puedes ver las instrucciones completas en:\n' +
      'APK_GUIDE.md en el repositorio del proyecto\n\n' +
      '⚙️ Alternativa: Usa Android Studio con Bubblewrap\n' +
      'para mayor control sobre el APK.'
    );
    setIsOpen(false);
  };

  const handleLogout = () => {
    store.logout();
    setIsOpen(false);
  };

  const handleOpenAdmin = () => {
    onOpenAdmin();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 p-2 rounded-lg transition-all hover:scale-105"
        title="Menú de usuario"
      >
        <MoreVertical size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 card-elevated rounded-xl shadow-2xl overflow-hidden z-50"
          >
            {/* User Info */}
            <div className="p-4 border-b border-slate-700/50 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{user.name}</p>
                  <p className="text-xs text-slate-400">@{user.username}</p>
                  {user.email && <p className="text-xs text-slate-500">{user.email}</p>}
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={handleExportData}
                className="w-full flex items-center gap-3 px-4 py-2 text-left text-slate-300 hover:bg-slate-700/50 transition-colors"
              >
                <Download size={18} className="text-blue-400" />
                <div>
                  <p className="text-sm font-medium">Descargar Base de Datos</p>
                  <p className="text-xs text-slate-500">Exportar todos los datos</p>
                </div>
              </button>

              <button
                onClick={handleImportData}
                className="w-full flex items-center gap-3 px-4 py-2 text-left text-slate-300 hover:bg-slate-700/50 transition-colors"
              >
                <Upload size={18} className="text-emerald-400" />
                <div>
                  <p className="text-sm font-medium">Subir Base de Datos</p>
                  <p className="text-xs text-slate-500">Importar datos desde archivo</p>
                </div>
              </button>

              <button
                onClick={handleDownloadAPK}
                className="w-full flex items-center gap-3 px-4 py-2 text-left text-slate-300 hover:bg-slate-700/50 transition-colors"
              >
                <Smartphone size={18} className="text-purple-400" />
                <div>
                  <p className="text-sm font-medium">Descargar APK para Android</p>
                  <p className="text-xs text-slate-500">Instalar como app nativa</p>
                </div>
              </button>

              {isSuperAdmin && (
                <button
                  onClick={handleOpenAdmin}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left text-slate-300 hover:bg-slate-700/50 transition-colors"
                >
                  <Shield size={18} className="text-purple-400" />
                  <div>
                    <p className="text-sm font-medium">Panel de Administración</p>
                    <p className="text-xs text-slate-500">Acceso completo de administrador</p>
                  </div>
                </button>
              )}

              <div className="border-t border-slate-700/50 my-2"></div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-left text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={18} />
                <div>
                  <p className="text-sm font-medium">Cerrar Sesión</p>
                  <p className="text-xs text-slate-500">Salir de la aplicación</p>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
