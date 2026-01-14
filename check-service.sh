#!/bin/bash

# Script para verificar o status dos serviços
# Execute: bash check-service.sh

echo "======================================"
echo "Status dos Serviços - Achadinhos Shopee"
echo "======================================"
echo ""

# Verificar PM2
echo "--- PM2 Status ---"
pm2 status

echo ""
echo "--- Nginx Status ---"
systemctl status nginx --no-pager | head -n 10

echo ""
echo "--- Firewall Status ---"
if command -v ufw &> /dev/null; then
    ufw status
fi

echo ""
echo "--- Verificar Porta 3000 (deve estar bloqueada externamente) ---"
ss -tlnp | grep :3000

echo ""
echo "--- Últimas 20 linhas de log ---"
pm2 logs achadinhos-shopee --lines 20 --nostream
