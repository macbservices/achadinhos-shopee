#!/bin/bash

# Script de correção completo para Achadinhos Online Shopee
# Corrige problemas de Nginx e reinicia todos os serviços

set -e

echo "=================================="
echo "Corrigindo Achadinhos Online Shopee"
echo "=================================="

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Execute como root: sudo bash fix-all.sh${NC}"
  exit 1
fi

INSTALL_DIR="/var/www/achadinhos-shopee"
DOMAIN="${DOMAIN:-achadinhos.onlineshopee.com.br}"

if [ ! -d "$INSTALL_DIR" ]; then
    echo -e "${RED}Erro: Diretório $INSTALL_DIR não encontrado${NC}"
    echo "Execute o install.sh primeiro"
    exit 1
fi

echo -e "${GREEN}1. Parando todos os serviços...${NC}"
pm2 stop all || true
systemctl stop nginx || true

echo -e "${GREEN}2. Removendo configurações antigas do Nginx...${NC}"
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/sites-enabled/*
rm -f /etc/nginx/sites-available/default

echo -e "${GREEN}3. Criando nova configuração do Nginx...${NC}"
cat > /etc/nginx/sites-available/achadinhos-shopee << 'NGINXCONF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINXCONF

echo -e "${GREEN}4. Ativando site no Nginx...${NC}"
ln -sf /etc/nginx/sites-available/achadinhos-shopee /etc/nginx/sites-enabled/achadinhos-shopee

echo -e "${GREEN}5. Testando configuração do Nginx...${NC}"
if nginx -t; then
    echo -e "${GREEN}Configuração do Nginx OK${NC}"
else
    echo -e "${RED}Erro na configuração do Nginx${NC}"
    exit 1
fi

echo -e "${GREEN}6. Reiniciando aplicação com PM2...${NC}"
cd "$INSTALL_DIR"
pm2 delete achadinhos-shopee 2>/dev/null || true
pm2 start npm --name "achadinhos-shopee" -- start
pm2 save

echo -e "${GREEN}7. Reiniciando Nginx...${NC}"
systemctl restart nginx
systemctl enable nginx

echo -e "${GREEN}8. Bloqueando porta 3000...${NC}"
# Limpar regras existentes para porta 3000
iptables -D INPUT -p tcp --dport 3000 -j DROP 2>/dev/null || true
iptables -D INPUT -p tcp --dport 3000 -i lo -j ACCEPT 2>/dev/null || true

# Adicionar novas regras
iptables -I INPUT 1 -p tcp --dport 3000 -i lo -j ACCEPT
iptables -I INPUT 2 -p tcp --dport 3000 -j DROP

# Salvar regras
if command -v netfilter-persistent &> /dev/null; then
    netfilter-persistent save
else
    mkdir -p /etc/iptables
    iptables-save > /etc/iptables/rules.v4
fi

echo -e "${GREEN}9. Aguardando serviços iniciarem...${NC}"
sleep 5

echo -e "${GREEN}10. Verificando status dos serviços...${NC}"
echo ""
echo -e "${YELLOW}Status PM2:${NC}"
pm2 status

echo ""
echo -e "${YELLOW}Status Nginx:${NC}"
systemctl status nginx --no-pager | head -n 10

echo ""
echo -e "${YELLOW}Testando aplicação local (porta 3000):${NC}"
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✓ Aplicação respondendo na porta 3000${NC}"
else
    echo -e "${RED}✗ Aplicação NÃO está respondendo na porta 3000${NC}"
    echo -e "${YELLOW}Logs da aplicação:${NC}"
    pm2 logs achadinhos-shopee --lines 20 --nostream
fi

echo ""
echo -e "${YELLOW}Testando Nginx (porta 80):${NC}"
if curl -s http://localhost > /dev/null; then
    echo -e "${GREEN}✓ Nginx respondendo na porta 80${NC}"
else
    echo -e "${RED}✗ Nginx NÃO está respondendo${NC}"
fi

echo ""
echo -e "${GREEN}==================================="
echo -e "Correção concluída!"
echo -e "===================================${NC}"
echo ""
echo -e "${YELLOW}Agora teste acessando:${NC}"
echo "- Pelo IP: http://SEU_IP"
echo "- Pelo domínio: http://$DOMAIN (se o DNS estiver configurado)"
echo "- Painel admin: /admin (senha: admin123)"
echo ""
echo -e "${YELLOW}Se ainda houver problemas, veja os logs:${NC}"
echo "- Logs da aplicação: pm2 logs achadinhos-shopee"
echo "- Logs do Nginx: sudo tail -f /var/log/nginx/error.log"
