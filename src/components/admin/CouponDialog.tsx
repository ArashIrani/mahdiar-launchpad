import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
}

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_purchase: number | null;
  max_uses: number | null;
  used_count: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  product_id: string | null;
}

interface CouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon: Coupon | null;
  mode: "create" | "edit";
  products: Product[];
  onSuccess: () => void;
}

const CouponDialog = ({ open, onOpenChange, coupon, mode, products, onSuccess }: CouponDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minPurchase, setMinPurchase] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [productId, setProductId] = useState<string>("all");

  useEffect(() => {
    if (open) {
      if (mode === "edit" && coupon) {
        setCode(coupon.code);
        setDiscountType(coupon.discount_type);
        setDiscountValue(coupon.discount_value.toString());
        setMinPurchase(coupon.min_purchase?.toString() || "");
        setMaxUses(coupon.max_uses?.toString() || "");
        setValidFrom(coupon.valid_from ? coupon.valid_from.split("T")[0] : "");
        setValidUntil(coupon.valid_until ? coupon.valid_until.split("T")[0] : "");
        setIsActive(coupon.is_active);
        setProductId(coupon.product_id || "all");
      } else {
        setCode("");
        setDiscountType("percentage");
        setDiscountValue("");
        setMinPurchase("");
        setMaxUses("");
        setValidFrom("");
        setValidUntil("");
        setIsActive(true);
        setProductId("all");
      }
    }
  }, [open, mode, coupon]);

  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error("کد کوپن را وارد کنید");
      return;
    }
    if (!discountValue || parseInt(discountValue) <= 0) {
      toast.error("مقدار تخفیف را وارد کنید");
      return;
    }
    if (discountType === "percentage" && parseInt(discountValue) > 100) {
      toast.error("درصد تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد");
      return;
    }

    setLoading(true);

    const couponData = {
      code: code.toUpperCase().trim(),
      discount_type: discountType,
      discount_value: parseInt(discountValue),
      min_purchase: minPurchase ? parseInt(minPurchase) : null,
      max_uses: maxUses ? parseInt(maxUses) : null,
      valid_from: validFrom ? new Date(validFrom).toISOString() : null,
      valid_until: validUntil ? new Date(validUntil).toISOString() : null,
      is_active: isActive,
      product_id: productId === "all" ? null : productId,
    };

    let error;
    if (mode === "create") {
      const { error: insertError } = await supabase
        .from("coupons")
        .insert(couponData);
      error = insertError;
    } else {
      const { error: updateError } = await supabase
        .from("coupons")
        .update(couponData)
        .eq("id", coupon?.id);
      error = updateError;
    }

    setLoading(false);

    if (error) {
      console.error("Coupon error:", error);
      if (error.code === "23505") {
        toast.error("این کد کوپن قبلاً استفاده شده است");
      } else {
        toast.error("خطا در ذخیره کوپن");
      }
      return;
    }

    toast.success(mode === "create" ? "کوپن ایجاد شد" : "کوپن ویرایش شد");
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "ایجاد کوپن جدید" : "ویرایش کوپن"}
          </DialogTitle>
          <DialogDescription>
            کوپن‌های تخفیف برای محصولات ایجاد کنید
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Coupon Code */}
          <div className="space-y-2">
            <Label htmlFor="code">کد کوپن</Label>
            <div className="flex gap-2">
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="مثال: SUMMER20"
                dir="ltr"
              />
              <Button type="button" variant="outline" onClick={generateCode}>
                تولید
              </Button>
            </div>
          </div>

          {/* Discount Type & Value */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>نوع تخفیف</Label>
              <Select value={discountType} onValueChange={setDiscountType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">درصدی</SelectItem>
                  <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">
                مقدار تخفیف {discountType === "percentage" ? "(%)" : "(تومان)"}
              </Label>
              <Input
                id="value"
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === "percentage" ? "20" : "50000"}
                dir="ltr"
              />
            </div>
          </div>

          {/* Min Purchase */}
          <div className="space-y-2">
            <Label htmlFor="minPurchase">حداقل خرید (تومان)</Label>
            <Input
              id="minPurchase"
              type="number"
              value={minPurchase}
              onChange={(e) => setMinPurchase(e.target.value)}
              placeholder="اختیاری"
              dir="ltr"
            />
          </div>

          {/* Max Uses */}
          <div className="space-y-2">
            <Label htmlFor="maxUses">حداکثر استفاده</Label>
            <Input
              id="maxUses"
              type="number"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              placeholder="نامحدود"
              dir="ltr"
            />
          </div>

          {/* Validity Period */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validFrom">از تاریخ</Label>
              <Input
                id="validFrom"
                type="date"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validUntil">تا تاریخ</Label>
              <Input
                id="validUntil"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                dir="ltr"
              />
            </div>
          </div>

          {/* Product Selection */}
          <div className="space-y-2">
            <Label>محدود به محصول</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه محصولات</SelectItem>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Is Active */}
          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">فعال</Label>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
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

export default CouponDialog;
