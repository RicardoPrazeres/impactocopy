import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Sparkles, Sliders, Zap, RotateCw, ShieldAlert, Star, Bookmark, Copy, Info, Key } from 'lucide-react';

const loadingSteps = [
  "Analisando o avatar e público-alvo...",
  "Injetando gatilhos mentais e antecipação...",
  "Mapeando dores psicológicas cruciais...",
  "Lapidando promessas irresistíveis...",
  "Estruturando ganchos para quebra de objeção..."
];

export default function Generator({ user, userApiKey, onOpenSettings, onShowToast }) {
  const [product, setProduct] = useState('');
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState('Persuasivo');
  const [niche, setNiche] = useState('Geral');
  
  const [loading, setLoading] = useState(false);
  const [loaderStep, setLoaderStep] = useState(loadingSteps[0]);
  const [results, setResults] = useState(null);

  // Estados locais para edição em tempo real das headlines geradas
  const [editedResults, setEditedResults] = useState({
    dor: { headline: '', subheadline: '', explicacao: '' },
    desejo: { headline: '', subheadline: '', explicacao: '' },
    prova: { headline: '', subheadline: '', explicacao: '' }
  });

  // Ciclar entre as mensagens de loading imersivas
  useEffect(() => {
    let interval;
    if (loading) {
      let currentStep = 0;
      interval = setInterval(() => {
        currentStep = (currentStep + 1) % loadingSteps.length;
        setLoaderStep(loadingSteps[currentStep]);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async () => {
    if (!product.trim()) {
      onShowToast("Por favor, preencha o campo do produto ou oferta!", "error");
      return;
    }

    if (!userApiKey) {
      onShowToast("Configure sua API Key para poder gerar!", "info");
      onOpenSettings();
      return;
    }

    setLoading(true);
    setResults(null);

    const systemPrompt = `Você é um copywriter de resposta direta de elite (nível Stefan Georgi e Justin Goff).
O seu objetivo é estruturar 3 tipos específicos de Headlines para atrair compradores, baseadas na descrição do produto, público e nicho informados pelo usuário.
Retorne um objeto JSON contendo exatamente três chaves principais: "dor", "desejo" e "prova".
Cada uma destas chaves deve conter um objeto com os seguintes campos string:
- "headline": O título principal de alta conversão, chamativo e impossível de ignorar.
- "subheadline": Um subtítulo de apoio que constrói curiosidade e estimula o clique.
- "explicacao": Um breve feedback de uma frase explicando por que este ângulo funciona.

Exemplo de estrutura de resposta esperada:
{
  "dor": {
    "headline": "O erro de R$ 5,47 no Tráfego que está destruindo seu ROI semanal",
    "subheadline": "Descubra o vazamento invisível que a maioria dos gestores ignora até zerar a conta bancária.",
    "explicacao": "Ativa a aversão à perda rápida ao expor uma falha financeira comum."
  },
  "desejo": {
    "headline": "...",
    "subheadline": "...",
    "explicacao": "..."
  },
  "prova": {
    "headline": "...",
    "subheadline": "...",
    "explicacao": "..."
  }
}`;

    const userPrompt = `Gere headlines altamente persuasivas para o produto a seguir.
Produto/Oferta: "${product}"
Público Alvo Principal: "${audience || 'Pessoas com interesse real no tema'}"
Tom de Voz Solicitado: "${tone}"
Nicho do Mercado: "${niche}"

Instruções adicionais de copywriting:
1. Para o ângulo de DOR: Toque em frustrações diárias, no cansaço, na falta de tempo ou dinheiro do público.
2. Para o ângulo de DESEJO: Foque no ganho rápido, no status, na liberdade, na transformação rápida e desejável.
3. Para o ângulo de PROVA: Foque em estudos científicos, números agressivos plausíveis, autoridade, validação empírica ou sensação de método testado e comprovado.
Por favor, responda exclusivamente com o objeto JSON estruturado válido em Português do Brasil.`;

    // Utiliza o endpoint de desenvolvimento v1beta que suporta structured JSON e systemInstruction
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${userApiKey}`;

    const payload = {
      contents: [{ parts: [{ text: userPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            dor: {
              type: "OBJECT",
              properties: {
                headline: { type: "STRING" },
                subheadline: { type: "STRING" },
                explicacao: { type: "STRING" }
              },
              required: ["headline", "subheadline", "explicacao"]
            },
            desejo: {
              type: "OBJECT",
              properties: {
                headline: { type: "STRING" },
                subheadline: { type: "STRING" },
                explicacao: { type: "STRING" }
              },
              required: ["headline", "subheadline", "explicacao"]
            },
            prova: {
              type: "OBJECT",
              properties: {
                headline: { type: "STRING" },
                subheadline: { type: "STRING" },
                explicacao: { type: "STRING" }
              },
              required: ["headline", "subheadline", "explicacao"]
            }
          },
          required: ["dor", "desejo", "prova"]
        }
      },
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      }
    };

    try {
      let response;
      let delay = 1000;
      const maxRetries = 3;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (response.ok) break;
        } catch (err) {
          if (attempt === maxRetries) throw err;
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }

      if (!response || !response.ok) {
        let errorMsg = "Erro na comunicação com a IA.";
        try {
          const errData = await response.json();
          if (errData && errData.error && errData.error.message) {
            errorMsg = `Erro: ${errData.error.message}`;
          }
        } catch (_) {}
        throw new Error(errorMsg);
      }

      const result = await response.json();
      const candidate = result.candidates?.[0];

      if (candidate && candidate.content?.parts?.[0]?.text) {
        const jsonResponse = JSON.parse(candidate.content.parts[0].text);
        setResults(jsonResponse);
        setEditedResults(jsonResponse);
        onShowToast("Novas Headlines geradas com sucesso!", "success");
      } else {
        throw new Error("Resposta inválida do servidor.");
      }

    } catch (err) {
      console.error(err);
      onShowToast(err.message || "Erro na geração. Verifique sua API Key nas configurações.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLiveEdit = (angle, field, value) => {
    setEditedResults(prev => ({
      ...prev,
      [angle]: {
        ...prev[angle],
        [field]: value
      }
    }));
  };

  const handleSaveHeadline = async (angle) => {
    const dataToSave = editedResults[angle];
    if (!dataToSave.headline) return;

    try {
      const favsRef = collection(db, 'users', user.uid, 'favorites');
      await addDoc(favsRef, {
        angle: angle,
        headline: dataToSave.headline,
        subheadline: dataToSave.subheadline,
        explanation: dataToSave.explicacao,
        createdAt: serverTimestamp()
      });
      onShowToast("Copy salva nos favoritos!", "success");
    } catch (err) {
      console.error("Erro ao salvar favorito:", err);
      onShowToast("Erro ao salvar no banco.", "error");
    }
  };

  const copyToClipboard = (angle) => {
    const dataToCopy = editedResults[angle];
    const fullText = `Headline:\n${dataToCopy.headline}\n\nSubheadline:\n${dataToCopy.subheadline}`;

    const textarea = document.createElement('textarea');
    textarea.value = fullText;
    textarea.style.position = 'fixed';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand('copy');
      onShowToast(`Ângulo de ${angle.toUpperCase()} copiado!`, "success");
    } catch (err) {
      onShowToast("Erro ao tentar copiar texto.", "error");
    }
    document.body.removeChild(textarea);
  };

  return (
    <div className="space-y-8">
      {/* Título e introdução */}
      <div className="text-center max-w-2xl mx-auto space-y-3 mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
          Transforme ofertas comuns em <span className="text-transparent bg-clip-text warm-gradient font-black">headlines magnéticas</span>
        </h2>
        <p className="text-stone-600 text-sm md:text-base leading-relaxed">
          Escreva sobre o seu produto ou serviço e deixe que a inteligência de copywriting de alta conversão estruture 3 ganchos psicológicos irrecusáveis.
        </p>
      </div>

      {/* Alerta de chave de API pendente */}
      {!userApiKey && (
        <div className="max-w-xl mx-auto p-4 bg-orange-50 border border-orange-100 rounded-3xl flex items-center justify-between gap-4 shadow-sm animate-pulse">
          <div className="flex items-center gap-2.5 text-orange-900 text-xs font-semibold">
            <Key className="w-5 h-5 text-orange-500 shrink-0" />
            <span>Configure sua API Key do Gemini antes de gerar as headlines.</span>
          </div>
          <button 
            onClick={onOpenSettings}
            className="px-3.5 py-1.5 bg-orange-600 text-white rounded-xl text-[11px] font-extrabold hover:bg-orange-700 transition shadow-sm"
          >
            Configurar
          </button>
        </div>
      )}

      {/* Layout de duas colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Coluna Esquerda: Formulário de Configuração */}
        <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-3xl border border-orange-100 warm-glow space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-stone-100">
            <Sliders className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-stone-900 text-lg">Configurar Oferta</h3>
          </div>

          {/* O que está vendendo? */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-stone-700 flex justify-between">
              <span>O que você está vendendo? *</span>
              <span className="text-[10px] font-normal text-stone-400">Ex: Mentoria de Tráfego Pago</span>
            </label>
            <textarea 
              rows="3" 
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm transition warm-glow-focus bg-stone-50/50 resize-none"
              placeholder="Descreva o seu produto, curso, mentoria ou serviço de forma clara..."
            />
          </div>

          {/* Público Alvo */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-stone-700 flex justify-between">
              <span>Quem é o público-alvo?</span>
              <span className="text-[10px] font-normal text-stone-400">Ex: Prestadores de serviço</span>
            </label>
            <input 
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm transition warm-glow-focus bg-stone-50/50"
              placeholder="Para quem é essa oferta? (Opcional)"
            />
          </div>

          {/* Seletores de Tom de voz e Nicho */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-stone-700">Tom de Voz</label>
              <select 
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs md:text-sm transition warm-glow-focus bg-stone-50/50"
              >
                <option value="Persuasivo">Persuasivo</option>
                <option value="Direto e Objetivo">Direto</option>
                <option value="Altamente Emocional">Emocional</option>
                <option value="Curioso e Intrigante">Curioso</option>
                <option value="Com Urgência">Urgente</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-stone-700">Nicho Principal</label>
              <select 
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs md:text-sm transition warm-glow-focus bg-stone-50/50"
              >
                <option value="Geral">Geral / Negócios</option>
                <option value="Saúde e Bem-estar">Saúde & Fitness</option>
                <option value="Marketing e Vendas">Marketing & Vendas</option>
                <option value="Finanças e Investimentos">Finanças</option>
                <option value="Desenvolvimento Pessoal">Educação</option>
              </select>
            </div>
          </div>

          {/* Botão de Geração */}
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="w-full warm-gradient text-white py-4 rounded-xl font-bold text-base hover:opacity-95 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 disabled:opacity-85"
          >
            <Zap className="w-5 h-5 animate-pulse" />
            <span>Gerar Headlines de Impacto</span>
          </button>
        </div>

        {/* Coluna Direita: Dashboard de Resultados Gerados */}
        <div className="lg:col-span-7 space-y-6 min-h-[400px]">
          
          {/* Estado Inicial (Empty State) */}
          {!loading && !results && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-stone-200 rounded-3xl bg-white/50 space-y-4 py-20">
              <div className="p-4 bg-orange-50 rounded-full text-orange-500">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="max-w-sm space-y-1.5">
                <h4 className="font-bold text-stone-800 text-lg">Sua copy aparecerá aqui</h4>
                <p className="text-stone-500 text-xs md:text-sm">Preencha os dados à esquerda e gere variações estruturadas otimizadas para faturar mais com sua oferta.</p>
              </div>
            </div>
          )}

          {/* Estado de Carregamento Imersivo */}
          {loading && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-orange-100 warm-glow flex items-center gap-4 animate-in fade-in">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-200 border-t-orange-600" />
                <div>
                  <h4 className="font-bold text-stone-900">{loaderStep}</h4>
                  <p className="text-xs text-stone-500">Analisando o comportamento do seu público-alvo.</p>
                </div>
              </div>

              {/* Skeletal Loaders do visual dos cards */}
              <div className="space-y-4 animate-pulse">
                <div className="h-44 bg-stone-100 border border-stone-200/40 rounded-3xl" />
                <div className="h-44 bg-stone-100 border border-stone-200/40 rounded-3xl" />
                <div className="h-44 bg-stone-100 border border-stone-200/40 rounded-3xl" />
              </div>
            </div>
          )}

          {/* Exibição dos Resultados Gerados */}
          {!loading && results && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              
              {/* Cabeçalho de Ações dos Resultados */}
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-stone-950 text-xl flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
                  <span>Suas Headlines Estruturadas</span>
                </h3>
                <button 
                  onClick={handleGenerate} 
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 hover:bg-orange-100 px-3.5 py-2 rounded-full transition"
                >
                  <RotateCw className="w-3.5 h-3.5" /> 
                  <span>Refazer Geração</span>
                </button>
              </div>

              {/* Card 1: Ângulo de Dor */}
              <div className="bg-white rounded-3xl border border-red-100 overflow-hidden shadow-sm warm-glow relative transition-all hover:border-red-200">
                <div className="bg-red-50 px-6 py-3 border-b border-red-100/50 flex justify-between items-center">
                  <span className="text-xs font-extrabold text-red-600 tracking-wider uppercase flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" /> 
                    <span>Ângulo de Dor</span>
                  </span>
                  <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-md">Ativa urgência & identificação</span>
                </div>
                <div className="p-6 md:p-8 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-stone-400">Headline Principal (Clique para Editar)</span>
                    <h4 
                      contentEditable 
                      suppressContentEditableWarning
                      onBlur={(e) => handleLiveEdit('dor', 'headline', e.target.innerText)}
                      className="text-base md:text-lg font-extrabold text-stone-900 leading-snug border-b border-transparent hover:border-stone-200 focus:outline-none focus:border-orange-500 pb-0.5"
                    >
                      {results.dor.headline}
                    </h4>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-stone-400">Subheadline Complementar</span>
                    <p 
                      contentEditable 
                      suppressContentEditableWarning
                      onBlur={(e) => handleLiveEdit('dor', 'subheadline', e.target.innerText)}
                      className="text-xs md:text-sm text-stone-600 border-b border-transparent hover:border-stone-200 focus:outline-none focus:border-orange-500 pb-0.5"
                    >
                      {results.dor.subheadline}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-[11px] text-stone-500 flex items-center gap-1 italic">
                      <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{results.dor.explicacao}</span>
                    </p>
                    <div className="flex items-center gap-2 self-end shrink-0">
                      <button 
                        onClick={() => handleSaveHeadline('dor')} 
                        className="p-2.5 rounded-xl bg-stone-50 hover:bg-orange-50 hover:text-orange-600 text-stone-500 border border-stone-200/40 transition" 
                        title="Salvar nos Favoritos"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => copyToClipboard('dor')} 
                        className="px-4 py-2.5 bg-stone-900 hover:bg-stone-850 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" /> 
                        <span>Copiar Tudo</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Ângulo de Desejo */}
              <div className="bg-white rounded-3xl border border-amber-100 overflow-hidden shadow-sm warm-glow relative transition-all hover:border-amber-200">
                <div className="bg-amber-50 px-6 py-3 border-b border-amber-100/50 flex justify-between items-center">
                  <span className="text-xs font-extrabold text-amber-700 tracking-wider uppercase flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" /> 
                    <span>Ângulo de Desejo / Aspiração</span>
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md">Ativa prazer & futuro brilhante</span>
                </div>
                <div className="p-6 md:p-8 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-stone-400">Headline Principal (Clique para Editar)</span>
                    <h4 
                      contentEditable 
                      suppressContentEditableWarning
                      onBlur={(e) => handleLiveEdit('desejo', 'headline', e.target.innerText)}
                      className="text-base md:text-lg font-extrabold text-stone-900 leading-snug border-b border-transparent hover:border-stone-200 focus:outline-none focus:border-orange-500 pb-0.5"
                    >
                      {results.desejo.headline}
                    </h4>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-stone-400">Subheadline Complementar</span>
                    <p 
                      contentEditable 
                      suppressContentEditableWarning
                      onBlur={(e) => handleLiveEdit('desejo', 'subheadline', e.target.innerText)}
                      className="text-xs md:text-sm text-stone-600 border-b border-transparent hover:border-stone-200 focus:outline-none focus:border-orange-500 pb-0.5"
                    >
                      {results.desejo.subheadline}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-[11px] text-stone-500 flex items-center gap-1 italic">
                      <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{results.desejo.explicacao}</span>
                    </p>
                    <div className="flex items-center gap-2 self-end shrink-0">
                      <button 
                        onClick={() => handleSaveHeadline('desejo')} 
                        className="p-2.5 rounded-xl bg-stone-50 hover:bg-orange-50 hover:text-orange-600 text-stone-500 border border-stone-200/40 transition" 
                        title="Salvar nos Favoritos"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => copyToClipboard('desejo')} 
                        className="px-4 py-2.5 bg-stone-900 hover:bg-stone-850 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" /> 
                        <span>Copiar Tudo</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Ângulo de Prova */}
              <div className="bg-white rounded-3xl border border-orange-100 overflow-hidden shadow-sm warm-glow relative transition-all hover:border-orange-200">
                <div className="bg-orange-50 px-6 py-3 border-b border-orange-100/50 flex justify-between items-center">
                  <span className="text-xs font-extrabold text-orange-700 tracking-wider uppercase flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-orange-650" /> 
                    <span>Ângulo de Prova / Resultados</span>
                  </span>
                  <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-md">Reduz barreira de ceticismo</span>
                </div>
                <div className="p-6 md:p-8 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-stone-400">Headline Principal (Clique para Editar)</span>
                    <h4 
                      contentEditable 
                      suppressContentEditableWarning
                      onBlur={(e) => handleLiveEdit('prova', 'headline', e.target.innerText)}
                      className="text-base md:text-lg font-extrabold text-stone-900 leading-snug border-b border-transparent hover:border-stone-200 focus:outline-none focus:border-orange-500 pb-0.5"
                    >
                      {results.prova.headline}
                    </h4>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-stone-400">Subheadline Complementar</span>
                    <p 
                      contentEditable 
                      suppressContentEditableWarning
                      onBlur={(e) => handleLiveEdit('prova', 'subheadline', e.target.innerText)}
                      className="text-xs md:text-sm text-stone-600 border-b border-transparent hover:border-stone-200 focus:outline-none focus:border-orange-500 pb-0.5"
                    >
                      {results.prova.subheadline}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-[11px] text-stone-500 flex items-center gap-1 italic">
                      <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{results.prova.explicacao}</span>
                    </p>
                    <div className="flex items-center gap-2 self-end shrink-0">
                      <button 
                        onClick={() => handleSaveHeadline('prova')} 
                        className="p-2.5 rounded-xl bg-stone-50 hover:bg-orange-50 hover:text-orange-600 text-stone-500 border border-stone-200/40 transition" 
                        title="Salvar nos Favoritos"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => copyToClipboard('prova')} 
                        className="px-4 py-2.5 bg-stone-900 hover:bg-stone-850 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" /> 
                        <span>Copiar Tudo</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
