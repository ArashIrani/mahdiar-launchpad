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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, Copy, Check } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface CreateLicenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const generateLicenseKey = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segments = 4;
  const segmentLength = 4;
  const parts: string[] = [];

  for (let i = 0; i < segments; i++) {
    let segment = "";
    for (let j = 0; j < segmentLength; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    parts.push(segment);
  }

  return parts.join("-");
};

const CreateLicenseDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: CreateLicenseDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [expiryDays, setExpiryDays] = useState("365");
  const [createdLicenseKey, setCreatedLicenseKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      fetchProducts();
      resetForm();
    }
  }, [open]);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("id, name, price");
    setProducts(data || []);
  };

  const resetForm = () => {
    setSelectedProduct("");
    setCustomerEmail("");
    setCustomerPhone("");
    setExpiryDays("365");
    setCreatedLicenseKey(null);
    setCopied(false);
  };

  const handleCreate = async () => {
    if (!selectedProduct) {
      toast({
        title: "خطا",
        description: "لطفاً محصول را انتخاب کنید",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const product = products.find((p) => p.id === selectedProduct);
      if (!product) throw new Error("محصول یافت نشد");

      // Create manual order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          product_id: selectedProduct,
          amount: 0,
          status: "manual",
          customer_email: customerEmail || null,
          customer_phone: customerPhone || null,
        })
        .select("id")
        .single();

      if (orderError) throw orderError;

      // Generate license key
      const licenseKey = generateLicenseKey();

      // Calculate expiry date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiryDays));

      // Create license
      const { error: licenseError } = await supabase.from("licenses").insert({
        license_key: licenseKey,
        order_id: orderData.id,
        product_id: selectedProduct,
        status: "active",
        expires_at: expiresAt.toISOString(),
      });

      if (licenseError) throw licenseError;

      setCreatedLicenseKey(licenseKey);
      toast({
        title: "موفق",
        description: "لایسنس با موفقیت ایجاد شد",
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message || "خطا در ایجاد لایسنس",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (createdLicenseKey) {
      await navigator.clipboard.writeText(createdLicenseKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>صدور لایسنس جدید</DialogTitle>
          <DialogDescription>
            یک لایسنس جدید به صورت دستی ایجاد کنید
          </DialogDescription>
        </DialogHeader>

        {createdLicenseKey ? (
          <div className="space-y-4 py-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">کلید لایسنس ایجاد شده:</p>
              <div className="flex items-center gap-2 justify-center">
                <code className="bg-muted px-4 py-2 rounded-md font-mono text-lg" dir="ltr">
                  {createdLicenseKey}
                </code>
                <Button variant="outline" size="icon" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                بستن
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>محصول *</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب محصول" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>ایمیل مشتری (اختیاری)</Label>
              <Input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="email@example.com"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label>شماره تماس (اختیاری)</Label>
              <Input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="09xxxxxxxxx"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label>مدت اعتبار (روز)</Label>
              <Select value={expiryDays} onValueChange={setExpiryDays}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">۳۰ روز</SelectItem>
                  <SelectItem value="90">۹۰ روز</SelectItem>
                  <SelectItem value="180">۶ ماه</SelectItem>
                  <SelectItem value="365">۱ سال</SelectItem>
                  <SelectItem value="730">۲ سال</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                انصراف
              </Button>
              <Button onClick={handleCreate} disabled={loading}>
                {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                ایجاد لایسنس
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateLicenseDialog;
