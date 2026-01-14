#!/bin/bash

# Script de Configuração Cloudflare Tunnel para Achadinhos Shopee
# Este script configura automaticamente um túnel Cloudflare

set -e

# Variáveis configuráveis via ambiente
TUNNEL_NAME="${TUNNEL_NAME:-achadinhos-shopee}"
DOMAIN="${DOMAIN:-achadinhos.onlineshopee.com.br}"
LOCAL_PORT="${LOCAL_PORT:-3000}"
FORCE_NEW="${FORCE_NEW:-false}"

echo "=========================================="
echo "  Instalação Cloudflare Tunnel"
echo "  Achadinhos Online Shopee"
echo "=========================================="
echo ""

# Verificar se está executando como root
if [ "$EUID" -ne 0 ]; then 
  echo "Por favor, execute como root (use sudo)"
  exit 1
fi

# Detectar sistema operacional
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo "Não foi possível detectar o sistema operacional"
    exit 1
fi

echo "Sistema detectado: $OS"
echo ""

# Instalar cloudflared se não estiver instalado
if ! command -v cloudflared &> /dev/null; then
    echo "Instalando cloudflared..."
    
    case $OS in
        ubuntu|debian)
            mkdir -p --mode=0755 /usr/share/keyrings
            curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
            
            echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/cloudflared.list
            
            apt-get update
            apt-get install -y cloudflared
            ;;
        
        centos|rhel|fedora)
            cat > /etc/yum.repos.d/cloudflared.repo << 'EOF'
[cloudflared]
name=cloudflared
baseurl=https://pkg.cloudflare.com/cloudflared/rpm
enabled=1
gpgcheck=1
gpgkey=https://pkg.cloudflare.com/cloudflare-main.gpg
EOF
            yum install -y cloudflared
            ;;
        
        *)
            echo "Sistema operacional não suportado: $OS"
            exit 1
            ;;
    esac
    
    echo "✓ cloudflared instalado!"
else
    echo "✓ cloudflared já está instalado"
fi

echo ""
CLOUDFLARED_VERSION=$(cloudflared --version 2>&1 | head -n1)
echo "Versão: $CLOUDFLARED_VERSION"
echo ""

# Verificar se já existe configuração
CLOUDFLARED_DIR="/root/.cloudflared"
CERT_FILE="$CLOUDFLARED_DIR/cert.pem"

if [ -f "$CERT_FILE" ] && [ "$FORCE_NEW" != "true" ]; then
    echo "=========================================="
    echo "  Certificado Existente Detectado"
    echo "=========================================="
    echo ""
    echo "Encontrado certificado em: $CERT_FILE"
    echo ""
    echo "Verificando túneis existentes..."
    
    # Listar túneis existentes
    EXISTING_TUNNELS=$(cloudflared tunnel list 2>/dev/null || echo "")
    
    if echo "$EXISTING_TUNNELS" | grep -q "$TUNNEL_NAME"; then
        echo "✓ Túnel '$TUNNEL_NAME' já existe"
        
        # Pegar o ID do túnel existente
        TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
        echo "  ID do túnel: $TUNNEL_ID"
    else
        echo "Criando novo túnel: $TUNNEL_NAME"
        cloudflared tunnel create "$TUNNEL_NAME"
        TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
        echo "✓ Túnel criado com ID: $TUNNEL_ID"
    fi
else
    if [ "$FORCE_NEW" = "true" ] && [ -d "$CLOUDFLARED_DIR" ]; then
        echo "Removendo configuração anterior..."
        rm -rf "$CLOUDFLARED_DIR"
    fi
    
    echo "=========================================="
    echo "  Autenticação Cloudflare"
    echo "=========================================="
    echo ""
    echo "IMPORTANTE: Uma janela do navegador será aberta."
    echo "Faça login na sua conta Cloudflare para autorizar o túnel."
    echo ""
    echo "Aguardando autenticação..."
    
    cloudflared tunnel login
    
    echo ""
    echo "✓ Autenticação concluída!"
    echo ""
    
    # Criar túnel
    echo "Criando túnel: $TUNNEL_NAME"
    cloudflared tunnel create "$TUNNEL_NAME"
    
    TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
    echo "✓ Túnel criado com ID: $TUNNEL_ID"
fi

echo ""
echo "=========================================="
echo "  Configurando Túnel"
echo "=========================================="
echo ""

# Criar arquivo de configuração
CREDS_FILE="$CLOUDFLARED_DIR/$TUNNEL_ID.json"

if [ ! -f "$CREDS_FILE" ]; then
    echo "Erro: Arquivo de credenciais não encontrado: $CREDS_FILE"
    echo ""
    echo "Túneis disponíveis:"
    cloudflared tunnel list
    exit 1
fi

echo "Criando arquivo de configuração..."

cat > "$CLOUDFLARED_DIR/config.yml" << EOF
tunnel: $TUNNEL_ID
credentials-file: $CREDS_FILE

ingress:
  - hostname: $DOMAIN
    service: http://localhost:$LOCAL_PORT
  - service: http_status:404
EOF

echo "✓ Configuração criada"
echo ""

# Configurar DNS
echo "Configurando DNS para: $DOMAIN"
cloudflared tunnel route dns "$TUNNEL_NAME" "$DOMAIN" 2>/dev/null || echo "  (DNS pode já estar configurado)"
echo "✓ DNS configurado"
echo ""

# Instalar como serviço
echo "Instalando como serviço systemd..."
cloudflared service install
systemctl daemon-reload
systemctl enable cloudflared
systemctl restart cloudflared

echo "✓ Serviço instalado e iniciado"
echo ""

# Verificar status
sleep 3
if systemctl is-active --quiet cloudflared; then
    echo "✓ Cloudflare Tunnel está rodando!"
else
    echo "⚠ Aviso: Serviço pode não estar rodando corretamente"
    echo "  Verifique os logs: journalctl -u cloudflared -f"
fi

echo ""
echo "=========================================="
echo "  Instalação Concluída!"
echo "=========================================="
echo ""
echo "Configuração:"
echo "  Túnel: $TUNNEL_NAME"
echo "  ID: $TUNNEL_ID"
echo "  Domínio: $DOMAIN"
echo "  Porta local: $LOCAL_PORT"
echo ""
echo "Comandos úteis:"
echo "  Status: systemctl status cloudflared"
echo "  Logs: journalctl -u cloudflared -f"
echo "  Parar: systemctl stop cloudflared"
echo "  Iniciar: systemctl start cloudflared"
echo "  Reiniciar: systemctl restart cloudflared"
echo ""
echo "Seu site deve estar acessível em: https://$DOMAIN"
echo ""
