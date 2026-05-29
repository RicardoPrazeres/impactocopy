import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { ShieldCheck, Check, Info, AlertTriangle } from 'lucide-react';

import Login from './components/Login';
import Header from './components/Header';
import Generator from './components/Generator';
import Formulas from './components/Formulas';
import Favorites from './components/Favorites';
import SettingsModal from './components/SettingsModal';

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('generator');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userApiKey, setUserApiKey] = useState('');
  const [globalApiKey, setGlobalApiKey] = useState('');
  const [savedHeadlines, setSavedHeadlines] = useState([]);
  
  // Estado das notificações flutuantes (Toast)
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    // Fecha automaticamente após 3 segundos
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  useEffect(() => {
    // Monitora o estado de autenticação em tempo real
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setUserApiKey('');
      setGlobalApiKey('');
      setSavedHeadlines([]);
      return;
    }

    // 1. Escuta em tempo real a chave do Gemini salva no perfil do Firestore do usuário
    const unsubscribeUserDoc = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setUserApiKey(docSnap.data().geminiApiKey || '');
      } else {
        setUserApiKey('');
      }
    }, (err) => {
      console.error("Erro escutando documento do usuário:", err);
    });

    // 2. Escuta em tempo real a Chave Mestra global do app (settings/global) no Firestore
    const unsubscribeGlobalDoc = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setGlobalApiKey(docSnap.data().geminiApiKey || '');
      } else {
        setGlobalApiKey('');
      }
    }, (err) => {
      console.error("Erro ao escutar Chave Mestra global:", err);
    });

    // 3. Escuta em tempo real as headlines favoritas salvas no Firestore
    const favsQuery = query(
      collection(db, 'users', user.uid, 'favorites'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeFavorites = onSnapshot(favsQuery, (querySnapshot) => {
      const headlines = [];
      querySnapshot.forEach((doc) => {
        headlines.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setSavedHeadlines(headlines);
    }, (err) => {
      console.error("Erro ao carregar favoritos:", err);
    });

    return () => {
      unsubscribeUserDoc();
      unsubscribeGlobalDoc();
      unsubscribeFavorites();
    };
  }, [user]);

  // Tela de carregamento premium inicializando conexões
  if (loadingAuth) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fdfbf7] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600" />
        <div className="text-center space-y-1">
          <h3 className="font-bold text-stone-900 text-lg">Iniciando Central de Copy...</h3>
          <p className="text-xs text-stone-500 font-semibold uppercase tracking-widest">Sincronizando Firebase</p>
        </div>
      </div>
    );
  }

  // Redireciona para tela de login caso não esteja autenticado
  if (!user) {
    return <Login onShowToast={showToast} />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between text-stone-800 bg-[#fdfbf7] antialiased">
      
      {/* Cabeçalho do App */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        savedCount={savedHeadlines.length}
        onOpenSettings={() => setSettingsOpen(true)}
        user={user}
        onShowToast={showToast}
      />

      {/* Área de conteúdo dinâmica */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8 relative">
        {activeTab === 'generator' && (
          <Generator 
            user={user}
            userApiKey={userApiKey || globalApiKey}
            onOpenSettings={() => setSettingsOpen(true)}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'formulas' && <Formulas />}

        {activeTab === 'favorites' && (
          <Favorites 
            user={user}
            savedHeadlines={savedHeadlines}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Rodapé institucional */}
      <footer className="border-t border-stone-200 bg-white py-6 mt-12 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500 font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-orange-500 shrink-0" />
            <span>Gerações alinhadas com técnicas avançadas de neuromarketing e copy real.</span>
          </div>
          <div>
            <span>ImpactoCopy © 2026. Feito com amor e foco em conversão.</span>
          </div>
        </div>
      </footer>

      {/* Modal seguro de API Key */}
      {settingsOpen && (
        <SettingsModal 
          user={user}
          onClose={() => setSettingsOpen(false)}
          onShowToast={showToast}
        />
      )}

      {/* Alertas de Notificação Flutuantes (Toasts) */}
      {toast.visible && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 transition-all duration-300 transform animate-in slide-in-from-bottom-5">
          <div className={`p-1 rounded-full ${
            toast.type === 'success' ? 'bg-emerald-500' :
            toast.type === 'info' ? 'bg-blue-500' : 'bg-red-500'
          }`}>
            {toast.type === 'success' && <Check className="w-4 h-4 text-white" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-white" />}
            {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-white" />}
          </div>
          <span className="text-xs md:text-sm font-semibold">{toast.message}</span>
        </div>
      )}

    </div>
  );
}
