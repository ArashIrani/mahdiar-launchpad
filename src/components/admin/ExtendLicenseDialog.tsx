import { useState } from "react";
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
import { Calendar, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ExtendLicenseDialogProps {
  licenseId: string | null;
  currentExpiry: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ExtendLicenseDialog = ({
  licenseId,
  currentExpiry,
  open,
  onOpenChange,
  onSuccess,
}: ExtendLicenseDialogProps) => {
  const [days, setDays] = useState("30");
  const [loading, setLoading] = useState(false);

  const calculateNewExpiry = () => {
    const baseDate = currentExpiry ? new Date(currentExpiry) : new Date();
    const newDate = new Date(baseDate);
    newDate.setDate(newDate.getDate() + parseInt(days || "0"));
    return newDate;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleExtend = async () => {
    if (!licenseId || !days || parseInt(days) <= 0) return;

    setLoading(true);
    try {
      const newExpiry = calculateNewExpiry();
      
      const { error } = await supabase
        .from("licenses")
        .update({ expires_at: newExpiry.toISOString() })
        .eq("id", licenseId);

      if (error) throw error;

      toast({
        title: "تمدید موفق",
        description: `لایسنس تا ${formatDate(newExpiry)} تمدید شد`,
      });
      
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error extending license:", error);
      toast({
        title: "خطا",
        description: "تمدید لایسنس با مشکل مواجه شد",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            تمدید لایسنس
          </DialogTitle>
          <DialogDescription>
            مدت زمان تمدید لایسنس را مشخص کنید
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {currentExpiry && (
            <div className="p-3 rounded-lg bg-muted">
              <div className="text-xs text-muted-foreground mb-1">تاریخ انقضای فعلی</div>
              <span className="text-sm">{formatDate(new Date(currentExpiry))}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="days">تعداد روز تمدید</Label>
            <Input
              id="days"
              type="number"
              min="1"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="مثال: 30"
              dir="ltr"
            />
          </div>

          {days && parseInt(days) > 0 && (
            <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
              <div className="text-xs text-muted-foreground mb-1">تاریخ انقضای جدید</div>
              <span className="text-sm font-medium text-primary">
                {formatDate(calculateNewExpiry())}
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            انصراف
          </Button>
          <Button onClick={handleExtend} disabled={loading || !days || parseInt(days) <= 0}>
            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            تمدید
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExtendLicenseDialog;
