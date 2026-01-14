#!/bin/bash

# Script de instalação do Achadinhos Online Shopee
set -e

echo "==================================="
echo "Instalando Achadinhos Online Shopee"
echo "==================================="

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
  echo "Por favor, execute como root (use sudo)"
  exit 1
fi

# Variáveis
INSTALL_DIR="/var/www/achadinhos-shopee"
REPO_URL="${REPO_URL:-https://github.com/macbservices/achadinhos-shopee.git}"
DOMAIN="${DOMAIN:-achadinhos.onlineshopee.com.br}"

echo "Instalando dependências do sistema..."
apt-get update
apt-get install -y curl git nginx

# Instalar Node.js 20
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" -lt 20 ]; then
    echo "Instalando Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# Instalar PM2
npm install -g pm2

echo "Clonando repositório..."
if [ -d "$INSTALL_DIR" ]; then
    pm2 delete achadinhos-shopee 2>/dev/null || true
    rm -rf "$INSTALL_DIR"
fi

mkdir -p /var/www
git clone "$REPO_URL" "$INSTALL_DIR"
cd "$INSTALL_DIR"

echo "Instalando dependências..."
npm install

echo "Construindo aplicação..."
npm run build

# Criar diretório de dados
mkdir -p "$INSTALL_DIR/data"
chmod 777 "$INSTALL_DIR/data"

echo "Iniciando aplicação com PM2..."
pm2 delete achadinhos-shopee 2>/dev/null || true
pm2 start npm --name "achadinhos-shopee" -- start
pm2 save
pm2 startup systemd -u root --hp /root

echo "Configurando Nginx..."
rm -f /etc/nginx/sites-enabled/default
cat > /etc/nginx/sites-available/achadinhos-shopee << 'EOF'
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
    }
}
EOF

ln -sf /etc/nginx/sites-available/achadinhos-shopee /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
systemctl enable nginx

# Bloquear porta 3000
ufw allow 80/tcp 2>/dev/null || true
ufw allow 22/tcp 2>/dev/null || true
ufw deny 3000/tcp 2>/dev/null || true

echo ""
echo "==================================="
echo "Instalação concluída!"
echo "==================================="
echo ""
echo "Acesse: http://SEU_IP"
echo "Admin: http://SEU_IP/admin (senha: admin123)"
echo ""
echo "Comandos úteis:"
echo "  pm2 logs achadinhos-shopee"
echo "  pm2 restart achadinhos-shopee"
echo "  pm2 status"
