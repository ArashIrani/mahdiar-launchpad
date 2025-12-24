import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ReactivateLicenseDialogProps {
  licenseId: string | null;
  licenseKey: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ReactivateLicenseDialog = ({
  licenseId,
  licenseKey,
  open,
  onOpenChange,
  onSuccess,
}: ReactivateLicenseDialogProps) => {
  const [loading, setLoading] = useState(false);

  const handleReactivate = async () => {
    if (!licenseId) return;

    setLoading(true);
    const { error } = await supabase
      .from("licenses")
      .update({ status: "active" })
      .eq("id", licenseId);

    setLoading(false);

    if (error) {
      toast({
        title: "خطا",
        description: "فعال‌سازی مجدد لایسنس با خطا مواجه شد",
        variant: "destructive",
      });
    } else {
      toast({
        title: "موفق",
        description: "لایسنس با موفقیت فعال شد",
      });
      onOpenChange(false);
      onSuccess();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>فعال‌سازی مجدد لایسنس</AlertDialogTitle>
          <AlertDialogDescription>
            آیا از فعال‌سازی مجدد لایسنس زیر اطمینان دارید؟
            <br />
            <span dir="ltr" className="font-mono text-sm mt-2 block">
              {licenseKey}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel disabled={loading}>انصراف</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReactivate}
            disabled={loading}
            className="bg-primary hover:bg-primary/90"
          >
            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            فعال‌سازی
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ReactivateLicenseDialog;
