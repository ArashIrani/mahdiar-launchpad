import { useState, useEffect } from "react";
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
import { Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  is_active: boolean;
  deep_link_scheme: string | null;
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
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [deepLinkScheme, setDeepLinkScheme] = useState("");

  useEffect(() => {
    if (open) {
      if (mode === "edit" && product) {
        setName(product.name);
        setDescription(product.description || "");
        setPrice(product.price.toString());
        setOriginalPrice(product.original_price?.toString() || "");
        setIsActive(product.is_active);
        setDeepLinkScheme(product.deep_link_scheme || "");
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
      <DialogContent dir="rtl" className="sm:max-w-md">
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

          <div className="space-y-2">
            <Label>Deep Link Scheme</Label>
            <Input
              value={deepLinkScheme}
              onChange={(e) => setDeepLinkScheme(e.target.value)}
              placeholder="myapp://"
              dir="ltr"
            />
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
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "ایجاد" : "ذخیره"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;
