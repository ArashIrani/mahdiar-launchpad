import { useState } from "react";
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
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface RevokeLicenseDialogProps {
  licenseId: string | null;
  licenseKey: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const RevokeLicenseDialog = ({
  licenseId,
  licenseKey,
  open,
  onOpenChange,
  onSuccess,
}: RevokeLicenseDialogProps) => {
  const [loading, setLoading] = useState(false);

  const handleRevoke = async () => {
    if (!licenseId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("licenses")
        .update({ status: "revoked" })
        .eq("id", licenseId);

      if (error) throw error;

      toast({
        title: "لایسنس لغو شد",
        description: "لایسنس با موفقیت غیرفعال شد",
      });
      
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error revoking license:", error);
      toast({
        title: "خطا",
        description: "لغو لایسنس با مشکل مواجه شد",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>لغو لایسنس</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>آیا از لغو این لایسنس مطمئن هستید؟</p>
            <code className="block p-2 bg-muted rounded text-xs font-mono" dir="ltr">
              {licenseKey}
            </code>
            <p className="text-destructive">
              این عملیات غیرقابل بازگشت است و کاربر دیگر نمی‌تواند از این لایسنس استفاده کند.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row-reverse gap-2">
          <AlertDialogCancel disabled={loading}>انصراف</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRevoke}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            لغو لایسنس
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RevokeLicenseDialog;
