# Church Scale - Gerenciador de Escalas de Serviço

Um aplicativo web moderno e prático para gerenciar escalas de serviço em igrejas, funcionando 100% offline com armazenamento local seguro.

## 🎯 Características Principais

### Gerenciamento de Escalas
- Criar, editar e deletar escalas de serviço
- Visualizar próxima escala com contagem regressiva em tempo real
- Filtrar escalas por status (pendentes, concluídas)
- Marcar escalas como "pronto" para preparação
- Concluir escalas com confirmação visual

### Cadastro de Dados
- Gerenciar voluntários reutilizáveis
- Gerenciar ministérios reutilizáveis
- Adicionar novos voluntários/ministérios durante o cadastro de escala
- Evitar digitação manual repetida

### Informações Detalhadas
Cada escala contém:
- Data e horário formatados (ex: Domingo, 10/05 às 19:00)
- Voluntário responsável
- Ministério envolvido
- Função a ser desempenhada
- Evento/culto
- O que levar (lista de itens)
- Observações opcionais

### Notificações Locais
Receba notificações automáticas:
- 3 dias antes da escala
- 1 dia antes da escala
- No dia pela manhã (8h)
- 1 hora antes da escala

Cada notificação mostra: data, função, ministério, o que levar e observações.

### Backup e Restauração
- Exportar todos os dados em JSON
- Importar dados de um backup anterior
- Deletar todos os dados (com confirmação)
- Dados salvos localmente no navegador

## 🎨 Design

**Tema:** Escuro com Verde Neon
- Fundo: Preto puro (#000000)
- Destaque: Verde neon (#C6FF00)
- Texto: Branco (#FFFFFF)
- Elementos secundários: Cinza (#333333)

**Interface:**
- Sidebar de navegação fixa
- Cards com bordas sutis
- Badges para status
- Feedback visual com toasts
- Transições suaves

## 🚀 Como Usar

### Tela Inicial
1. Visualize a próxima escala com contagem regressiva
2. Marque como "pronto" quando estiver preparado
3. Concluir a escala após realizá-la

### Gerenciar Escalas
1. Acesse "Escalas" no menu lateral
2. Clique em "Nova Escala" para criar
3. Preencha os dados da escala
4. Selecione voluntário e ministério
5. Adicione observações se necessário
6. Salve a escala

### Gerenciar Voluntários e Ministérios
1. Acesse "Voluntários" ou "Ministérios" no menu
2. Digite o nome e clique em "Adicionar"
3. Veja a lista de todos os cadastrados
4. Delete se necessário

### Backup de Dados
1. Acesse "Configurações"
2. Clique em "Exportar Backup" para salvar seus dados
3. Clique em "Importar Backup" para restaurar dados anteriores
4. Use "Deletar Todos os Dados" apenas em casos extremos

## 💾 Armazenamento

O aplicativo usa **IndexedDB** para armazenamento local:
- Funciona 100% offline
- Dados salvos no dispositivo (não na nuvem)
- Sem necessidade de internet
- Dados persistem entre sessões
- Limite de armazenamento: ~50MB por domínio

## 📊 Estrutura de Dados

### Escalas
```
{
  id: number,
  voluntarioId: number,
  ministerioId: number,
  funcao: string,
  evento: string,
  data: string (YYYY-MM-DD),
  horario: string (HH:mm),
  oQueLevar: string,
  observacoes?: string,
  concluida: boolean,
  pronto: boolean,
  criadoEm: number,
  atualizadoEm: number
}
```

### Voluntários
```
{
  id: number,
  nome: string,
  criadoEm: number
}
```

### Ministérios
```
{
  id: number,
  nome: string,
  criadoEm: number
}
```

### Notificações
```
{
  id: number,
  escalaId: number,
  tipo: 'tres_dias' | 'um_dia' | 'manha' | 'uma_hora',
  enviada: boolean,
  dataEnvio?: number
}
```

## 🔧 Tecnologias Utilizadas

- **Frontend:** React 19 + TypeScript
- **Roteamento:** Wouter
- **UI Components:** shadcn/ui + Radix UI
- **Styling:** Tailwind CSS 4
- **Banco de Dados:** Dexie.js (IndexedDB wrapper)
- **Notificações:** Sonner (toasts)
- **Icons:** Lucide React

## 📱 Compatibilidade

- Chrome/Chromium (recomendado)
- Firefox
- Safari
- Edge
- Qualquer navegador moderno com suporte a IndexedDB

## ⚙️ Funcionalidades Técnicas

### Limpeza Automática
- Escalas concluídas com mais de 1 dia de atraso são removidas automaticamente
- Mantém o banco de dados limpo e otimizado

### Validações
- Todos os campos obrigatórios são validados
- Mensagens de erro claras
- Confirmações para ações críticas

### Performance
- Carregamento otimizado
- Sem requisições de rede
- Interface responsiva
- Transições suaves

## 📝 Notas Importantes

1. **Dados Locais:** Seus dados são armazenados apenas no seu dispositivo. Faça backups regularmente.

2. **Limpeza do Navegador:** Se você limpar o cache/cookies do navegador, os dados podem ser perdidos.

3. **Múltiplos Dispositivos:** Os dados não sincronizam entre dispositivos. Use backups para transferir.

4. **Notificações:** As notificações funcionam apenas quando o aplicativo está aberto ou em background.

## 🎓 Guia de Uso Recomendado

1. **Primeira Vez:**
   - Crie alguns voluntários
   - Crie alguns ministérios
   - Crie sua primeira escala

2. **Uso Regular:**
   - Verifique a tela inicial para próxima escala
   - Marque como "pronto" quando se preparar
   - Concluir após realizar o serviço

3. **Manutenção:**
   - Faça backup mensal dos dados
   - Revise e atualize voluntários/ministérios conforme necessário
   - Limpe escalas antigas periodicamente

## 🆘 Troubleshooting

**Dados desapareceram:**
- Verifique se você limpou o cache do navegador
- Tente importar um backup anterior

**Notificações não aparecem:**
- Verifique se o navegador permite notificações
- Mantenha o aplicativo aberto ou em background

**Aplicativo lento:**
- Limpe os dados antigos
- Faça um backup e importe em uma nova sessão

## 📞 Suporte

Para problemas ou sugestões, entre em contato com o desenvolvedor.

---

**Versão:** 1.0.0  
**Última Atualização:** 2026-05-02  
**Licença:** MIT
