import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { Sparkles, AlertCircle } from 'lucide-react';

export default function Login({ onShowToast }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      onShowToast("Login realizado com sucesso!", "success");
    } catch (err) {
      console.error("Erro no signInWithPopup:", err);
      // Códigos comuns onde popups falham ou são bloqueados (especialmente em WebViews ou Safari mobile)
      if (
        err.code === 'auth/popup-blocked' || 
        err.code === 'auth/operation-not-supported' ||
        err.code === 'auth/popup-closed-by-user' ||
        /iPad|iPhone|iPod/.test(navigator.userAgent) // Forçar redirect em iOS por conta do ITP se der erro
      ) {
        try {
          console.log("[ImpactoCopy] Popup bloqueado ou não suportado. Tentando signInWithRedirect...");
          await signInWithRedirect(auth, googleProvider);
        } catch (redirErr) {
          console.error("Erro no signInWithRedirect:", redirErr);
          setError("O seu navegador bloqueou o login. Por favor, tente abrir o link diretamente no Chrome ou Safari.");
          onShowToast("Falha na autenticação", "error");
        }
      } else {
        setError("Ocorreu um erro ao fazer login. Verifique sua conexão e tente novamente.");
        onShowToast("Falha na autenticação", "error");
      }
    } finally {
      // Nota: Não desativamos o loading se redirecionou, pois a página vai recarregar
      if (!window.location.search.includes('redirect')) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#fdfbf7]">
      {/* Elementos ambientais de gradiente dinâmico */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-200/40 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-red-200/30 blur-[120px] pointer-events-none" />

      {/* Card de vidro principal */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-orange-100/50 shadow-2xl rounded-[2.5rem] p-8 md:p-10 warm-glow relative z-10 transition-all duration-300">
        
        {/* Cabeçalho de marca */}
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <div className="p-4 warm-gradient rounded-2xl text-white shadow-lg shadow-orange-500/20 transform hover:scale-105 transition-all">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-extrabold tracking-wider uppercase text-orange-600">Alta Conversão</span>
            <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">ImpactoCopy</h1>
          </div>
          <p className="text-stone-600 text-sm max-w-xs">
            Acesse com sua conta Google para gerar e salvar headlines de alta performance integradas com IA.
          </p>
        </div>

        {/* Área de conteúdo e ação */}
        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Botão de login do Google Premium */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white border border-stone-200/80 hover:border-orange-200 text-stone-700 hover:text-stone-900 font-bold py-4 px-6 rounded-2xl transition duration-300 flex items-center justify-center gap-3 shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-stone-300 border-t-orange-600" />
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 0, 0)">
                    <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.05,3.1v2.58h3.31c1.94,-1.78 3.06,-4.41 3.06,-7.48C21.7,11.89 21.57,11.39 21.35,11.1z" fill="#4285F4" />
                    <path d="M12,20.6c2.43,0 4.47,-0.81 5.96,-2.2l-3.31,-2.58c-0.92,0.62 -2.1,0.98 -3.53,0.98c-2.71,0 -5.01,-1.83 -5.83,-4.29H1.89v2.66C3.38,18.14 7.42,20.6 12,20.6z" fill="#34A853" />
                    <path d="M6.17,12.51c-0.21,-0.62 -0.33,-1.28 -0.33,-1.96s0.12,-1.34 0.33,-1.96V5.93H1.89C1.19,7.34 0.8,8.93 0.8,10.55s0.39,3.21 1.09,4.62L6.17,12.51z" fill="#FBBC05" />
                    <path d="M12,5.32c1.32,0 2.51,0.45 3.44,1.35l2.58,-2.58C16.46,2.72 14.42,1.9 12,1.9C7.42,1.9 3.38,4.36 1.89,7.34l4.28,3.32C6.99,7.15 9.29,5.32 12,5.32z" fill="#EA4335" />
                  </g>
                </svg>
                <span>Entrar com o Google</span>
              </>
            )}
          </button>
        </div>

        {/* Rodapé informativo */}
        <div className="mt-8 text-center text-[10px] text-stone-400 font-medium">
          Ao entrar, suas copies serão salvas com segurança em seu perfil Firebase.
        </div>
      </div>
    </div>
  );
}
