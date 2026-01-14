#!/bin/bash

# Script para configurar ambiente de desenvolvimento na VPS
# Para usar: sudo bash setup-dev.sh

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}Configurando Ambiente de Desenvolvimento${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Por favor, execute como root (use sudo)${NC}"
  exit 1
fi

REAL_USER=${SUDO_USER:-$(whoami)}
INSTALL_DIR="/var/www/achadinhos-shopee"

if [ ! -d "$INSTALL_DIR" ]; then
    echo -e "${RED}Erro: Diretório $INSTALL_DIR não encontrado!${NC}"
    echo -e "${YELLOW}Execute o install.sh primeiro${NC}"
    exit 1
fi

cd "$INSTALL_DIR"

echo -e "${GREEN}Instalando ferramentas de desenvolvimento...${NC}"

# Instalar editores de texto leves
echo -e "${YELLOW}Instalando nano e vim...${NC}"
apt-get update
apt-get install -y nano vim

# Configurar PM2 para desenvolvimento (com watch)
echo -e "${GREEN}Configurando PM2 em modo desenvolvimento...${NC}"

# Parar modo produção
pm2 delete achadinhos-shopee 2>/dev/null || true

# Criar arquivo de configuração PM2 para desenvolvimento
cat > ecosystem.dev.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'achadinhos-shopee-dev',
    script: 'npm',
    args: 'run dev',
    watch: ['app', 'components', 'lib', 'public'],
    ignore_watch: ['node_modules', '.next', '.git'],
    env: {
      NODE_ENV: 'development'
    }
  }]
}
EOF

# Criar arquivo de configuração PM2 para produção
cat > ecosystem.prod.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'achadinhos-shopee',
    script: 'npm',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
EOF

chown $REAL_USER:$REAL_USER ecosystem.*.config.js

# Criar scripts úteis
cat > dev.sh << 'EOF'
#!/bin/bash
# Script para iniciar em modo desenvolvimento

cd /var/www/achadinhos-shopee

# Parar produção se estiver rodando
pm2 delete achadinhos-shopee 2>/dev/null || true

# Iniciar desenvolvimento
pm2 start ecosystem.dev.config.js
pm2 save

echo "Modo desenvolvimento ativado!"
echo "O site recarregará automaticamente ao editar arquivos"
echo "Acesse: http://localhost:3000 ou seu domínio"
echo ""
echo "Para ver logs: pm2 logs achadinhos-shopee-dev"
EOF

cat > prod.sh << 'EOF'
#!/bin/bash
# Script para voltar ao modo produção

cd /var/www/achadinhos-shopee

# Parar desenvolvimento
pm2 delete achadinhos-shopee-dev 2>/dev/null || true

# Rebuild
npm run build

# Iniciar produção
pm2 start ecosystem.prod.config.js
pm2 save

echo "Modo produção ativado!"
echo "Para ver logs: pm2 logs achadinhos-shopee"
EOF

chmod +x dev.sh prod.sh
chown $REAL_USER:$REAL_USER dev.sh prod.sh

# Criar script para clonar para novo site
cat > clone-site.sh << 'EOF'
#!/bin/bash

# Script para clonar este site como base para um novo

set -e

echo "=================================="
echo "Clonar Site para Novo Projeto"
echo "=================================="

# Solicitar informações
read -p "Nome do novo site (ex: meunovosite): " SITE_NAME
read -p "Domínio do novo site (ex: site.com.br): " NEW_DOMAIN
read -p "Nome da loja: " STORE_NAME

if [ -z "$SITE_NAME" ] || [ -z "$NEW_DOMAIN" ] || [ -z "$STORE_NAME" ]; then
    echo "Erro: Todos os campos são obrigatórios!"
    exit 1
fi

NEW_DIR="/var/www/$SITE_NAME"

echo "Copiando arquivos..."
sudo cp -r /var/www/achadinhos-shopee "$NEW_DIR"

cd "$NEW_DIR"

# Limpar dados do site original
sudo rm -rf .git
sudo rm -rf node_modules
sudo rm -rf .next

# Atualizar metadados do layout
echo "Atualizando configurações..."

# Criar script de substituição
cat > /tmp/update_site.sh << INNER_EOF
#!/bin/bash
cd "$NEW_DIR"

# Atualizar nome da loja nos arquivos
find . -type f $$ -name "*.tsx" -o -name "*.ts" -o -name "*.json" $$ -exec sed -i 's/Achadinhos Online Shopee/$STORE_NAME/g' {} +
find . -type f $$ -name "*.tsx" -o -name "*.ts" -o -name "*.json" $$ -exec sed -i 's/achadinhos.onlineshopee.com.br/$NEW_DOMAIN/g' {} +

# Instalar dependências
npm install

# Build inicial
npm run build

# Ajustar permissões
sudo chown -R \$USER:\$USER "$NEW_DIR"
INNER_EOF

chmod +x /tmp/update_site.sh
sudo -u $SUDO_USER bash /tmp/update_site.sh
rm /tmp/update_site.sh

# Configurar PM2
cd "$NEW_DIR"
pm2 start ecosystem.prod.config.js
sed -i "s/achadinhos-shopee/$SITE_NAME/g" ecosystem.prod.config.js
pm2 delete achadinhos-shopee 2>/dev/null || true
pm2 start ecosystem.prod.config.js
pm2 save

# Configurar Nginx
sudo bash -c "cat > /etc/nginx/sites-available/$SITE_NAME << NGINX_EOF
server {
    listen 80;
    server_name $NEW_DOMAIN www.$NEW_DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_cache_bypass \\\$http_upgrade;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
    }
}
NGINX_EOF"

sudo ln -sf /etc/nginx/sites-available/$SITE_NAME /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

echo ""
echo "=================================="
echo "Novo site criado com sucesso!"
echo "=================================="
echo ""
echo "Diretório: $NEW_DIR"
echo "Domínio: $NEW_DOMAIN"
echo "Nome: $STORE_NAME"
echo ""
echo "Próximos passos:"
echo "1. Configure o DNS de $NEW_DOMAIN para apontar para este servidor"
echo "2. Acesse $NEW_DIR e edite os arquivos conforme necessário"
echo "3. Configure SSL: sudo certbot --nginx -d $NEW_DOMAIN -d www.$NEW_DOMAIN"
echo ""
echo "Comandos úteis:"
echo "- Editar em dev: cd $NEW_DIR && sudo bash dev.sh"
echo "- Ver logs: pm2 logs $SITE_NAME"
echo "- Reiniciar: pm2 restart $SITE_NAME"
EOF

chmod +x clone-site.sh
chown $REAL_USER:$REAL_USER clone-site.sh

# Ajustar permissões gerais
chown -R $REAL_USER:$REAL_USER "$INSTALL_DIR"

echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}Ambiente de Desenvolvimento Configurado!${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo -e "${YELLOW}Estrutura do projeto:${NC}"
echo "📁 /var/www/achadinhos-shopee/"
echo "  ├── app/              → Páginas e rotas"
echo "  ├── components/       → Componentes React"
echo "  ├── lib/              → Utilitários e dados"
echo "  ├── public/           → Arquivos estáticos"
echo "  ├── dev.sh           → Iniciar modo desenvolvimento"
echo "  ├── prod.sh          → Voltar para produção"
echo "  └── clone-site.sh    → Clonar para novo site"
echo ""
echo -e "${YELLOW}Como editar o site:${NC}"
echo ""
echo "1. ${BLUE}Ativar modo desenvolvimento:${NC}"
echo "   cd /var/www/achadinhos-shopee"
echo "   sudo bash dev.sh"
echo ""
echo "2. ${BLUE}Editar arquivos (escolha um):${NC}"
echo "   nano app/page.tsx              (página inicial)"
echo "   nano components/header.tsx     (cabeçalho)"
echo "   nano lib/products.ts           (produtos)"
echo ""
echo "3. ${BLUE}As mudanças aparecerão automaticamente!${NC}"
echo ""
echo "4. ${BLUE}Quando terminar, voltar para produção:${NC}"
echo "   sudo bash prod.sh"
echo ""
echo -e "${YELLOW}Para clonar este site como base:${NC}"
echo "   cd /var/www/achadinhos-shopee"
echo "   sudo bash clone-site.sh"
echo ""
echo -e "${YELLOW}Editores disponíveis:${NC}"
echo "   nano - Editor simples (recomendado para iniciantes)"
echo "   vim  - Editor avançado"
echo ""
echo -e "${GREEN}Dica:${NC} Use 'pm2 logs' para ver as mudanças em tempo real"
