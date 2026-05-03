#!/bin/bash

# Script de Compilação do APK - Church Scale
# Uso: ./build-apk.sh [debug|release]

set -e

BUILD_TYPE="${1:-debug}"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANDROID_DIR="$PROJECT_DIR/android"

echo "🚀 Church Scale - Gerador de APK"
echo "=================================="
echo ""

# Verificar Java
echo "📋 Verificando Java..."
if ! command -v java &> /dev/null; then
    echo "❌ Java não encontrado. Instale Java 17+"
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | grep -oP 'version "\K[^"]*' | cut -d. -f1)
if [ "$JAVA_VERSION" -lt 17 ]; then
    echo "⚠️  Java $JAVA_VERSION encontrado, mas Java 17+ é necessário"
    echo "Configure: export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64"
    exit 1
fi
echo "✅ Java $JAVA_VERSION OK"

# Compilar web
echo ""
echo "🔨 Compilando aplicação web..."
cd "$PROJECT_DIR"
pnpm build
echo "✅ Web compilado"

# Compilar APK
echo ""
echo "📦 Compilando APK ($BUILD_TYPE)..."
cd "$ANDROID_DIR"

if [ "$BUILD_TYPE" = "debug" ]; then
    ./gradlew assembleDebug
    APK_PATH="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"
    echo "✅ APK Debug gerado"
elif [ "$BUILD_TYPE" = "release" ]; then
    ./gradlew assembleRelease
    APK_PATH="$ANDROID_DIR/app/build/outputs/apk/release/app-release.apk"
    echo "✅ APK Release gerado"
else
    echo "❌ Tipo inválido. Use: debug ou release"
    exit 1
fi

# Verificar se APK foi criado
if [ ! -f "$APK_PATH" ]; then
    echo "❌ Erro: APK não foi gerado em $APK_PATH"
    exit 1
fi

# Mostrar informações
echo ""
echo "📊 Informações do APK:"
echo "  Caminho: $APK_PATH"
echo "  Tamanho: $(du -h "$APK_PATH" | cut -f1)"
echo "  Modificado: $(date -r "$APK_PATH")"

# Copiar para diretório de saída
OUTPUT_DIR="$PROJECT_DIR/apk-output"
mkdir -p "$OUTPUT_DIR"
cp "$APK_PATH" "$OUTPUT_DIR/"
echo ""
echo "✅ APK copiado para: $OUTPUT_DIR"

# Instruções de instalação
echo ""
echo "📱 Próximos passos:"
echo ""
echo "1. Transferir para Android:"
echo "   adb push $APK_PATH /sdcard/Download/"
echo ""
echo "2. Instalar:"
echo "   adb install $APK_PATH"
echo ""
echo "3. OU transferir manualmente:"
echo "   - Copiar arquivo para pendrive/email"
echo "   - Ativar 'Fontes desconhecidas' nas Configurações"
echo "   - Tocar no arquivo e instalar"
echo ""
echo "✨ Pronto! Seu APK está em: $OUTPUT_DIR"
