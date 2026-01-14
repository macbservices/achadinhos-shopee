#!/bin/bash

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "Reconfigurar Domínio Cloudflare Tunnel"
echo "========================================"

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Por favor, execute como root (sudo)${NC}"
    exit 1
fi

# Verificar se cloudflared está instalado
if ! command -v cloudflared &> /dev/null; then
    echo -e "${RED}cloudflared não está instalado. Execute setup-cloudflare.sh primeiro.${NC}"
    exit 1
fi

# Pegar o nome do túnel existente
TUNNEL_NAME=$(cloudflared tunnel list 2>/dev/null | grep -v "ID" | awk '{print $2}' | head -1)

if [ -z "$TUNNEL_NAME" ]; then
    echo -e "${RED}Nenhum túnel encontrado. Execute setup-cloudflare.sh primeiro.${NC}"
    exit 1
fi

echo -e "${GREEN}Túnel encontrado: ${TUNNEL_NAME}${NC}"

# Solicitar novo domínio
if [ -z "$NEW_DOMAIN" ]; then
    echo ""
    echo -e "${YELLOW}Digite o novo domínio (ex: meusite.com):${NC}"
    read -p "Domínio: " NEW_DOMAIN
fi

if [ -z "$NEW_DOMAIN" ]; then
    echo -e "${RED}Domínio não pode ser vazio${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Configurando novo domínio: ${NEW_DOMAIN}${NC}"

# Obter o Tunnel ID
TUNNEL_ID=$(cloudflared tunnel list 2>/dev/null | grep "$TUNNEL_NAME" | awk '{print $1}')

if [ -z "$TUNNEL_ID" ]; then
    echo -e "${RED}Não foi possível obter o ID do túnel${NC}"
    exit 1
fi

# Remover DNS antigo (se existir)
OLD_DOMAIN=$(cloudflared tunnel route dns list 2>/dev/null | grep "$TUNNEL_ID" | awk '{print $3}' | head -1)
if [ ! -z "$OLD_DOMAIN" ]; then
    echo -e "${YELLOW}Removendo DNS antigo: ${OLD_DOMAIN}${NC}"
    cloudflared tunnel route dns delete "$TUNNEL_ID" "$OLD_DOMAIN" 2>/dev/null || true
fi

# Adicionar novo DNS
echo -e "${YELLOW}Configurando novo DNS...${NC}"
if cloudflared tunnel route dns "$TUNNEL_NAME" "$NEW_DOMAIN"; then
    echo -e "${GREEN}✓ DNS configurado com sucesso${NC}"
else
    echo -e "${RED}✗ Falha ao configurar DNS${NC}"
    echo -e "${YELLOW}Execute manualmente: cloudflared tunnel route dns $TUNNEL_NAME $NEW_DOMAIN${NC}"
    exit 1
fi

# Atualizar arquivo de configuração
CONFIG_FILE="/etc/cloudflared/config.yml"
if [ -f "$CONFIG_FILE" ]; then
    echo -e "${YELLOW}Atualizando arquivo de configuração...${NC}"
    
    # Fazer backup
    cp "$CONFIG_FILE" "${CONFIG_FILE}.backup.$(date +%s)"
    
    # Atualizar hostname no config
    sed -i "s/hostname: .*/hostname: $NEW_DOMAIN/" "$CONFIG_FILE"
    
    echo -e "${GREEN}✓ Configuração atualizada${NC}"
fi

# Reiniciar serviço
echo -e "${YELLOW}Reiniciando serviço cloudflared...${NC}"
systemctl restart cloudflared
sleep 3

# Verificar status
if systemctl is-active --quiet cloudflared; then
    echo -e "${GREEN}✓ Serviço reiniciado com sucesso${NC}"
else
    echo -e "${RED}✗ Erro ao reiniciar serviço${NC}"
    systemctl status cloudflared
    exit 1
fi

echo ""
echo -e "${GREEN}========================================"
echo "Domínio alterado com sucesso!"
echo "========================================${NC}"
echo ""
echo "Novo domínio: https://${NEW_DOMAIN}"
echo ""
echo -e "${YELLOW}Aguarde 1-2 minutos para propagação do DNS${NC}"
echo ""
echo "Comandos úteis:"
echo "  - Ver túneis: cloudflared tunnel list"
echo "  - Ver rotas DNS: cloudflared tunnel route dns list"
echo "  - Status do serviço: systemctl status cloudflared"
echo ""
