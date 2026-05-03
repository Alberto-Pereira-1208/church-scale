# 📱 Church Scale - APK Android

## 🚀 Gerar APK Rapidamente

### Opção 1: Script Automatizado (Recomendado)

```bash
cd /home/ubuntu/church-scale
./build-apk.sh debug      # APK de teste
# ou
./build-apk.sh release    # APK otimizado
```

O APK será salvo em `apk-output/`

### Opção 2: Comandos Manuais

```bash
# 1. Compilar web
pnpm build

# 2. Compilar APK Debug
cd android
./gradlew assembleDebug

# APK em: android/app/build/outputs/apk/debug/app-debug.apk
```

### Opção 3: GitHub Actions (Sem Dependências Locais)

1. Fazer push para GitHub
2. Workflow automático compila APK
3. Baixar em "Actions" → "Build Android APK" → "Artifacts"

---

## 📲 Instalar no Android

### Via ADB (USB)

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Via Manual

1. Transferir arquivo para celular (email, WhatsApp, USB)
2. Abrir Configurações → Segurança → Ativar "Fontes desconhecidas"
3. Tocar no arquivo e instalar

---

## ✅ Funcionalidades Incluídas

- ✅ 100% Offline (com Service Worker)
- ✅ Escalas de serviço
- ✅ Check-in com localização
- ✅ Histórico de presença
- ✅ Relatórios compartilháveis
- ✅ Exclusão de escalas com rastreabilidade
- ✅ Notificações push locais
- ✅ Dashboard com gráficos

---

## 📊 Tamanho

- Debug: ~60 MB
- Release: ~35 MB

---

## 🔧 Configuração

**App ID**: `com.igrejascala.app`  
**App Name**: `Escala Igreja`  
**Versão**: 1.0.0  

Ver `capacitor.config.ts` para detalhes.

---

## 📖 Documentação Completa

Ver `GUIA_GERACAO_APK.md` para instruções detalhadas, troubleshooting e publicação na Play Store.

---

**Última atualização**: 02/05/2026
