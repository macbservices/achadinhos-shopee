#!/bin/bash

# Script para FORÇAR bloqueio da porta 3000 externamente
# Usa múltiplos métodos para garantir que a porta fique inacessível

set -e

echo "==========================================="
echo "FORÇANDO bloqueio da porta 3000 externamente"
echo "==========================================="

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Por favor, execute como root: sudo bash force-block-port.sh${NC}"
  exit 1
fi

echo -e "${YELLOW}1. Instalando ferramentas necessárias...${NC}"
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y iptables-persistent ufw netfilter-persistent 2>/dev/null || true

echo -e "${YELLOW}2. Limpando regras antigas...${NC}"
# Limpar todas as regras relacionadas à porta 3000
iptables -D INPUT -p tcp --dport 3000 -j DROP 2>/dev/null || true
iptables -D INPUT -p tcp --dport 3000 -j REJECT 2>/dev/null || true
iptables -D INPUT -p tcp --dport 3000 -i lo -j ACCEPT 2>/dev/null || true
iptables -D INPUT -s 127.0.0.1 -p tcp --dport 3000 -j ACCEPT 2>/dev/null || true

# Limpar regras UFW
ufw delete allow 3000 2>/dev/null || true
ufw delete allow 3000/tcp 2>/dev/null || true

echo -e "${YELLOW}3. Configurando UFW...${NC}"
# Habilitar UFW se não estiver
ufw --force enable

# Permitir SSH (importante!)
ufw allow 22/tcp

# Permitir HTTP e HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Garantir que porta 3000 está bloqueada no UFW
ufw deny 3000/tcp

echo -e "${YELLOW}4. Configurando iptables (proteção adicional)...${NC}"
# Permitir loopback completo (necessário para Nginx -> Node.js)
iptables -I INPUT 1 -i lo -j ACCEPT

# Bloquear porta 3000 de IPs externos (não-loopback)
iptables -I INPUT 2 -p tcp --dport 3000 ! -i lo -j REJECT --reject-with tcp-reset

echo -e "${YELLOW}5. Salvando regras permanentemente...${NC}"
# Salvar com múltiplos métodos para garantir persistência
mkdir -p /etc/iptables
iptables-save > /etc/iptables/rules.v4

# Usar netfilter-persistent
if command -v netfilter-persistent &> /dev/null; then
    netfilter-persistent save
fi

# Garantir que UFW persiste após reboot
systemctl enable ufw
ufw reload

echo -e "${YELLOW}6. Configurando Node.js para ouvir apenas localhost...${NC}"
# Criar ou atualizar variável de ambiente
INSTALL_DIR="/var/www/achadinhos-shopee"
if [ -d "$INSTALL_DIR" ]; then
    cat > "$INSTALL_DIR/.env.local" << 'EOF'
# Fazer Next.js ouvir apenas localhost
HOSTNAME=127.0.0.1
PORT=3000
EOF
    echo -e "${GREEN}✓ Configurado Next.js para ouvir apenas localhost${NC}"
    
    # Reiniciar aplicação
    cd "$INSTALL_DIR"
    pm2 restart achadinhos-shopee || true
fi

echo -e "${YELLOW}7. Verificando bloqueio...${NC}"
sleep 2

echo ""
echo -e "${YELLOW}Regras UFW:${NC}"
ufw status numbered | grep -E "3000|Status"

echo ""
echo -e "${YELLOW}Regras iptables para porta 3000:${NC}"
iptables -L INPUT -n -v --line-numbers | grep -E "3000|Chain INPUT"

echo ""
echo -e "${YELLOW}Testando acesso local:${NC}"
if curl -s --max-time 3 http://127.0.0.1:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Acesso LOCAL à porta 3000: PERMITIDO${NC}"
else
    echo -e "${RED}✗ Acesso local BLOQUEADO (isso é um problema!)${NC}"
fi

echo ""
echo -e "${YELLOW}Testando acesso externo simulado:${NC}"
# Simular acesso externo
if timeout 3 bash -c "echo '' | nc -w 1 $(hostname -I | awk '{print $1}') 3000" 2>/dev/null; then
    echo -e "${RED}✗ AVISO: Porta 3000 ainda ACESSÍVEL externamente!${NC}"
else
    echo -e "${GREEN}✓ Porta 3000 BLOQUEADA para acesso externo${NC}"
fi

echo ""
echo -e "${GREEN}==========================================="
echo -e "Bloqueio da porta 3000 configurado!"
echo -e "===========================================${NC}"
echo ""
echo -e "${YELLOW}O que foi feito:${NC}"
echo "1. UFW configurado para bloquear porta 3000"
echo "2. iptables configurado para bloquear acesso externo"
echo "3. Next.js configurado para ouvir apenas localhost"
echo "4. Todas as regras salvas para persistir após reboot"
echo ""
echo -e "${YELLOW}Para verificar se está funcionando:${NC}"
echo "- De dentro da VPS: curl http://localhost:3000 (deve funcionar)"
echo "- De fora da VPS: curl http://SEU_IP:3000 (deve falhar/timeout)"
echo "- Pelo navegador: http://SEU_IP (deve funcionar via Nginx)"
echo ""
echo -e "${YELLOW}Comandos úteis:${NC}"
echo "- Ver regras UFW: sudo ufw status"
echo "- Ver regras iptables: sudo iptables -L INPUT -n"
echo "- Ver logs PM2: pm2 logs achadinhos-shopee"
