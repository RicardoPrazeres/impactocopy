import React, { useState } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { Sparkles, PenTool, BookOpen, Bookmark, LogOut, Settings, ChevronDown } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, savedCount, onOpenSettings, user, onShowToast }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onShowToast("Logout realizado com sucesso!", "info");
    } catch (err) {
      console.error(err);
      onShowToast("Erro ao deslogar.", "error");
    }
  };

  return (
    <header className="border-b border-orange-100 bg-white/80 backdrop-blur sticky top-0 z-40 transition-all shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Branding e Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 warm-gradient rounded-xl text-white shadow-md">
            <Sparkles className="w-5.5 h-5.5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-orange-600">Alta Conversão</span>
            <h1 className="text-xl font-extrabold text-stone-900 leading-none">ImpactoCopy</h1>
          </div>
        </div>
        
        {/* Navegação e Controles */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <nav className="flex items-center gap-1 bg-stone-50 p-1 rounded-xl border border-stone-200/60">
            <button 
              onClick={() => setActiveTab('generator')} 
              className={`px-3 py-2 rounded-lg text-xs md:text-sm font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'generator' 
                  ? 'bg-white text-orange-700 shadow-sm border border-stone-200/40' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <PenTool className="w-4 h-4 text-orange-500" />
              <span>Gerador</span>
            </button>
            <button 
              onClick={() => setActiveTab('formulas')} 
              className={`px-3 py-2 rounded-lg text-xs md:text-sm font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'formulas' 
                  ? 'bg-white text-orange-700 shadow-sm border border-stone-200/40' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-orange-500" />
              <span>Fórmulas de Copy</span>
            </button>
            <button 
              onClick={() => setActiveTab('favorites')} 
              className={`px-3 py-2 rounded-lg text-xs md:text-sm font-semibold transition flex items-center gap-1.5 relative ${
                activeTab === 'favorites' 
                  ? 'bg-white text-orange-700 shadow-sm border border-stone-200/40' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Bookmark className="w-4 h-4 text-orange-500" />
              <span>Salvas</span>
              {savedCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold animate-bounce shadow-md">
                  {savedCount}
                </span>
              )}
            </button>
          </nav>

          <span className="w-px h-6 bg-stone-200 hidden sm:block" />

          {/* Card de Perfil e Dropdown de Ações */}
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 hover:bg-stone-50 rounded-xl border border-stone-200/40 transition active:scale-[0.98] bg-white text-left"
            >
              <img 
                src={user?.photoURL || 'https://lh3.googleusercontent.com/a/default-user=s96-c'} 
                alt="Foto de perfil" 
                className="w-8 h-8 rounded-lg object-cover border border-stone-200"
                referrerPolicy="no-referrer"
              />
              <div className="hidden md:block pr-1">
                <p className="text-xs font-bold text-stone-800 leading-tight truncate max-w-[100px]">
                  {user?.displayName?.split(' ')[0]}
                </p>
                <p className="text-[10px] text-stone-400 font-semibold leading-none truncate max-w-[100px]">
                  Painel
                </p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <>
                {/* Camada transparente para fechar dropdown clickout */}
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white border border-stone-150 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-stone-100">
                    <p className="text-xs font-bold text-stone-800">{user?.displayName}</p>
                    <p className="text-[10px] text-stone-400 truncate">{user?.email}</p>
                  </div>
                  
                  {/* Opção de Configurações */}
                  <button 
                    onClick={() => {
                      onOpenSettings();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-stone-700 hover:text-stone-900 hover:bg-stone-50 text-xs font-semibold flex items-center gap-2 transition"
                  >
                    <Settings className="w-4 h-4 text-stone-400" />
                    <span>Configurar API Key</span>
                  </button>

                  <div className="w-full border-t border-stone-100 my-1" />

                  {/* Opção de Logout */}
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-bold flex items-center gap-2 transition"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span>Sair da Conta</span>
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
