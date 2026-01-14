# Guia de Desenvolvimento - Editar Site na VPS

Este guia ensina como editar seu site diretamente na VPS e usar como base para outros projetos.

## Configuração Inicial

Após instalar o site com `install.sh`, configure o ambiente de desenvolvimento:

```bash
cd /var/www/achadinhos-shopee
sudo bash setup-dev.sh
```

## Modo Desenvolvimento

### Ativar Modo Dev

```bash
cd /var/www/achadinhos-shopee
sudo bash dev.sh
```

No modo desenvolvimento:
- Mudanças nos arquivos recarregam automaticamente
- Você vê erros detalhados
- Hot reload ativado

### Ver Mudanças em Tempo Real

```bash
pm2 logs achadinhos-shopee-dev
```

### Voltar para Produção

Quando terminar de editar:

```bash
sudo bash prod.sh
```

## Editando Arquivos

### Estrutura do Projeto

```
/var/www/achadinhos-shopee/
├── app/
│   ├── page.tsx              # Página inicial
│   ├── produtos/page.tsx     # Lista de produtos
│   ├── produto/[id]/page.tsx # Detalhes do produto
│   ├── admin/page.tsx        # Painel admin
│   └── layout.tsx            # Layout global
├── components/
│   ├── header.tsx            # Cabeçalho do site
│   ├── footer.tsx            # Rodapé
│   ├── product-card.tsx      # Card de produto
│   └── product-filters.tsx   # Filtros
├── lib/
│   └── products.ts           # Dados dos produtos
└── public/                   # Imagens e arquivos
```

### Editando com Nano (Mais Fácil)

```bash
# Editar página inicial
nano app/page.tsx

# Editar cabeçalho
nano components/header.tsx

# Editar produtos
nano lib/products.ts

# Salvar: Ctrl + O, Enter
# Sair: Ctrl + X
```

### Editando com Vim (Avançado)

```bash
vim app/page.tsx

# Entrar em modo edição: i
# Sair do modo edição: Esc
# Salvar e sair: :wq
# Sair sem salvar: :q!
```

## Exemplos de Edição

### Mudar Nome da Loja

```bash
nano components/header.tsx
```

Encontre e mude:
```tsx
<Link href="/" className="text-xl font-bold">
  Seu Novo Nome Aqui
</Link>
```

### Adicionar Novo Produto

```bash
nano lib/products.ts
```

Adicione no array:
```typescript
{
  id: 21,
  name: "Novo Produto",
  price: 89.90,
  image: "/placeholder.svg?height=300&width=300",
  category: "feminino",
  shopeeUrl: "https://shopee.com.br/seu-produto"
}
```

### Mudar Cores do Site

```bash
nano app/globals.css
```

Edite as variáveis CSS:
```css
--primary: 270 70% 60%;  /* Cor principal */
--accent: 340 75% 55%;   /* Cor de destaque */
```

### Alterar Texto da Página Inicial

```bash
nano app/page.tsx
```

Encontre a seção hero e edite:
```tsx
<h1>Seu Novo Título</h1>
<p>Sua nova descrição</p>
```

## Clonar Para Novo Site

Use este site como base para criar outros:

```bash
cd /var/www/achadinhos-shopee
sudo bash clone-site.sh
```

O script vai perguntar:
- Nome do novo site
- Domínio
- Nome da loja

E criar uma cópia completa configurada!

### Exemplo de Uso

```bash
sudo bash clone-site.sh

# Nome do novo site: roupaschic
# Domínio: roupaschic.com.br
# Nome da loja: Roupas Chic Store
```

Isso cria:
- `/var/www/roupaschic/` - Novo diretório
- Configuração Nginx para roupaschic.com.br
- PM2 configurado
- Todos os textos atualizados

## Fluxo de Trabalho Recomendado

### Para Edições Rápidas

```bash
# 1. Ativar dev
sudo bash dev.sh

# 2. Editar
nano app/page.tsx

# 3. Verificar no navegador
# As mudanças aparecem automaticamente

# 4. Voltar para produção
sudo bash prod.sh
```

### Para Mudanças Grandes

```bash
# 1. Fazer backup
sudo cp -r /var/www/achadinhos-shopee /var/www/achadinhos-shopee.backup

# 2. Ativar dev
sudo bash dev.sh

# 3. Fazer todas as edições necessárias

# 4. Testar completamente

# 5. Voltar para produção
sudo bash prod.sh
```

## Comandos Úteis

### Ver Status

```bash
pm2 status
```

### Ver Logs em Tempo Real

```bash
pm2 logs
```

### Reiniciar Aplicação

```bash
pm2 restart achadinhos-shopee
```

### Ver Processos Rodando

```bash
pm2 list
```

### Parar Aplicação

```bash
pm2 stop achadinhos-shopee
```

### Limpar Cache

```bash
cd /var/www/achadinhos-shopee
rm -rf .next
npm run build
pm2 restart achadinhos-shopee
```

## Gerenciando Múltiplos Sites

### Listar Todos os Sites

```bash
pm2 list
ls /var/www/
```

### Alternar Entre Sites

```bash
# Site 1
cd /var/www/achadinhos-shopee
sudo bash dev.sh

# Site 2
cd /var/www/outro-site
sudo bash dev.sh
```

### Portas Diferentes

Por padrão, todos usam porta 3000. Para múltiplos sites simultaneamente, edite `package.json`:

```json
"dev": "next dev -p 3001",
"start": "next start -p 3001"
```

E atualize o Nginx para a nova porta.

## Dicas de Edição

### 1. Sempre Teste no Dev Primeiro

Nunca edite direto em produção.

### 2. Faça Backup Antes de Grandes Mudanças

```bash
sudo cp -r /var/www/achadinhos-shopee /var/www/backup-$(date +%Y%m%d)
```

### 3. Use Git Para Controle de Versão

```bash
cd /var/www/achadinhos-shopee
git add .
git commit -m "Descrição das mudanças"
git push
```

### 4. Monitore os Logs

Sempre tenha um terminal com logs abertos:

```bash
pm2 logs
```

### 5. Documente Suas Mudanças

Crie um arquivo CHANGELOG.md para registrar o que você mudou.

## Resolução de Problemas

### Mudanças Não Aparecem

```bash
# Limpar cache
rm -rf .next
pm2 restart achadinhos-shopee
```

### Erro ao Salvar Arquivo

```bash
# Verificar permissões
sudo chown -R $USER:$USER /var/www/achadinhos-shopee
```

### Site Offline Após Edição

```bash
# Ver erro
pm2 logs

# Voltar para versão anterior
cd /var/www/
sudo rm -rf achadinhos-shopee
sudo mv achadinhos-shopee.backup achadinhos-shopee
pm2 restart achadinhos-shopee
```

### PM2 Não Inicia

```bash
# Resetar PM2
pm2 kill
pm2 start ecosystem.prod.config.js
pm2 save
```

## Recursos Adicionais

### Aprender React/Next.js

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)

### Aprender Tailwind CSS

- [Tailwind Docs](https://tailwindcss.com/docs)

### Terminal Linux

- `ls` - Listar arquivos
- `cd` - Mudar diretório
- `pwd` - Ver diretório atual
- `nano` - Editar arquivo
- `cat` - Ver conteúdo
- `cp` - Copiar
- `rm` - Remover

## Suporte

Se tiver dúvidas:

1. Verifique os logs: `pm2 logs`
2. Verifique o status: `pm2 status`
3. Reinicie: `pm2 restart achadinhos-shopee`
4. Consulte este guia
