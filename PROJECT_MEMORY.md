# Memória do Projeto: Criador de Temas Virais

## Visão Geral
O **Criador de Temas Virais** é uma aplicação web focada na geração automática de ideias e roteiros de conteúdo para redes sociais (Instagram/TikTok). O projeto utiliza inteligência artificial para propor nichos, frameworks de copywriting, tons de voz e formatos (Reels, Carrossel, Post estático). 

## Arquitetura e Tecnologias
- **Frontend**: Vanilla HTML, CSS e JavaScript. Sem frameworks JS pesados.
- **Backend / IA**: O projeto utiliza Serverless Functions (`api/chat.js`) hospedadas na Vercel para se comunicar com a API da Groq (modelos LLaMA 3).
- **Banco de Dados & Autenticação**: Utiliza Supabase (tabela `profiles` e `historico`). O acesso é restrito apenas a usuários ativos (pagantes/liberados).
- **Hospedagem**: Projetado para rodar na Vercel (possui `vercel.json` para roteamento limpo de URLs como `/login`, `/admin`, etc).

## Estrutura de Arquivos Principais
- `index.html`: A aplicação principal (Wizard de 3 passos: Nicho -> Temas -> Conteúdo gerado).
- `admin.html`: Painel de administração para liberar/bloquear acessos de usuários no Supabase.
- `calendario.html`: Interface de calendário editorial com recurso de drag-and-drop para agendamento de postagens do histórico.
- `exportar.html`: Ferramenta para seleção de múltiplos conteúdos gerados e exportação para PDF formatado para impressão ou envio ao cliente.
- `historico.html`: Exibe todos os conteúdos salvos pelo usuário, permitindo busca e filtro por formato/cliente.
- `login.html`: Página de autenticação que se comunica com o Supabase.
- `api/chat.js`: Endpoint serverless responsável por se comunicar com a LLM (Groq) e devolver a resposta formatada em JSON.
- `theme.css` e `responsive.css`: Arquivos de estilos principais.
- `vercel.json`: Configurações de rotas (rewrites).

## Pontos de Atenção & Possíveis Melhorias
1. **Modularização do Código**: O código JavaScript está majoritariamente "hardcoded" dentro das tags `<script>` de cada página HTML. Isso gera duplicação (ex: lógica de autenticação do Supabase se repete em vários arquivos).
2. **Separação de Preocupações (CSS)**: Há muito CSS inserido diretamente dentro do bloco `<style>` do `index.html` e outras páginas. Ideal seria unificar o design system.
3. **Ambiente de Desenvolvimento**: O projeto não utiliza um bundler (como Vite ou Webpack), o que torna a gestão de dependências via npm manual ou dependente de CDNs.
4. **Integração com Supabase**: As credenciais anon/URL do Supabase estão expostas no client-side (o que é padrão), mas o ideal é garantir que as Row Level Security (RLS) no Supabase estejam rígidas.
5. **Configurações de Admin**: O usuário e senha do admin estão "hardcoded" em `admin.html`. Isso é um risco de segurança se o código fonte for exposto.
