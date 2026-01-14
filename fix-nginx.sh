#!/bin/bash

# Script para corrigir configuração do Nginx

set -e

echo "Corrigindo configuração do Nginx..."

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Por favor, execute como root (use sudo)${NC}"
  exit 1
fi

DOMAIN=${1:-"achadinhos.onlineshopee.com.br"}

echo -e "${GREEN}Configurando Nginx para $DOMAIN...${NC}"

# Remover todos os sites habilitados
rm -f /etc/nginx/sites-enabled/*

# Recriar configuração
cat > /etc/nginx/sites-available/achadinhos-shopee << EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name $DOMAIN www.$DOMAIN _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Habilitar site
ln -sf /etc/nginx/sites-available/achadinhos-shopee /etc/nginx/sites-enabled/achadinhos-shopee

# Testar configuração
echo -e "${YELLOW}Testando configuração do Nginx...${NC}"
nginx -t

# Reiniciar Nginx
echo -e "${YELLOW}Reiniciando Nginx...${NC}"
systemctl restart nginx
systemctl enable nginx

# Verificar status
echo -e "${YELLOW}Verificando status...${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ Nginx está rodando${NC}"
else
    echo -e "${RED}✗ Nginx não está rodando${NC}"
    exit 1
fi

# Verificar aplicação
echo -e "${YELLOW}Verificando aplicação na porta 3000...${NC}"
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✓ Aplicação está respondendo${NC}"
else
    echo -e "${RED}✗ Aplicação não está respondendo${NC}"
    echo -e "${YELLOW}Execute 'pm2 status' e 'pm2 logs achadinhos-shopee' para mais informações${NC}"
    exit 1
fi

echo -e "${GREEN}==================================="
echo -e "Nginx configurado com sucesso!"
echo -e "===================================${NC}"
echo ""
echo "Acesse: http://$DOMAIN"
echo "Ou pelo IP: http://$(curl -s ifconfig.me)"
