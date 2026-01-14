"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Pencil, Trash2, Settings, Package, Upload, Key } from "lucide-react"
import { getProducts, saveProducts, type Product } from "@/lib/products"
import { getSettings, saveSettings, isFirstAccess, type SiteSettings } from "@/lib/settings"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      getSettings().then(setSettings)
    }
  }, [mounted])

  useEffect(() => {
    if (isAuthenticated && settings) {
      getProducts().then(setProducts)
      if (isFirstAccess(settings)) {
        setShowPasswordChange(true)
      }
    }
  }, [isAuthenticated, settings])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!settings) {
      alert("Erro: Configurações não carregadas. Recarregue a página.")
      return
    }

    const currentSettings = await getSettings()

    if (password === currentSettings.adminPassword) {
      setIsAuthenticated(true)
      setSettings(currentSettings)
    } else if (password === "admin123" && currentSettings.adminPassword !== "admin123") {
      if (confirm("Deseja resetar a senha para 'admin123'? (Recomendado apenas se você esqueceu a senha)")) {
        const resetSettings = { ...currentSettings, adminPassword: "admin123" }
        await saveSettings(resetSettings)
        setSettings(resetSettings)
        setIsAuthenticated(true)
        setShowPasswordChange(true)
      } else {
        alert("Senha incorreta!")
      }
    } else {
      alert("Senha incorreta!")
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      alert("As senhas não coincidem!")
      return
    }
    if (newPassword.length < 6) {
      alert("A senha deve ter no mínimo 6 caracteres!")
      return
    }
    if (!settings) return
    const updatedSettings = { ...settings, adminPassword: newPassword }
    await saveSettings(updatedSettings)
    setSettings(updatedSettings)
    setShowPasswordChange(false)
    setNewPassword("")
    setConfirmPassword("")
    alert("Senha alterada com sucesso!")
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (dataUrl: string) => void) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert("Imagem muito grande! Máximo 5MB.")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      callback(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const newProduct: Product = {
      id: editingProduct?.id || Date.now().toString(),
      title: formData.get("title") as string,
      price: Number.parseFloat(formData.get("price") as string),
      originalPrice: formData.get("originalPrice")
        ? Number.parseFloat(formData.get("originalPrice") as string)
        : undefined,
      image: formData.get("image") as string,
      shopeeLink: formData.get("shopeeLink") as string,
      category: formData.get("category") as Product["category"],
      description: formData.get("description") as string,
    }

    let updatedProducts: Product[]
    if (editingProduct) {
      updatedProducts = products.map((p) => (p.id === editingProduct.id ? newProduct : p))
    } else {
      updatedProducts = [...products, newProduct]
    }

    await saveProducts(updatedProducts)
    setProducts(updatedProducts)
    setIsDialogOpen(false)
    setEditingProduct(null)
    e.currentTarget.reset()
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja deletar este produto?")) {
      const updatedProducts = products.filter((p) => p.id !== id)
      await saveProducts(updatedProducts)
      setProducts(updatedProducts)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsDialogOpen(true)
  }

  const handleSettingsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!settings) return
    const formData = new FormData(e.currentTarget)

    const newSettings: SiteSettings = {
      storeName: formData.get("storeName") as string,
      storeLogo: formData.get("storeLogo") as string,
      storeDescription: formData.get("storeDescription") as string,
      domain: formData.get("domain") as string,
      primaryColor: formData.get("primaryColor") as string,
      backgroundColor: formData.get("backgroundColor") as string,
      textColor: formData.get("textColor") as string,
      accentColor: formData.get("accentColor") as string,
      headerHeight: formData.get("headerHeight") as string,
      favicon: formData.get("favicon") as string,
      adminPassword: settings.adminPassword,
      fontFamily: formData.get("fontFamily") as string,
      socialMedia: {
        instagram: formData.get("instagram") as string,
        facebook: formData.get("facebook") as string,
        twitter: formData.get("twitter") as string,
        whatsapp: formData.get("whatsapp") as string,
      },
    }

    await saveSettings(newSettings)
    setSettings(newSettings)
    alert("Configurações salvas! Recarregue a página para ver as mudanças.")
  }

  if (!settings) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Carregando configurações...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md px-4">
            <div className="rounded-lg border bg-card p-8">
              <h1 className="text-2xl font-bold mb-6 text-center">Acesso Admin</h1>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite a senha"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Entrar
                </Button>
              </form>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <Dialog open={showPasswordChange} onOpenChange={() => {}}>
        <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Alterar Senha Padrão
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Por segurança, você precisa alterar a senha padrão antes de continuar.
            </p>
            <div>
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Digite a senha novamente"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Alterar Senha
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <main className="flex-1">
        <section className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Painel Admin</h1>
              <p className="text-muted-foreground">Gerencie produtos e configurações do site. Acesse via: /admin</p>
            </div>

            <Tabs defaultValue="products" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="products">
                  <Package className="mr-2 h-4 w-4" />
                  Produtos
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </TabsTrigger>
              </TabsList>

              <TabsContent value="products" className="mt-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Produtos</h2>
                    <p className="text-muted-foreground">Gerencie os produtos da sua loja</p>
                  </div>
                  <Dialog
                    open={isDialogOpen}
                    onOpenChange={(open) => {
                      setIsDialogOpen(open)
                      if (!open) setEditingProduct(null)
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Produto
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="title">Título</Label>
                          <Input id="title" name="title" defaultValue={editingProduct?.title} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="price">Preço</Label>
                            <Input
                              id="price"
                              name="price"
                              type="number"
                              step="0.01"
                              defaultValue={editingProduct?.price}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="originalPrice">Preço Original (opcional)</Label>
                            <Input
                              id="originalPrice"
                              name="originalPrice"
                              type="number"
                              step="0.01"
                              defaultValue={editingProduct?.originalPrice}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="category">Categoria</Label>
                          <Select name="category" defaultValue={editingProduct?.category} required>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Camisetas">Camisetas</SelectItem>
                              <SelectItem value="Calças">Calças</SelectItem>
                              <SelectItem value="Vestidos">Vestidos</SelectItem>
                              <SelectItem value="Acessórios">Acessórios</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="imageUpload">Imagem do Produto</Label>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Input
                                id="imageUpload"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  handleImageUpload(e, (dataUrl) => {
                                    const imageInput = document.getElementById("image") as HTMLInputElement
                                    if (imageInput) imageInput.value = dataUrl
                                  })
                                }}
                                className="cursor-pointer"
                              />
                              <Upload className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Faça upload de uma imagem (máx. 5MB) ou use URL
                            </p>
                            <Input
                              id="image"
                              name="image"
                              type="text"
                              defaultValue={editingProduct?.image}
                              placeholder="ou cole a URL da imagem"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="shopeeLink">Link da Shopee</Label>
                          <Input
                            id="shopeeLink"
                            name="shopeeLink"
                            type="url"
                            defaultValue={editingProduct?.shopeeLink}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Descrição</Label>
                          <Textarea
                            id="description"
                            name="description"
                            defaultValue={editingProduct?.description}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          {editingProduct ? "Atualizar" : "Criar"} Produto
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.title}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>R$ {product.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Segurança</CardTitle>
                      <CardDescription>Altere a senha de acesso ao painel admin</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        onClick={() => setShowPasswordChange(true)}
                        className="w-full sm:w-auto"
                      >
                        <Key className="mr-2 h-4 w-4" />
                        Alterar Senha
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Aparência</CardTitle>
                      <CardDescription>Personalize as cores e fontes do seu site</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSettingsSubmit} className="space-y-6">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="storeName">Nome da Loja</Label>
                            <Input
                              id="storeName"
                              name="storeName"
                              defaultValue={settings.storeName}
                              placeholder="Nome da sua loja"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="storeDescription">Descrição</Label>
                            <Textarea
                              id="storeDescription"
                              name="storeDescription"
                              defaultValue={settings.storeDescription}
                              placeholder="Descrição da loja"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="domain">Domínio</Label>
                            <Input
                              id="domain"
                              name="domain"
                              defaultValue={settings.domain}
                              placeholder="seusite.com.br"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="fontFamily">Fonte do Site</Label>
                            <Select name="fontFamily" defaultValue={settings.fontFamily}>
                              <SelectTrigger>
                                <SelectValue placeholder="Escolha uma fonte" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Inter">Inter (Padrão)</SelectItem>
                                <SelectItem value="Roboto">Roboto</SelectItem>
                                <SelectItem value="Open Sans">Open Sans</SelectItem>
                                <SelectItem value="Lato">Lato</SelectItem>
                                <SelectItem value="Montserrat">Montserrat</SelectItem>
                                <SelectItem value="Poppins">Poppins</SelectItem>
                                <SelectItem value="Raleway">Raleway</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">Selecione a fonte principal do site</p>
                          </div>

                          <div className="space-y-4 pt-4 border-t">
                            <h3 className="font-semibold">Cores do Site</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="primaryColor">Cor Principal</Label>
                                <div className="flex gap-2">
                                  <Input
                                    id="primaryColor"
                                    name="primaryColor"
                                    type="color"
                                    defaultValue={settings.primaryColor}
                                    className="w-20 h-10 cursor-pointer"
                                  />
                                  <Input
                                    type="text"
                                    defaultValue={settings.primaryColor}
                                    placeholder="#8B5CF6"
                                    className="flex-1"
                                    onChange={(e) => {
                                      const colorInput = document.getElementById("primaryColor") as HTMLInputElement
                                      if (colorInput) colorInput.value = e.target.value
                                    }}
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Cor dos botões e destaques</p>
                              </div>

                              <div>
                                <Label htmlFor="accentColor">Cor de Destaque</Label>
                                <div className="flex gap-2">
                                  <Input
                                    id="accentColor"
                                    name="accentColor"
                                    type="color"
                                    defaultValue={settings.accentColor}
                                    className="w-20 h-10 cursor-pointer"
                                  />
                                  <Input
                                    type="text"
                                    defaultValue={settings.accentColor}
                                    placeholder="#8B5CF6"
                                    className="flex-1"
                                    onChange={(e) => {
                                      const colorInput = document.getElementById("accentColor") as HTMLInputElement
                                      if (colorInput) colorInput.value = e.target.value
                                    }}
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Cor secundária para acentos</p>
                              </div>

                              <div>
                                <Label htmlFor="backgroundColor">Cor de Fundo</Label>
                                <div className="flex gap-2">
                                  <Input
                                    id="backgroundColor"
                                    name="backgroundColor"
                                    type="color"
                                    defaultValue={settings.backgroundColor}
                                    className="w-20 h-10 cursor-pointer"
                                  />
                                  <Input
                                    type="text"
                                    defaultValue={settings.backgroundColor}
                                    placeholder="#FFFFFF"
                                    className="flex-1"
                                    onChange={(e) => {
                                      const colorInput = document.getElementById("backgroundColor") as HTMLInputElement
                                      if (colorInput) colorInput.value = e.target.value
                                    }}
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Cor de fundo do site</p>
                              </div>

                              <div>
                                <Label htmlFor="textColor">Cor do Texto</Label>
                                <div className="flex gap-2">
                                  <Input
                                    id="textColor"
                                    name="textColor"
                                    type="color"
                                    defaultValue={settings.textColor}
                                    className="w-20 h-10 cursor-pointer"
                                  />
                                  <Input
                                    type="text"
                                    defaultValue={settings.textColor}
                                    placeholder="#000000"
                                    className="flex-1"
                                    onChange={(e) => {
                                      const colorInput = document.getElementById("textColor") as HTMLInputElement
                                      if (colorInput) colorInput.value = e.target.value
                                    }}
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Cor principal do texto</p>
                              </div>
                            </div>

                            <div>
                              <Label>Paletas Predefinidas</Label>
                              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    ;(document.getElementById("primaryColor") as HTMLInputElement).value = "#8B5CF6"
                                    ;(document.getElementById("accentColor") as HTMLInputElement).value = "#8B5CF6"
                                  }}
                                  className="h-12 rounded border-2 hover:border-primary transition-colors"
                                  style={{ backgroundColor: "#8B5CF6" }}
                                  title="Roxo (Padrão)"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    ;(document.getElementById("primaryColor") as HTMLInputElement).value = "#3B82F6"
                                    ;(document.getElementById("accentColor") as HTMLInputElement).value = "#3B82F6"
                                  }}
                                  className="h-12 rounded border-2 hover:border-primary transition-colors"
                                  style={{ backgroundColor: "#3B82F6" }}
                                  title="Azul"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    ;(document.getElementById("primaryColor") as HTMLInputElement).value = "#10B981"
                                    ;(document.getElementById("accentColor") as HTMLInputElement).value = "#10B981"
                                  }}
                                  className="h-12 rounded border-2 hover:border-primary transition-colors"
                                  style={{ backgroundColor: "#10B981" }}
                                  title="Verde"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    ;(document.getElementById("primaryColor") as HTMLInputElement).value = "#F59E0B"
                                    ;(document.getElementById("accentColor") as HTMLInputElement).value = "#F59E0B"
                                  }}
                                  className="h-12 rounded border-2 hover:border-primary transition-colors"
                                  style={{ backgroundColor: "#F59E0B" }}
                                  title="Laranja"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    ;(document.getElementById("primaryColor") as HTMLInputElement).value = "#EF4444"
                                    ;(document.getElementById("accentColor") as HTMLInputElement).value = "#EF4444"
                                  }}
                                  className="h-12 rounded border-2 hover:border-primary transition-colors"
                                  style={{ backgroundColor: "#EF4444" }}
                                  title="Vermelho"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    ;(document.getElementById("primaryColor") as HTMLInputElement).value = "#EC4899"
                                    ;(document.getElementById("accentColor") as HTMLInputElement).value = "#EC4899"
                                  }}
                                  className="h-12 rounded border-2 hover:border-primary transition-colors"
                                  style={{ backgroundColor: "#EC4899" }}
                                  title="Rosa"
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                Clique em uma cor para aplicar rapidamente
                              </p>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="logoUpload">Logo da Loja</Label>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Input
                                  id="logoUpload"
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    handleImageUpload(e, (dataUrl) => {
                                      const logoInput = document.getElementById("storeLogo") as HTMLInputElement
                                      if (logoInput) logoInput.value = dataUrl
                                    })
                                  }}
                                  className="cursor-pointer"
                                />
                                <Upload className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <Input
                                id="storeLogo"
                                name="storeLogo"
                                defaultValue={settings.storeLogo}
                                placeholder="ou cole a URL da logo"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="faviconUpload">Favicon (ícone do site)</Label>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Input
                                  id="faviconUpload"
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    handleImageUpload(e, (dataUrl) => {
                                      const faviconInput = document.getElementById("favicon") as HTMLInputElement
                                      if (faviconInput) faviconInput.value = dataUrl
                                    })
                                  }}
                                  className="cursor-pointer"
                                />
                                <Upload className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <Input
                                id="favicon"
                                name="favicon"
                                defaultValue={settings.favicon}
                                placeholder="ou cole a URL do favicon"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                          <h3 className="font-semibold">Redes Sociais</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="instagram">Instagram</Label>
                              <Input
                                id="instagram"
                                name="instagram"
                                defaultValue={settings.socialMedia.instagram}
                                placeholder="https://instagram.com/sua-loja"
                              />
                            </div>
                            <div>
                              <Label htmlFor="facebook">Facebook</Label>
                              <Input
                                id="facebook"
                                name="facebook"
                                defaultValue={settings.socialMedia.facebook}
                                placeholder="https://facebook.com/sua-loja"
                              />
                            </div>
                            <div>
                              <Label htmlFor="twitter">Twitter/X</Label>
                              <Input
                                id="twitter"
                                name="twitter"
                                defaultValue={settings.socialMedia.twitter}
                                placeholder="https://twitter.com/sua-loja"
                              />
                            </div>
                            <div>
                              <Label htmlFor="whatsapp">WhatsApp</Label>
                              <Input
                                id="whatsapp"
                                name="whatsapp"
                                defaultValue={settings.socialMedia.whatsapp}
                                placeholder="https://wa.me/5511999999999"
                              />
                            </div>
                          </div>
                        </div>

                        <Button type="submit" className="w-full">
                          Salvar Configurações
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
