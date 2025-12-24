import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { Loader2, Upload, Trash2, GripVertical, Image as ImageIcon } from "lucide-react";

interface ProductImage {
  id: string;
  image_url: string;
  display_order: number;
}

interface ProductGalleryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
}

const ProductGalleryDialog = ({
  open,
  onOpenChange,
  productId,
  productName,
}: ProductGalleryDialogProps) => {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open && productId) {
      fetchImages();
    }
  }, [open, productId]);

  const fetchImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .order("display_order", { ascending: true });

    if (error) {
      toast.error("خطا در بارگذاری تصاویر");
    } else {
      setImages(data || []);
    }
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const maxOrder = images.length > 0 ? Math.max(...images.map(i => i.display_order)) : -1;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.startsWith("image/")) {
        toast.error(`فایل ${file.name} تصویر نیست`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`فایل ${file.name} بیش از ۵ مگابایت است`);
        continue;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${productId}/${Date.now()}-${i}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, file);

      if (uploadError) {
        toast.error(`خطا در آپلود ${file.name}`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from("product_images")
        .insert({
          product_id: productId,
          image_url: urlData.publicUrl,
          display_order: maxOrder + 1 + i,
        });

      if (insertError) {
        toast.error(`خطا در ذخیره ${file.name}`);
      }
    }

    toast.success("تصاویر آپلود شدند");
    fetchImages();
    setUploading(false);
    e.target.value = "";
  };

  const handleDelete = async (image: ProductImage) => {
    const fileName = image.image_url.split("/").pop();
    if (!fileName) return;

    const filePath = `${productId}/${fileName}`;
    
    await supabase.storage.from("product-images").remove([filePath]);
    
    const { error } = await supabase
      .from("product_images")
      .delete()
      .eq("id", image.id);

    if (error) {
      toast.error("خطا در حذف تصویر");
    } else {
      toast.success("تصویر حذف شد");
      setImages(images.filter((i) => i.id !== image.id));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            گالری تصاویر - {productName}
          </DialogTitle>
          <DialogDescription>
            تصاویر محصول را مدیریت کنید
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Section */}
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="gallery-upload"
              disabled={uploading}
            />
            <label
              htmlFor="gallery-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground" />
              )}
              <span className="text-sm text-muted-foreground">
                {uploading ? "در حال آپلود..." : "برای آپلود تصاویر کلیک کنید"}
              </span>
              <span className="text-xs text-muted-foreground">
                حداکثر ۵ مگابایت - فرمت‌های JPG, PNG, WEBP
              </span>
            </label>
          </div>

          {/* Images Grid */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : images.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              تصویری وجود ندارد
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="relative group rounded-lg overflow-hidden border border-border"
                >
                  <img
                    src={image.image_url}
                    alt="Product"
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(image)}
                    >
                      <Trash2 className="h-4 w-4 ml-1" />
                      حذف
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductGalleryDialog;
