# 📱 Church Scale - Setup com GitHub Actions

## 🚀 Passos Rápidos

### 1️⃣ Preparar Repositório GitHub

```bash
# Extrair ZIP
unzip church-scale.zip
cd church-scale

# Inicializar Git (se não tiver)
git init
git add .
git commit -m "Initial commit - Church Scale with Capacitor"
```

### 2️⃣ Criar Repositório no GitHub

1. Ir para https://github.com/new
2. Nome: `church-scale`
3. Descrição: `Aplicativo de escalas de serviço para Igreja`
4. Clicar em "Create repository"

### 3️⃣ Fazer Push do Código

```bash
git remote add origin https://github.com/SEU-USUARIO/church-scale.git
git branch -M main
git push -u origin main
```

### 4️⃣ GitHub Actions Compila Automaticamente

1. Ir para aba **"Actions"** no GitHub
2. Workflow **"Build Android APK"** será executado automaticamente
3. Aguardar conclusão (5-10 minutos)

### 5️⃣ Baixar APK

1. Na aba **"Actions"**, clicar no workflow que terminou
2. Ir para **"Artifacts"**
3. Baixar:
   - `app-debug` (para testes)
   - `app-release` (para produção)

---

## 📋 O Que Está Incluído

✅ Projeto React 19 + Tailwind 4  
✅ Capacitor configurado para Android  
✅ GitHub Actions workflow pronto  
✅ Todas as funcionalidades do Church Scale  
✅ 100% Offline com Service Worker  

---

## 📦 Estrutura do Projeto

```
church-scale/
├── client/              # React app
├── android/             # Projeto Android nativo
├── .github/workflows/   # GitHub Actions
├── capacitor.config.ts  # Configuração Capacitor
├── package.json         # Dependências
└── pnpm-lock.yaml       # Lock file
```

---

## ⚙️ Configuração do Workflow

O arquivo `.github/workflows/build-android.yml` já está configurado para:

1. ✅ Instalar Java 17
2. ✅ Instalar Node.js
3. ✅ Instalar dependências (`pnpm`)
4. ✅ Compilar app web (`pnpm build`)
5. ✅ Compilar APK Debug
6. ✅ Compilar APK Release
7. ✅ Upload de artifacts

---

## 📱 Instalar APK no Android

### Via ADB
```bash
adb install app-debug.apk
```

### Via Manual
1. Transferir arquivo para celular
2. Ativar "Fontes desconhecidas" em Configurações
3. Tocar no arquivo e instalar

---

## 🔄 Recompilar APK

Sempre que fizer alterações no código:

```bash
git add .
git commit -m "Descrição das mudanças"
git push
```

GitHub Actions recompilará automaticamente!

---

## 📊 Funcionalidades Incluídas

- ✅ Escalas de serviço
- ✅ Check-in com localização
- ✅ Histórico de presença com métricas
- ✅ Relatórios compartilháveis
- ✅ Exclusão de escalas com rastreabilidade
- ✅ Notificações push locais
- ✅ Dashboard com gráficos
- ✅ 100% Offline
- ✅ Exportação CSV/PDF

---

## 🆘 Troubleshooting

### Workflow falha
1. Ir para **Actions** → Workflow que falhou
2. Ver logs detalhados
3. Problemas comuns:
   - Falta de permissões: Verificar "Workflow permissions" em Settings
   - Timeout: Aumentar timeout em `build-android.yml`

### APK não instala
1. Verificar se "Fontes desconhecidas" está ativado
2. Desinstalar versão anterior: `adb uninstall com.igrejascala.app`
3. Tentar APK Debug primeiro

---

## 📞 Próximos Passos

1. ✅ Fazer push para GitHub
2. ✅ Aguardar compilação
3. ✅ Baixar e instalar APK
4. ✅ Testar no Android
5. ✅ Se OK, publicar na Play Store (opcional)

---

**Dúvidas?** Consulte a documentação completa em `GUIA_GERACAO_APK.md`

**Última atualização**: 02/05/2026
