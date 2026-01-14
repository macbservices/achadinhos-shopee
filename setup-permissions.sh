#!/bin/bash

echo "Configurando permissões dos scripts..."

# Define o diretório base
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Lista de scripts que precisam de permissão de execução
SCRIPTS=(
    "install.sh"
    "update.sh"
    "check-service.sh"
    "setup-cloudflare.sh"
    "setup-permissions.sh"
)

# Adiciona permissão de execução para cada script
for script in "${SCRIPTS[@]}"; do
    if [ -f "$SCRIPT_DIR/$script" ]; then
        chmod +x "$SCRIPT_DIR/$script"
        echo "✓ Permissão adicionada: $script"
    else
        echo "⚠ Arquivo não encontrado: $script"
    fi
done

echo ""
echo "Permissões configuradas com sucesso!"
echo "Agora você pode executar os scripts com ./<nome-do-script>.sh"
