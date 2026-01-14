#!/bin/bash

# Script de atualização do Achadinhos Online Shopee

set -e

echo "==================================="
echo "Atualizando Achadinhos Online Shopee"
echo "==================================="

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

INSTALL_DIR="/var/www/achadinhos-shopee"

if [ ! -d "$INSTALL_DIR" ]; then
    echo "Diretório de instalação não encontrado!"
    exit 1
fi

cd "$INSTALL_DIR"

echo -e "${GREEN}Baixando atualizações...${NC}"
git pull origin main

echo -e "${GREEN}Instalando dependências...${NC}"
npm install

echo -e "${GREEN}Construindo aplicação...${NC}"
npm run build

echo -e "${GREEN}Reiniciando aplicação...${NC}"
pm2 restart achadinhos-shopee

echo -e "${GREEN}Atualização concluída!${NC}"
