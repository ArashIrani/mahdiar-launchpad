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

interface DeleteProductDialogProps {
  productId: string | null;
  productName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const DeleteProductDialog = ({
  productId,
  productName,
  open,
  onOpenChange,
  onSuccess,
}: DeleteProductDialogProps) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!productId) return;

    setLoading(true);
    const { error } = await supabase.from("products").delete().eq("id", productId);

    setLoading(false);

    if (error) {
      toast({
        title: "خطا",
        description: error.message.includes("violates foreign key")
          ? "این محصول دارای سفارش یا لایسنس است و قابل حذف نیست"
          : "حذف محصول با خطا مواجه شد",
        variant: "destructive",
      });
    } else {
      toast({
        title: "موفق",
        description: "محصول با موفقیت حذف شد",
      });
      onOpenChange(false);
      onSuccess();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>حذف محصول</AlertDialogTitle>
          <AlertDialogDescription>
            آیا از حذف محصول "{productName}" اطمینان دارید؟
            <br />
            <span className="text-destructive font-medium">
              این عملیات قابل بازگشت نیست.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel disabled={loading}>انصراف</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            حذف
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteProductDialog;
