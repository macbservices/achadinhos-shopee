#!/bin/bash

# Script para bloquear a porta 3000 externamente
# Permite apenas acesso local (localhost)

set -e

echo "======================================"
echo "Bloqueando porta 3000 externamente"
echo "======================================"

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
  echo "Por favor, execute como root (use sudo)"
  exit 1
fi

echo "Removendo regras antigas..."
# Remover regras existentes relacionadas à porta 3000
iptables -D INPUT -p tcp --dport 3000 -j DROP 2>/dev/null || true
iptables -D INPUT -p tcp --dport 3000 -i lo -j ACCEPT 2>/dev/null || true

echo "Adicionando novas regras..."
# Permitir acesso local
iptables -I INPUT 1 -p tcp --dport 3000 -i lo -j ACCEPT
# Bloquear acesso externo
iptables -I INPUT 2 -p tcp --dport 3000 -j DROP

echo "Salvando regras..."
# Instalar iptables-persistent se não existir
if ! command -v netfilter-persistent &> /dev/null; then
    echo "Instalando iptables-persistent..."
    DEBIAN_FRONTEND=noninteractive apt-get install -y iptables-persistent
fi

# Salvar regras
mkdir -p /etc/iptables
iptables-save > /etc/iptables/rules.v4

echo "✓ Porta 3000 bloqueada com sucesso!"
echo ""
echo "Verificação:"
iptables -L INPUT -n --line-numbers | grep 3000
echo ""
echo "A porta 3000 agora só pode ser acessada localmente via Nginx"
