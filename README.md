# Achadinhos Online Shopee

E-commerce moderno para roupas femininas e masculinas com integração direta com Shopee.

## Características

- Interface moderna e responsiva
- Catálogo de produtos com filtros por categoria
- Páginas individuais de produtos
- Integração com Shopee para compras
- Painel administrativo completo (oculto)
- Busca e filtros avançados
- Design otimizado para mobile
- **Execução persistente com PM2** - Continua rodando após fechar terminal
- **Auto-start após reinicialização** - Inicia automaticamente quando a VPS reinicia
- **Porta 3000 bloqueada externamente** - Acesso apenas via domínio/IP através do Nginx

## Tecnologias

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Lucide Icons
- shadcn/ui

## Instalação Rápida em VPS

### Instalação Automatizada (Recomendado)

Execute um único comando para instalar tudo automaticamente:

```bash
curl -sL https://raw.githubusercontent.com/macbservices/achadinhos-shopee/main/install.sh | sudo bash
```

**Instalação com domínio customizado:**

```bash
DOMAIN=seu-dominio.com.br curl -sL https://raw.githubusercontent.com/macbservices/achadinhos-shopee/main/install.sh | sudo bash
```

**Instalação com repositório customizado:**

```bash
REPO_URL=https://github.com/seu-usuario/seu-repo.git curl -sL https://raw.githubusercontent.com/macbservices/achadinhos-shopee/main/install.sh | sudo bash
```

**Instalação completa customizada:**

```bash
REPO_URL=https://github.com/seu-usuario/seu-repo.git DOMAIN=seu-dominio.com.br curl -sL https://raw.githubusercontent.com/macbservices/achadinhos-shopee/main/install.sh | sudo bash
```

O script irá:
- Instalar Node.js, Nginx, PM2 e Git
- Clonar o repositório
- Instalar dependências
- Construir a aplicação
- Configurar PM2 para auto-start após reboot
- Configurar Nginx como proxy reverso
- **Bloquear acesso externo à porta 3000** (firewall UFW + iptables)
- Iniciar a aplicação de forma persistente

### Requisitos do Servidor

- Ubuntu 20.04+ ou Debian 11+
- Mínimo 1GB RAM
- Mínimo 10GB de espaço em disco
- Acesso root (sudo)

### Segurança e Persistência

Após a instalação, o site estará:
- ✅ Rodando em segundo plano via PM2
- ✅ Configurado para iniciar automaticamente após reinicialização do servidor
- ✅ Porta 3000 bloqueada externamente (acesso apenas via Nginx)
- ✅ Acessível apenas pelo domínio ou IP na porta 80/443
- ✅ Protegido por firewall

**Verificar status dos serviços:**

```bash
bash /var/www/achadinhos-shopee/check-service.sh
```

Ou se você já configurou as permissões:

```bash
cd /var/www/achadinhos-shopee
./check-service.sh
```

## Instalação com Cloudflare Tunnel

Se você não quer expor diretamente o IP do servidor ou quer usar o Cloudflare para proteção e cache:

### ⚠️ IMPORTANTE - Primeira Instalação

Na **primeira vez** que você instala o Cloudflare Tunnel, você **NÃO pode usar o comando curl direto**. Isso porque o Cloudflare precisa que você autorize o túnel através do navegador.

**Primeira vez - Execute estes comandos na VPS:**

```bash
# Baixe o script
wget https://raw.githubusercontent.com/macbservices/achadinhos-shopee/main/setup-cloudflare.sh

# Execute localmente
sudo bash setup-cloudflare.sh
```

Ou com domínio customizado:

```bash
wget https://raw.githubusercontent.com/macbservices/achadinhos-shopee/main/setup-cloudflare.sh
DOMAIN=seu-dominio.com.br sudo -E bash setup-cloudflare.sh
```

O script irá:
1. Instalar o cloudflared
2. Abrir um link de autorização no terminal
3. Você copia o link e cola no navegador (onde está logado na Cloudflare)
4. Autoriza o túnel na interface da Cloudflare
5. O script continua automaticamente após autorização

### Instalações Subsequentes

Após a primeira instalação e autenticação, o certificado fica salvo em `/root/.cloudflared/cert.pem`. Nas próximas vezes você pode usar:

```bash
curl -sL https://raw.githubusercontent.com/macbservices/achadinhos-shopee/main/setup-cloudflare.sh | sudo bash
```

**Com domínio customizado:**

```bash
DOMAIN=seu-dominio.com.br curl -sL https://raw.githubusercontent.com/macbservices/achadinhos-shopee/main/setup-cloudflare.sh | sudo bash
```

**Com porta customizada:**

```bash
LOCAL_PORT=8080 DOMAIN=seu-dominio.com.br curl -sL https://raw.githubusercontent.com/macbservices/achadinhos-shopee/main/setup-cloudflare.sh | sudo bash
```

**Forçar nova configuração (remove certificados existentes):**

```bash
FORCE_NEW=true curl -sL https://raw.githubusercontent.com/macbservices/achadinhos-shopee/main/setup-cloudflare.sh | sudo bash
```

### O que o script faz automaticamente:

- ✅ Instala o cloudflared
- ✅ Autentica com sua conta Cloudflare (abre navegador)
- ✅ Cria o túnel automaticamente
- ✅ Configura DNS para seu domínio
- ✅ Instala como serviço systemd
- ✅ Inicia automaticamente após reboot
- ✅ Detecta e reutiliza certificados existentes

### Gerenciar Cloudflare Tunnel:

```bash
# Ver status
systemctl status cloudflared

# Ver logs
journalctl -u cloudflared -f

# Reiniciar
systemctl restart cloudflared

# Parar
systemctl stop cloudflared

# Iniciar
systemctl start cloudflared
```

### Variáveis de Ambiente Disponíveis:

- `TUNNEL_NAME` - Nome do túnel (padrão: achadinhos-shopee)
- `DOMAIN` - Domínio para o túnel (padrão: achadinhos.onlineshopee.com.br)
- `LOCAL_PORT` - Porta local da aplicação (padrão: 3000)
- `FORCE_NEW` - Forçar nova instalação removendo certificados (padrão: false)

### Alterar Domínio Após Instalação

Se você já instalou o Cloudflare Tunnel e quer mudar para outro domínio:

**Com variável de ambiente:**
```bash
NEW_DOMAIN=novo-dominio.com.br sudo -E bash /var/www/achadinhos-shopee/change-domain.sh
```

**Modo interativo:**
```bash
sudo bash /var/www/achadinhos-shopee/change-domain.sh
```

O script irá:
- Detectar o túnel existente
- Remover a rota DNS antiga
- Configurar o novo domínio
- Atualizar arquivos de configuração
- Reiniciar o serviço automaticamente

## Instalação Manual

### Pré-requisitos

- Node.js 20.x ou superior
- npm ou yarn

### Passos

1. Clone o repositório:
```bash
git clone https://github.com/macbservices/achadinhos-shopee.git
cd achadinhos-shopee
```

2. Configure permissões dos scripts:
```bash
bash setup-permissions.sh
```

3. Instale as dependências:
```bash
npm install
```

4. Execute em modo de desenvolvimento:
```bash
npm run dev
```

5. Abra [http://localhost:3000](http://localhost:3000) no navegador

### Build para Produção

```bash
npm run build
npm start
```

## Gerenciamento

### Comandos PM2

- Ver logs: `pm2 logs achadinhos-shopee`
- Reiniciar: `pm2 restart achadinhos-shopee`
- Parar: `pm2 stop achadinhos-shopee`
- Iniciar: `pm2 start achadinhos-shopee`
- Status: `pm2 status`
- Listar todos: `pm2 list`

### Verificar Status dos Serviços

**Opção 1: Com bash (sempre funciona)**
```bash
bash /var/www/achadinhos-shopee/check-service.sh
```

**Opção 2: Com permissões de execução**
```bash
cd /var/www/achadinhos-shopee
chmod +x check-service.sh
./check-service.sh
```

**Opção 3: Configurar todas as permissões de uma vez**
```bash
cd /var/www/achadinhos-shopee
bash setup-permissions.sh
./check-service.sh
```

Este script verifica:
- Status do PM2 e aplicação
- Status do Nginx
- Status do firewall
- Se a porta 3000 está bloqueada externamente
- Últimos logs da aplicação

### Atualizar o Site

Para atualizar o site com novas mudanças do GitHub:

**Opção 1: Com bash (sempre funciona)**
```bash
sudo bash /var/www/achadinhos-shopee/update.sh
```

**Opção 2: Com permissões de execução**
```bash
cd /var/www/achadinhos-shopee
chmod +x update.sh
sudo ./update.sh
```

## Painel Administrativo

Acesse `/admin` para gerenciar produtos e configurações do site. A senha padrão é `admin123`.

**IMPORTANTE**: Altere a senha no código antes de fazer deploy em produção.

### Funcionalidades do Painel Admin

- Gerenciar produtos (adicionar, editar, remover)
- Alterar nome da loja
- Alterar logo
- Alterar descrição
- Alterar domínio
- Customizar cores do tema
- Painel oculto (não aparece na navegação)

### Como Acessar

O painel admin está completamente oculto da navegação do site. Para acessá-lo:
1. Digite `/admin` no final do seu domínio
2. Exemplo: `https://achadinhos.onlineshopee.com.br/admin`
3. Entre com a senha padrão: `admin123`

## Estrutura do Projeto

```
achadinhos-shopee/
├── app/                    # Páginas Next.js
│   ├── page.tsx           # Página inicial
│   ├── produtos/          # Listagem de produtos
│   ├── produto/[id]/      # Página individual do produto
│   └── admin/             # Painel administrativo
├── components/            # Componentes React
│   ├── header.tsx
│   ├── footer.tsx
│   └── product-card.tsx
├── lib/                   # Utilitários
│   ├── products.ts        # Dados dos produtos
│   └── settings.ts        # Configurações do site
├── public/               # Arquivos estáticos
├── install.sh            # Script de instalação
├── setup-cloudflare.sh   # Setup Cloudflare Tunnel
├── setup-permissions.sh  # Configurar permissões dos scripts
├── check-service.sh      # Verificar status dos serviços
├── update.sh            # Script de atualização
└── change-domain.sh      # Script para alterar domínio
```

## Customização

### Via Painel Admin (Recomendado)

Acesse `/admin` e use a interface para:
- Gerenciar produtos
- Alterar informações da loja
- Customizar cores e visual

### Manualmente

#### Alterar Produtos

Edite o arquivo `lib/products.ts` para adicionar, remover ou modificar produtos.

#### Alterar Cores

As cores podem ser modificadas em `app/globals.css` na seção `@theme` ou via painel admin.

#### Alterar Links da Shopee

Atualize os links dos produtos no arquivo `lib/products.ts` com seus links reais da Shopee.

## Scripts Disponíveis

| Script | Comando | Descrição |
|--------|---------|-----------|
| Instalar | `curl -sL ... \| sudo bash` | Instalação automatizada completa |
| Permissões | `bash setup-permissions.sh` | Configurar permissões de execução |
| Atualizar | `bash update.sh` ou `./update.sh` | Atualizar código do GitHub |
| Verificar Status | `bash check-service.sh` ou `./check-service.sh` | Verificar status de todos os serviços |
| Cloudflare Setup | `curl -sL setup-cloudflare.sh \| sudo bash` | Configurar túnel Cloudflare |
| Alterar Domínio | `NEW_DOMAIN=novo-dominio.com.br sudo -E bash /var/www/achadinhos-shopee/change-domain.sh` | Alterar domínio após instalação |

## Solução de Problemas

### Nginx mostrando página padrão "Welcome to nginx"

Se ao acessar o IP da VPS aparecer a página padrão do Nginx em vez do seu site, execute o script de correção:

```bash
sudo bash /var/www/achadinhos-shopee/fix-nginx.sh
```

Ou com domínio customizado:

```bash
sudo bash /var/www/achadinhos-shopee/fix-nginx.sh seu-dominio.com.br
```

Este script irá:
- Remover todas as configurações antigas do Nginx
- Recriar a configuração correta
- Definir o site como servidor padrão
- Testar e reiniciar o Nginx
- Verificar se a aplicação está respondendo

### Erro "Permission denied" ao executar scripts

Se você receber o erro `Permission denied` ao tentar executar um script, você tem duas opções:

**Opção 1: Executar com bash (sempre funciona)**
```bash
bash nome-do-script.sh
```

**Opção 2: Adicionar permissão de execução**
```bash
chmod +x nome-do-script.sh
./nome-do-script.sh
```

**Opção 3: Configurar todas as permissões de uma vez**
```bash
bash setup-permissions.sh
```

### Aplicação não está respondendo

Se o site não carregar, verifique:

1. **Status da aplicação:**
```bash
pm2 status
pm2 logs achadinhos-shopee
```

2. **Status do Nginx:**
```bash
sudo systemctl status nginx
sudo nginx -t
```

3. **Verificação completa:**
```bash
bash /var/www/achadinhos-shopee/check-service.sh
```

4. **Reiniciar tudo:**
```bash
pm2 restart achadinhos-shopee
sudo systemctl restart nginx
```

### Porta 3000 acessível externamente

Se a porta 3000 estiver acessível de fora (não deveria), bloqueie manualmente:

```bash
sudo ufw deny 3000/tcp
sudo iptables -A INPUT -p tcp --dport 3000 -i lo -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 3000 -j DROP
```

## Documentação Adicional

- [DEPLOY.md](./DEPLOY.md) - Guia completo de deploy em VPS
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Suporte

Para problemas ou dúvidas, abra uma issue no GitHub.

## Licença

MIT
