import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { X, Key, ShieldCheck, ExternalLink } from 'lucide-react';

export default function SettingsModal({ user, onClose, onShowToast }) {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Carrega a chave do Firestore se ela existir
    const fetchApiKey = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().geminiApiKey) {
          setApiKey(userSnap.data().geminiApiKey);
        }
      } catch (err) {
        console.error("Erro ao carregar a API Key:", err);
      }
    };
    fetchApiKey();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        geminiApiKey: apiKey.trim()
      }, { merge: true });
      onShowToast("Chave API salva com sucesso!", "success");
      onClose();
    } catch (err) {
      console.error("Erro ao salvar chave API:", err);
      onShowToast("Erro ao salvar chave API.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Camada de fundo (backdrop) */}
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Caixa do modal */}
      <div className="bg-white rounded-3xl border border-orange-100 max-w-md w-full p-6 md:p-8 relative z-10 shadow-2xl warm-glow transform transition-all duration-300 animate-in fade-in zoom-in-95">
        
        {/* Botão de fechar */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Título e ícone */}
        <div className="flex items-center gap-3 pb-4 border-b border-stone-100 mb-6">
          <div className="p-2 bg-orange-50 text-orange-500 rounded-xl">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-lg">Configurar API Key</h3>
            <p className="text-xs text-stone-500">Chave de IA para o Gerador de Headlines</p>
          </div>
        </div>

        {/* Formulário de configuração */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-stone-700 flex justify-between">
              <span>Chave API do Gemini *</span>
              <a 
                href="https://aistudio.google.com/" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-0.5"
              >
                Obter chave grátis <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Cole sua API Key do Gemini aqui..."
              required
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm transition warm-glow-focus bg-stone-50/50"
            />
          </div>

          {/* Badge de privacidade */}
          <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-start gap-2.5 text-emerald-850 text-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Sua chave é armazenada de forma estritamente privada no seu perfil Firestore e é usada diretamente para requisições de geração de copy.
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-stone-200 hover:bg-stone-50 rounded-xl font-bold text-sm text-stone-600 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 warm-gradient hover:opacity-95 text-white rounded-xl font-bold text-sm transition shadow-md disabled:opacity-70 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/50 border-t-white" />
              ) : (
                "Salvar Chave"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
