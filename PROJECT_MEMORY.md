# Memória do Projeto: Criador de Temas Virais

## Visão Geral
O **Criador de Temas Virais** é uma aplicação web focada na geração automática de ideias e roteiros de conteúdo para redes sociais (Instagram/TikTok). O projeto utiliza inteligência artificial para propor nichos, frameworks de copywriting, tons de voz e formatos (Reels, Carrossel, Post estático).

## Arquitetura e Tecnologias
- **Frontend**: Vanilla HTML, CSS e JavaScript. Design System moderno baseado na paleta **Royal/Teal/Navy** (inspirado no padrão AppOfertas).
- **Backend / IA**: Serverless Functions (`api/chat.js`) na Vercel integradas com a API do **Google Gemini** (modelo **gemini-2.5-flash-lite**).
- **Banco de Dados & Autenticação**: Supabase (tabela `profiles` e `historico`). Acesso restrito a usuários ativos.
- **Hospedagem**: Vercel.

## Design System (Modernização 2026)
- **Paleta de Cores**: 
  - Teal (Principal): `#2ECFB3`
  - Royal Blue: `#2B2FD9`
  - Navy (Fundo): `#060608`
- **Tipografia**: Outfit / Inter.
- **Estética**: Glassmorphism, micro-animações, gradientes suaves e modo escuro nativo.

## Funcionalidades de IA e Otimizações
- **Engine**: Migrado de Groq para **Google Gemini**.
- **Modelo Atual**: `gemini-2.5-flash-lite` (escolhido pela alta velocidade e estabilidade sob demanda).
- **Load Balancing (Drible de RPM)**: O backend suporta rotação de chaves de API. Múltiplas chaves podem ser configuradas no `.env` (separadas por vírgula) para multiplicar o limite de 15 requisições por minuto do plano gratuito.
- **Formato Reels (Talking Head)**: Roteiros gerados especificamente para influenciadores/criadores gravarem diretamente para a câmera (câmera frontal), sem necessidade de edições complexas ou b-rolls.
- **Robustez de JSON**: Implementado sistema de extração de JSON via Regex no frontend para limpar respostas "sujas" da IA e evitar erros de parse.
- **Tokens**: Limite de saída expandido para 8192 tokens para evitar truncamento em roteiros longos.

## Estrutura de Arquivos
- `index.html`: Fluxo principal (Wizard).
- `admin.html`: Gestão de usuários.
- `calendario.html`: Agendamento visual.
- `exportar.html`: Gerador de PDF.
- `historico.html`: Repositório de conteúdos salvos.
- `api/chat.js`: Ponte para API do Gemini com suporte a múltiplas chaves.
- `theme.css`: Design System centralizado.

## Próximos Passos & Segurança
1. **Segurança do Admin**: Substituir a senha hardcoded em `admin.html` por autenticação via flag `is_admin` no Supabase Auth.
2. **Modularização**: Extrair a lógica de IA e Supabase para arquivos `.js` separados.
3. **Plano Pago**: Quando o sistema for escalado para venda real, migrar de chaves gratuitas rotativas para o plano "Pay-as-you-go" da Google Cloud para garantir 100% de uptime e alta taxa de requisições.
