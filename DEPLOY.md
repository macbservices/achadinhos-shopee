# Guia de Deploy - Achadinhos Online Shopee

Este guia explica como fazer deploy do seu e-commerce em um VPS.

## Opção 1: Instalação Automática (Mais Fácil)

### Passo 1: Preparar o VPS

1. Acesse seu VPS via SSH:
```bash
ssh root@SEU_IP_DO_SERVIDOR
```

2. Execute o script de instalação:
```bash
curl -sL https://raw.githubusercontent.com/SEU_USUARIO/achadinhos-shopee/main/install.sh | sudo bash
```

3. Siga as instruções na tela

### Passo 2: Configurar DNS

No painel do seu provedor de domínio, adicione:

```
Tipo: A
Nome: @
Valor: IP_DO_SEU_SERVIDOR
TTL: 3600

Tipo: A
Nome: www
Valor: IP_DO_SEU_SERVIDOR
TTL: 3600
```

### Passo 3: Configurar SSL (HTTPS)

Após o DNS propagar (pode levar até 24h), execute:

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d achadinhos.onlineshopee.com.br -d www.achadinhos.onlineshopee.com.br
```

## Opção 2: Instalação Manual

### 1. Preparar o Servidor

```bash
# Atualizar sistema
sudo apt-get update && sudo apt-get upgrade -y

# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar Nginx
sudo apt-get install -y nginx

# Instalar PM2
sudo npm install -g pm2

# Instalar Git
sudo apt-get install -y git
```

### 2. Clonar e Configurar Projeto

```bash
# Criar diretório
sudo mkdir -p /var/www/achadinhos-shopee
cd /var/www/achadinhos-shopee

# Clonar repositório
sudo git clone https://github.com/SEU_USUARIO/achadinhos-shopee.git .

# Instalar dependências
npm install

# Build
npm run build

# Ajustar permissões
sudo chown -R $USER:$USER /var/www/achadinhos-shopee
```

### 3. Configurar PM2

```bash
# Iniciar aplicação
pm2 start npm --name "achadinhos-shopee" -- start

# Salvar configuração
pm2 save

# Configurar inicialização automática
pm2 startup systemd
```

### 4. Configurar Nginx

Crie o arquivo `/etc/nginx/sites-available/achadinhos-shopee`:

```nginx
server {
    listen 80;
    server_name achadinhos.onlineshopee.com.br www.achadinhos.onlineshopee.com.br;

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
```

Ative o site:

```bash
sudo ln -s /etc/nginx/sites-available/achadinhos-shopee /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Configurar Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

## Manutenção

### Atualizar Site

```bash
cd /var/www/achadinhos-shopee
git pull origin main
npm install
npm run build
pm2 restart achadinhos-shopee
```

Ou use o script:

```bash
sudo bash /var/www/achadinhos-shopee/update.sh
```

### Ver Logs

```bash
pm2 logs achadinhos-shopee
```

### Reiniciar Aplicação

```bash
pm2 restart achadinhos-shopee
```

### Monitorar

```bash
pm2 monit
```

## Resolução de Problemas

### Site não carrega

1. Verifique se a aplicação está rodando:
```bash
pm2 status
```

2. Verifique logs:
```bash
pm2 logs achadinhos-shopee
```

3. Verifique Nginx:
```bash
sudo nginx -t
sudo systemctl status nginx
```

### Aplicação para após reiniciar servidor

```bash
pm2 startup systemd
pm2 save
```

### Erro de permissões

```bash
sudo chown -R $USER:$USER /var/www/achadinhos-shopee
```

## Provedores VPS Recomendados

- DigitalOcean (a partir de $5/mês)
- Vultr (a partir de $5/mês)
- Linode (a partir de $5/mês)
- Contabo (a partir de €4/mês)
- AWS Lightsail (a partir de $3.50/mês)

## Checklist Pós-Deploy

- [ ] Site acessível via domínio
- [ ] HTTPS configurado (certificado SSL)
- [ ] Todas as páginas funcionando
- [ ] Links da Shopee corretos
- [ ] Senha do admin alterada
- [ ] Backup configurado
- [ ] PM2 configurado para iniciar automaticamente
- [ ] Firewall ativo
- [ ] DNS propagado
