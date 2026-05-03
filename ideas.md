# Church Scale - Design Brainstorm

## Contexto
Aplicativo para gerenciamento de escalas de serviço em igrejas. Tema escuro com verde neon (#C6FF00). Foco em praticidade, organização e notificações locais.

---

## Abordagem 1: Minimalismo Moderno com Foco em Dados

**Design Movement:** Neobrutalism + Data-Driven Design

**Core Principles:**
- Hierarquia clara através de tipografia e espaçamento
- Foco em legibilidade e acessibilidade
- Estrutura grid-based com cards bem definidos
- Ênfase em números e datas como elementos visuais principais

**Color Philosophy:**
- Fundo preto puro (#000000) como base sólida
- Verde neon (#C6FF00) como destaque para ações e informações críticas
- Cinza neutro (#333333, #666666) para elementos secundários
- Branco (#FFFFFF) para texto principal
- Intenção: Contraste máximo para leitura rápida

**Layout Paradigm:**
- Sidebar vertical fixa à esquerda com navegação principal
- Conteúdo principal em cards com borders neon sutis
- Dashboard com widgets informativos (próxima escala em destaque)
- Listagens em tabelas simples com hover effects

**Signature Elements:**
- Linhas neon finas como separadores
- Badges com fundo neon e texto preto para status
- Ícones geométricos simples em neon
- Cards com borda neon (2px) em hover

**Interaction Philosophy:**
- Cliques diretos sem transições longas
- Feedback imediato com mudança de cor
- Hover states com borda neon ativada
- Confirmações visuais claras para ações destrutivas

**Animation:**
- Transições de 150ms para hover/focus
- Fade-in suave para modais (200ms)
- Pulse suave em elementos de destaque
- Slide-in de notificações pela direita

**Typography System:**
- Display: Geist Bold (títulos, datas grandes)
- Body: Inter Regular (textos, labels)
- Mono: JetBrains Mono (horários, dados técnicos)
- Hierarquia: 32px → 24px → 18px → 14px → 12px

**Probability:** 0.08

---

## Abordagem 2: Design Espiritual com Elementos Naturais

**Design Movement:** Organic Modernism + Spiritual Minimalism

**Core Principles:**
- Formas arredondadas e fluidas (border-radius 12-16px)
- Integração de elementos naturais (padrões, texturas)
- Espaçamento generoso para respiração visual
- Tipografia grande e confortável para leitura

**Color Philosophy:**
- Fundo preto com gradiente sutil para cinza escuro (#0a0a0a → #1a1a1a)
- Verde neon (#C6FF00) como luz espiritual/esperança
- Tons de terra (marrom suave #2a2a2a) para profundidade
- Branco quente (#f5f5f0) para texto
- Intenção: Sensação de paz e propósito

**Layout Paradigm:**
- Layout assimétrico com conteúdo principal centralizado
- Seções com separadores curvos (SVG waves)
- Cards com sombras suaves e blur backgrounds
- Navegação flutuante (floating action buttons)

**Signature Elements:**
- Formas orgânicas (circles, waves) em SVG
- Ícones com traços suaves (stroke-based)
- Gradientes sutis de neon para fundo de cards
- Padrão de pontos ou linhas como textura de fundo

**Interaction Philosophy:**
- Transições fluidas e suaves
- Efeitos de "respiração" em elementos importantes
- Interações que sentem naturais e não forçadas
- Feedback visual gentil

**Animation:**
- Transições de 300-400ms (mais lentas e contemplativas)
- Bounce suave em entrada de modais
- Rotate suave em ícones de ação
- Glow effect em elementos neon

**Typography System:**
- Display: Poppins Bold (títulos, sensação moderna)
- Body: Lato Regular (textos, legibilidade)
- Accent: Playfair Display (datas, elementos especiais)
- Hierarquia: 40px → 28px → 20px → 16px → 14px

**Probability:** 0.07

---

## Abordagem 3: Utilitário Futurista com Sci-Fi Vibes

**Design Movement:** Cyberpunk Minimalism + Glassmorphism

**Core Principles:**
- Elementos geométricos afiados e precisos
- Efeito de vidro fosco (glassmorphism) em cards
- Linhas e grades como estrutura visual
- Tipografia monoespacial para sensação técnica

**Color Philosophy:**
- Fundo preto absoluto (#000000) com grid sutil
- Verde neon (#C6FF00) como elemento de "energia"
- Azul elétrico (#00d9ff) como cor secundária
- Roxo escuro (#1a0033) para profundidade
- Branco puro (#ffffff) para texto crítico
- Intenção: Sensação de controle, tecnologia, futuro

**Layout Paradigm:**
- Grid rígido de 12 colunas
- Cards com glassmorphism (backdrop-filter blur)
- Barra de status no topo com informações em tempo real
- Painel de controle estilo console

**Signature Elements:**
- Linhas de grid como decoração
- Bordas neon com efeito glow
- Ícones geométricos (hexágonos, triângulos)
- Scanlines ou efeito de CRT em fundo

**Interaction Philosophy:**
- Cliques com efeito de "ativação"
- Feedback com sons visuais (sem áudio)
- Transições rápidas e precisas
- Sensação de controle absoluto

**Animation:**
- Transições de 100-150ms (rápidas)
- Efeito de flicker em ativação
- Glow pulsante em elementos ativos
- Slide rápido com easing cubic

**Typography System:**
- Display: IBM Plex Mono Bold (títulos, sensação técnica)
- Body: IBM Plex Mono Regular (textos)
- Accent: Space Mono (dados, destaque)
- Hierarquia: 36px → 24px → 18px → 14px → 12px

**Probability:** 0.06

---

## Decisão Final

**Abordagem Escolhida: Minimalismo Moderno com Foco em Dados (Abordagem 1)**

Esta abordagem foi escolhida porque:
1. **Praticidade:** Foco em dados e hierarquia clara facilita o gerenciamento rápido de escalas
2. **Acessibilidade:** Contraste máximo garante leitura fácil em qualquer ambiente
3. **Velocidade:** Interface sem animações longas permite ações rápidas
4. **Escalabilidade:** Design simples facilita adicionar novas funcionalidades
5. **Alinhamento com Marca:** Verde neon como destaque é mais impactante em design limpo

### Paleta de Cores Final
- **Fundo Principal:** #000000 (preto puro)
- **Destaque Primário:** #C6FF00 (verde neon)
- **Texto Principal:** #FFFFFF (branco)
- **Texto Secundário:** #CCCCCC (cinza claro)
- **Elementos Terciários:** #333333 (cinza escuro)
- **Borda/Hover:** #C6FF00 com opacity para efeitos

### Tipografia
- **Display/Títulos:** Geist Bold (Google Fonts)
- **Body/Textos:** Inter Regular (já incluído)
- **Dados/Horários:** JetBrains Mono (Google Fonts)

### Componentes Principais
- Sidebar com navegação
- Cards com borda neon em hover
- Badges com fundo neon
- Botões com fundo neon e texto preto
- Modais com overlay escuro
- Notificações com deslize
