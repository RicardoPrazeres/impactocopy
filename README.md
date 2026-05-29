# ImpactoCopy 🚀 - Gerador de Headlines de Alta Conversão

O **ImpactoCopy** é uma ferramenta de copywriting de alta performance desenvolvida em **React, Vite e Tailwind CSS v4**, integrada com a **Gemini API** para geração inteligente de headlines e conectada ao **Firebase** para autenticação e armazenamento na nuvem em tempo real.

---

## Recursos Principais 💎

1. **Autenticação Google**: Login seguro e isolamento de dados com Firebase Auth.
2. **Sincronização em Tempo Real**: Suas headlines favoritadas são salvas e sincronizadas instantaneamente na nuvem via Firestore.
3. **Edição Local Integrada**: Edite os resultados gerados diretamente nos cards. As alterações feitas na aba de salvas são persistidas no banco de dados automaticamente.
4. **Gerador Inteligente**: Configuração de tom de voz, nicho de mercado e ganchos psicológicos focados em Dor, Desejo e Prova Social usando o modelo Gemini 1.5 Flash.
5. **Configuração Privada**: Salve sua API Key do Gemini de forma segura diretamente no seu perfil Firestore com total privacidade.

---

## Como Executar Localmente 💻

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

---

## Publicação Automática 🌐

Este projeto está configurado para deploy automático no GitHub Pages via **GitHub Actions**. Qualquer alteração enviada para a branch `main` recompila e atualiza a aplicação online instantaneamente!
