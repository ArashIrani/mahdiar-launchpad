import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload, X, ImageIcon } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  is_active: boolean;
  deep_link_scheme: string | null;
  image_url: string | null;
  category: string | null;
}

interface ProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  mode: "create" | "edit";
}

const ProductDialog = ({
  product,
  open,
  onOpenChange,
  onSuccess,
  mode,
}: ProductDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [deepLinkScheme, setDeepLinkScheme] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (mode === "edit" && product) {
        setName(product.name);
        setDescription(product.description || "");
        setPrice(product.price.toString());
        setOriginalPrice(product.original_price?.toString() || "");
        setIsActive(product.is_active);
        setDeepLinkScheme(product.deep_link_scheme || "");
        setCategory(product.category || "");
        setImageUrl(product.image_url);
      } else {
        resetForm();
      }
    }
  }, [open, mode, product]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setOriginalPrice("");
    setIsActive(true);
    setDeepLinkScheme("");
    setCategory("");
    setImageUrl(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "خطا",
        description: "فقط فایل‌های تصویری مجاز هستند",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "خطا",
        description: "حداکثر حجم فایل ۵ مگابایت است",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      setImageUrl(urlData.publicUrl);
      toast({ title: "موفق", description: "تصویر با موفقیت آپلود شد" });
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message || "خطا در آپلود تصویر",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: "خطا",
        description: "نام محصول الزامی است",
        variant: "destructive",
      });
      return;
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      toast({
        title: "خطا",
        description: "قیمت معتبر وارد کنید",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const productData = {
      name: name.trim(),
      description: description.trim() || null,
      price: Number(price),
      original_price: originalPrice ? Number(originalPrice) : null,
      is_active: isActive,
      deep_link_scheme: deepLinkScheme.trim() || null,
      category: category.trim() || null,
      image_url: imageUrl,
    };

    try {
      if (mode === "create") {
        const { error } = await supabase.from("products").insert(productData);
        if (error) throw error;
        toast({ title: "موفق", description: "محصول با موفقیت ایجاد شد" });
      } else if (product) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", product.id);
        if (error) throw error;
        toast({ title: "موفق", description: "محصول با موفقیت بروزرسانی شد" });
      }
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message || "خطا در ذخیره محصول",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "ایجاد محصول جدید" : "ویرایش محصول"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "اطلاعات محصول جدید را وارد کنید"
              : "اطلاعات محصول را ویرایش کنید"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>تصویر محصول</Label>
            <div className="flex items-center gap-4">
              {imageUrl ? (
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt="تصویر محصول"
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -left-2 h-6 w-6"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-20 h-20 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="ml-2 h-4 w-4" />
                  )}
                  {uploading ? "در حال آپلود..." : "آپلود تصویر"}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  حداکثر ۵ مگابایت
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>نام محصول *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: اشتراک یک ساله"
            />
          </div>

          <div className="space-y-2">
            <Label>توضیحات</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیحات محصول..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>قیمت (تومان) *</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="۰"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>قیمت اصلی (اختیاری)</Label>
              <Input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="برای نمایش تخفیف"
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>دسته‌بندی</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="مثال: آموزشی"
              />
            </div>
            <div className="space-y-2">
              <Label>Deep Link Scheme</Label>
              <Input
                value={deepLinkScheme}
                onChange={(e) => setDeepLinkScheme(e.target.value)}
                placeholder="myapp://"
                dir="ltr"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label>فعال</Label>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            انصراف
          </Button>
          <Button onClick={handleSubmit} disabled={loading || uploading}>
            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "ایجاد" : "ذخیره"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;
