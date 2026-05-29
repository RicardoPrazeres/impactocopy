import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { BookmarkX, Trash2, Copy, Search, Calendar, ShieldAlert, Sparkles, Star } from 'lucide-react';

export default function Favorites({ user, savedHeadlines, onShowToast }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'dor', 'desejo', 'prova'

  const copyToClipboard = (headline, subheadline, angle) => {
    const fullText = `Headline:\n${headline}\n\nSubheadline:\n${subheadline}`;
    const textarea = document.createElement('textarea');
    textarea.value = fullText;
    textarea.style.position = 'fixed';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      onShowToast(`Copiado ângulo de ${angle.toUpperCase()}!`, "success");
    } catch (err) {
      onShowToast("Erro ao tentar copiar texto.", "error");
    }
    document.body.removeChild(textarea);
  };

  const handleUpdate = async (id, field, value) => {
    try {
      const favRef = doc(db, 'users', user.uid, 'favorites', id);
      await updateDoc(favRef, {
        [field]: value
      });
    } catch (err) {
      console.error("Erro ao atualizar no Firestore:", err);
      onShowToast("Erro ao salvar alteração.", "error");
    }
  };

  const handleRemove = async (id) => {
    try {
      const favRef = doc(db, 'users', user.uid, 'favorites', id);
      await deleteDoc(favRef);
      onShowToast("Headline removida com sucesso.", "info");
    } catch (err) {
      console.error("Erro ao remover:", err);
      onShowToast("Erro ao excluir do banco.", "error");
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Você tem certeza de que deseja excluir todas as copies salvas? Esta ação não pode ser desfeita.")) {
      try {
        const batch = writeBatch(db);
        savedHeadlines.forEach((item) => {
          const docRef = doc(db, 'users', user.uid, 'favorites', item.id);
          batch.delete(docRef);
        });
        await batch.commit();
        onShowToast("Todos os favoritos foram limpos.", "info");
      } catch (err) {
        console.error("Erro ao limpar favoritos:", err);
        onShowToast("Erro ao tentar excluir os dados.", "error");
      }
    }
  };

  // Filtrar headlines salvas baseadas na busca e no filtro ativo
  const filteredHeadlines = savedHeadlines.filter(item => {
    const matchesSearch = 
      item.headline.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.subheadline.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.explanation && item.explanation.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = activeFilter === 'all' || item.angle === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      
      {/* Título & Ações em Massa */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">Headlines Salvas</h2>
          <p className="text-stone-500 text-sm">Suas melhores ideias sincronizadas em tempo real na nuvem do Firebase.</p>
        </div>
        
        {savedHeadlines.length > 0 && (
          <button 
            onClick={handleClearAll} 
            className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 self-start md:self-center"
          >
            <Trash2 className="w-4 h-4" />
            <span>Limpar Histórico</span>
          </button>
        )}
      </div>

      {/* Barra de Filtros e Pesquisa */}
      {savedHeadlines.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-2xl border border-stone-200/60 shadow-sm">
          
          {/* Caixa de Texto de Pesquisa */}
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Pesquisar copies salvas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 rounded-xl text-sm transition bg-stone-50/30"
            />
          </div>

          {/* Filtros Rápidos por Ângulo */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto shrink-0 py-1">
            {['all', 'dor', 'desejo', 'prova'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition capitalize shrink-0 ${
                  activeFilter === filter
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-stone-50 text-stone-500 hover:bg-stone-100 hover:text-stone-800'
                }`}
              >
                {filter === 'all' ? 'Ver Todos' : filter}
              </button>
            ))}
          </div>

        </div>
      )}

      {/* Lista de Favoritos */}
      {filteredHeadlines.length > 0 ? (
        <div className="space-y-4">
          {filteredHeadlines.map((item) => {
            let tagColorClass = "bg-orange-50 text-orange-700 border-orange-100";
            let IconComponent = Sparkles;
            let angleName = "Desejo";

            if (item.angle === 'dor') {
              tagColorClass = "bg-red-50 text-red-700 border-red-100";
              IconComponent = ShieldAlert;
              angleName = "Dor";
            } else if (item.angle === 'prova') {
              tagColorClass = "bg-amber-50 text-amber-700 border-amber-100";
              IconComponent = Star;
              angleName = "Prova";
            }

            const formattedDate = item.createdAt?.seconds 
              ? new Date(item.createdAt.seconds * 1000).toLocaleDateString('pt-BR')
              : new Date().toLocaleDateString('pt-BR');

            return (
              <div 
                key={item.id} 
                className="bg-white p-6 rounded-3xl border border-stone-200/60 shadow-sm space-y-4 hover:border-orange-200 hover:shadow-md transition duration-300 relative group"
              >
                
                {/* Cabeçalho do Card individual */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border flex items-center gap-1 ${tagColorClass}`}>
                      <IconComponent className="w-3 h-3" />
                      <span>Ângulo de {angleName}</span>
                    </span>
                    <span className="text-[10px] text-stone-400 font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formattedDate}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => handleRemove(item.id)} 
                      className="p-2 rounded-xl text-stone-400 hover:text-red-650 hover:bg-red-50 transition" 
                      title="Excluir favorito"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Conteúdo de Headline Editável */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-stone-400">Headline Principal (Clique para Editar)</span>
                    <h4 
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleUpdate(item.id, 'headline', e.target.innerText)}
                      className="text-base md:text-lg font-extrabold text-stone-900 leading-snug border-b border-transparent hover:border-stone-200 focus:outline-none focus:border-orange-500 pb-0.5 cursor-text"
                    >
                      {item.headline}
                    </h4>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-stone-400">Subheadline Complementar</span>
                    <p 
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleUpdate(item.id, 'subheadline', e.target.innerText)}
                      className="text-xs md:text-sm text-stone-600 border-b border-transparent hover:border-stone-200 focus:outline-none focus:border-orange-500 pb-0.5 cursor-text"
                    >
                      {item.subheadline}
                    </p>
                  </div>
                </div>

                {/* Rodapé explicativo e botão de cópia */}
                <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-[11px] text-stone-500 italic flex items-center gap-1 leading-normal">
                    <span className="font-semibold text-stone-400 shrink-0">Motivo:</span>
                    <span>{item.explanation || "Ângulo otimizado para faturamento."}</span>
                  </p>
                  
                  <button 
                    onClick={() => copyToClipboard(item.headline, item.subheadline, item.angle)}
                    className="w-full sm:w-auto px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 self-end shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" /> 
                    <span>Copiar Tudo</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Estado Vazio (Empty State) */
        <div className="text-center py-16 bg-white/50 border-2 border-dashed border-stone-200 rounded-3xl p-8 space-y-4">
          <div className="inline-block p-4 bg-orange-50 rounded-full text-orange-500">
            <BookmarkX className="w-8 h-8" />
          </div>
          <div className="max-w-xs mx-auto space-y-1.5">
            <h4 className="font-bold text-stone-800 text-lg">
              {savedHeadlines.length > 0 ? "Nenhum resultado encontrado" : "Nenhuma copy salva ainda"}
            </h4>
            <p className="text-stone-500 text-sm">
              {savedHeadlines.length > 0 
                ? "Refine seus filtros de pesquisa para encontrar as headlines salvas correspondentes." 
                : "Gere suas headlines, navegue pelas sugestões e clique no botão de salvar para guardá-las na nuvem."}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
