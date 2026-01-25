import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Package, Image, Save, X, Upload, Loader2, Eye, EyeOff, FileText, Accessibility } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAdminProducts, Product, ProductInput } from '@/hooks/useAdminProducts';

export default function Products() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { fetchProducts, createProduct, updateProduct, deleteProduct, uploadImage, loading: hookLoading } = useAdminProducts();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    images: [] as string[],
    tags: '',
    stock: '9999',
    show_stock: true,
    active: true,
    featured: false,
    // Technical info
    page_count: '',
    file_format: 'PDF',
    file_size_mb: '',
    paper_format: 'A4',
    show_technical_info: false,
    age_range: '',
    // Accessibility
    is_accessible: false,
    show_accessibility: false,
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: fetchProducts,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: ProductInput) => {
      if (editingProduct) {
        return await updateProduct(editingProduct.id, data);
      } else {
        return await createProduct(data);
      }
    },
    onSuccess: (result) => {
      if (result) {
        queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
        toast.success(editingProduct ? 'Produto atualizado!' : 'Produto criado!');
        resetForm();
      } else {
        toast.error('Erro ao salvar produto');
      }
    },
    onError: (error: Error) => {
      toast.error('Erro ao salvar produto: ' + error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: (success) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
        toast.success('Produto excluído!');
      } else {
        toast.error('Erro ao excluir produto');
      }
    },
    onError: (error: Error) => {
      toast.error('Erro ao excluir: ' + error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      images: [],
      tags: '',
      stock: '9999',
      show_stock: true,
      active: true,
      featured: false,
      page_count: '',
      file_format: 'PDF',
      file_size_mb: '',
      paper_format: 'A4',
      show_technical_info: false,
      age_range: '',
      is_accessible: false,
      show_accessibility: false,
    });
    setEditingProduct(null);
    setIsDialogOpen(false);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description || '',
      price: product.price.toString(),
      images: product.images || [],
      tags: product.tags?.join(', ') || '',
      stock: (product.stock || 9999).toString(),
      show_stock: product.show_stock ?? true,
      active: product.active ?? true,
      featured: product.featured ?? false,
      page_count: product.page_count?.toString() || '',
      file_format: product.file_format || 'PDF',
      file_size_mb: product.file_size_mb?.toString() || '',
      paper_format: product.paper_format || 'A4',
      show_technical_info: product.show_technical_info ?? false,
      age_range: product.age_range || '',
      is_accessible: product.is_accessible ?? false,
      show_accessibility: product.show_accessibility ?? false,
    });
    setIsDialogOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const newImages: string[] = [];

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} não é uma imagem válida`);
          continue;
        }

        const url = await uploadImage(file);
        if (url) {
          newImages.push(url);
        }
      }

      if (newImages.length > 0) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...newImages]
        }));
        toast.success(`${newImages.length} imagem(s) enviada(s)!`);
      }
    } catch (error) {
      toast.error('Erro ao enviar imagens');
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data: ProductInput = {
      title: formData.title,
      description: formData.description || null,
      price: parseFloat(formData.price) || 0,
      images: formData.images,
      tags: formData.tags ? formData.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
      stock: parseInt(formData.stock) || 9999,
      show_stock: formData.show_stock,
      active: formData.active,
      featured: formData.featured,
      page_count: formData.page_count ? parseInt(formData.page_count) : null,
      file_format: formData.file_format || null,
      file_size_mb: formData.file_size_mb ? parseFloat(formData.file_size_mb) : null,
      paper_format: formData.paper_format || null,
      show_technical_info: formData.show_technical_info,
      age_range: formData.age_range || null,
      is_accessible: formData.is_accessible,
      show_accessibility: formData.show_accessibility,
    };

    saveMutation.mutate(data);
  };

  const handleToggleActive = async (product: Product) => {
    const result = await updateProduct(product.id, { active: !product.active });
    if (result) {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(product.active ? 'Produto desativado!' : 'Produto ativado!');
    } else {
      toast.error('Erro ao alterar status do produto');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-fredoka text-2xl md:text-3xl font-bold">Produtos</h1>
          <p className="text-muted-foreground text-sm md:text-base">Gerencie seus ebooks e atividades</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="btn-rainbow w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Info */}
                <div className="col-span-1 md:col-span-2">
                  <Label>Título *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Nome do produto"
                    required
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição do produto"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Preço (R$) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="29.90"
                    required
                  />
                </div>
                <div>
                  <Label>Estoque</Label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="9999"
                  />
                </div>
                
                {/* Stock visibility toggle */}
                <div className="col-span-1 md:col-span-2 flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.show_stock}
                      onCheckedChange={(checked) => setFormData({ ...formData, show_stock: checked })}
                    />
                    <Label className="flex items-center gap-2 cursor-pointer">
                      {formData.show_stock ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      {formData.show_stock ? 'Mostrar estoque ao cliente' : 'Ocultar estoque do cliente'}
                    </Label>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="col-span-1 md:col-span-2">
                  <Label className="flex items-center gap-2 mb-2">
                    <Image className="h-4 w-4" />
                    Imagens do Produto (Galeria)
                  </Label>
                  
                  {/* Current Images */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mb-3">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={img} 
                            alt={`Imagem ${index + 1}`}
                            className="w-full aspect-square object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImages}
                    className="w-full border-dashed"
                  >
                    {uploadingImages ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Fazer upload de imagens
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Clique para selecionar imagens do seu dispositivo. Múltiplas imagens permitidas.
                  </p>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <Label>Faixa Etária (opcional)</Label>
                  <Input
                    value={formData.age_range}
                    onChange={(e) => setFormData({ ...formData, age_range: e.target.value })}
                    placeholder="Ex: 3 a 6 anos"
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <Label>Tags (opcional)</Label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Ex: Alfabetização, Matemática, Coordenação"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separe as tags por vírgula.
                  </p>
                </div>

                <div className="col-span-1 md:col-span-2 flex flex-wrap items-center gap-4 md:gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.active}
                      onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                    />
                    <Label className="cursor-pointer">Produto Ativo</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                    />
                    <Label className="cursor-pointer">Destaque</Label>
                  </div>
                </div>

                {/* Technical Info Section */}
                <div className="col-span-1 md:col-span-2">
                  <Separator className="my-4" />
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Informações Técnicas</h3>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg mb-4">
                    <Switch
                      checked={formData.show_technical_info}
                      onCheckedChange={(checked) => setFormData({ ...formData, show_technical_info: checked })}
                    />
                    <Label className="flex items-center gap-2 cursor-pointer">
                      {formData.show_technical_info ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      {formData.show_technical_info ? 'Exibir informações técnicas ao cliente' : 'Ocultar informações técnicas'}
                    </Label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Quantidade de Páginas</Label>
                      <Input
                        type="number"
                        value={formData.page_count}
                        onChange={(e) => setFormData({ ...formData, page_count: e.target.value })}
                        placeholder="Ex: 80"
                      />
                    </div>
                    <div>
                      <Label>Formato do Arquivo</Label>
                      <Input
                        value={formData.file_format}
                        onChange={(e) => setFormData({ ...formData, file_format: e.target.value })}
                        placeholder="Ex: PDF"
                      />
                    </div>
                    <div>
                      <Label>Tamanho do Arquivo (MB)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.file_size_mb}
                        onChange={(e) => setFormData({ ...formData, file_size_mb: e.target.value })}
                        placeholder="Ex: 12.5"
                      />
                    </div>
                    <div>
                      <Label>Formato da Folha</Label>
                      <Input
                        value={formData.paper_format}
                        onChange={(e) => setFormData({ ...formData, paper_format: e.target.value })}
                        placeholder="Ex: A4"
                      />
                    </div>
                  </div>
                </div>

                {/* Accessibility Section */}
                <div className="col-span-1 md:col-span-2">
                  <Separator className="my-4" />
                  <div className="flex items-center gap-2 mb-4">
                    <Accessibility className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Acessibilidade Educacional</h3>
                  </div>
                  
                  <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.is_accessible}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_accessible: checked })}
                      />
                      <Label className="cursor-pointer">
                        Produto com recursos de acessibilidade
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Marque se o produto é adaptado para pessoas com deficiências diversas (acessibilidade educacional e cognitiva).
                    </p>
                    
                    {formData.is_accessible && (
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Switch
                          checked={formData.show_accessibility}
                          onCheckedChange={(checked) => setFormData({ ...formData, show_accessibility: checked })}
                        />
                        <Label className="flex items-center gap-2 cursor-pointer">
                          {formData.show_accessibility ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          Exibir selo de acessibilidade ao cliente
                        </Label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm} className="w-full sm:w-auto">
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button type="submit" disabled={saveMutation.isPending || hookLoading} className="w-full sm:w-auto">
                  <Save className="mr-2 h-4 w-4" />
                  {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          Carregando...
        </div>
      ) : products?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">Nenhum produto cadastrado</h3>
            <p className="text-muted-foreground text-sm">Clique em "Novo Produto" para começar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {products?.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardContent className="p-3 md:p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
                    <div className="w-full sm:w-16 h-32 sm:h-16 bg-muted rounded-xl overflow-hidden flex-shrink-0">
                      {product.images?.[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium truncate">{product.title}</h3>
                        {product.featured && (
                          <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-full">
                            Destaque
                          </span>
                        )}
                        {!product.active && (
                          <span className="px-2 py-0.5 bg-destructive/10 text-destructive text-xs rounded-full">
                            Inativo
                          </span>
                        )}
                        {product.active && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                            Ativo
                          </span>
                        )}
                        {product.is_accessible && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
                            <Accessibility className="h-3 w-3" />
                            Acessível
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {product.description || 'Sem descrição'}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-sm flex-wrap">
                        <span className="font-bold text-primary">
                          R$ {product.price.toFixed(2)}
                        </span>
                        <span className="text-muted-foreground">
                          {product.images?.length || 0} imagens
                        </span>
                        <span className="text-muted-foreground flex items-center gap-1">
                          {product.show_stock ? (
                            <>Estoque: {product.stock ?? 9999}</>
                          ) : (
                            <><EyeOff className="h-3 w-3" /> Estoque oculto</>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(product)}
                        className={product.active ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                      >
                        {product.active ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEditDialog(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          if (confirm('Tem certeza que deseja excluir este produto?')) {
                            deleteMutation.mutate(product.id);
                          }
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}