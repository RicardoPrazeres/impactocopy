import React from 'react';
import { BookOpen, AlertCircle, Compass, Sparkles, HelpCircle } from 'lucide-react';

export default function Formulas() {
  const formulasData = [
    {
      title: "AIDA",
      badge: "Fórmula Clássica",
      badgeColor: "bg-orange-50 text-orange-600 border-orange-100",
      description: "Atenção, Interesse, Desejo, Ação. Comece quebrando o padrão de pensamento do usuário, mostre que você o entende, faça-o desejar o resultado e conduza-o para a ação imediata.",
      example: '"Como aprender inglês sem gramática maçante (Atenção)..."',
      icon: Compass,
      iconColor: "text-orange-500 bg-orange-50"
    },
    {
      title: "PAS",
      badge: "Fórmula de Dor",
      badgeColor: "bg-red-50 text-red-600 border-red-100",
      description: "Problema, Agitação, Solução. Identifique uma dor latente do seu cliente ideal, esfregue sal na ferida agravando os efeitos desse problema se não resolvido, e então introduza sua oferta como o único alívio.",
      example: '"Cansado de ver seu dinheiro sumindo no tráfego pago sem retorno?..."',
      icon: AlertCircle,
      iconColor: "text-red-500 bg-red-50"
    },
    {
      title: "A Regra de Um (The Rule of One)",
      badge: "Fórmula de Foco",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-100",
      description: "Foque em apenas Uma grande ideia, Uma promessa central, Um único benefício transformador ou Um público muito específico. Tentar falar tudo para todos destrói a conversão.",
      example: '"O único método comprovado para destravar sua fala no inglês em 3 meses"',
      icon: Sparkles,
      iconColor: "text-amber-500 bg-amber-50"
    },
    {
      title: "Laço Aberto (Open Loop)",
      badge: "Fórmula de Curiosidade",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-100",
      description: "Abra uma brecha de curiosidade na mente do seu público que só pode ser fechada ao continuar lendo a sua página de vendas ou assistindo o seu vídeo (VSL).",
      example: '"O erro bobo que 93% dos afiliados cometem no gerenciador de anúncios"',
      icon: HelpCircle,
      iconColor: "text-purple-500 bg-purple-50"
    }
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Apresentação */}
      <div className="text-center space-y-2 max-w-lg mx-auto">
        <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight flex items-center justify-center gap-2">
          <BookOpen className="w-7 h-7 text-orange-500 animate-pulse" />
          <span>Manual de Copywriting</span>
        </h2>
        <p className="text-stone-500 text-sm leading-relaxed">
          Entenda a ciência por trás de cada gancho psicológico para estruturar discursos que prendem a atenção e vendem muito mais.
        </p>
      </div>

      {/* Grid de Fórmulas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {formulasData.map((formula, idx) => {
          const IconComp = formula.icon;
          return (
            <div 
              key={idx}
              className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200/60 shadow-sm hover:border-orange-200 hover:shadow-md transition-all duration-300 relative group overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Cabeçalho do Card */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${formula.badgeColor}`}>
                    {formula.badge}
                  </span>
                  <div className={`p-2 rounded-xl ${formula.iconColor}`}>
                    <IconComp className="w-4.5 h-4.5" />
                  </div>
                </div>

                {/* Conteúdo principal */}
                <h3 className="text-xl font-bold text-stone-900 mb-3 group-hover:text-orange-600 transition-colors">
                  {formula.title}
                </h3>
                <p className="text-stone-600 text-xs md:text-sm mb-6 leading-relaxed">
                  {formula.description}
                </p>
              </div>

              {/* Caixa de Exemplo de Uso */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 text-xs text-stone-500 font-mono italic">
                {formula.example}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
