import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Calendar, Key, Hash } from "lucide-react";

interface License {
  id: string;
  license_key: string;
  status: string;
  device_id: string | null;
  activated_at: string | null;
  expires_at: string | null;
  created_at: string;
  order_id: string;
  product_id: string;
}

interface LicenseDetailsDialogProps {
  license: License | null;
  productName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LicenseDetailsDialog = ({
  license,
  productName,
  open,
  onOpenChange,
}: LicenseDetailsDialogProps) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      revoked: "destructive",
      expired: "secondary",
    };
    const labels: Record<string, string> = {
      active: "فعال",
      revoked: "لغو شده",
      expired: "منقضی شده",
    };
    return (
      <Badge variant={variants[status] || "outline"}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (!license) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            جزئیات لایسنس
          </DialogTitle>
          <DialogDescription>
            اطلاعات کامل لایسنس و دستگاه متصل
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* License Key */}
          <div className="p-3 rounded-lg bg-muted">
            <div className="text-xs text-muted-foreground mb-1">کلید لایسنس</div>
            <code className="text-sm font-mono break-all" dir="ltr">
              {license.license_key}
            </code>
          </div>

          {/* Status & Product */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">وضعیت</div>
              {getStatusBadge(license.status)}
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">محصول</div>
              <span className="text-sm font-medium">{productName}</span>
            </div>
          </div>

          {/* Device Info */}
          <div className="p-3 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">اطلاعات دستگاه</span>
            </div>
            {license.device_id ? (
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-muted-foreground">شناسه دستگاه</div>
                  <code className="text-xs font-mono break-all" dir="ltr">
                    {license.device_id}
                  </code>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                هنوز روی هیچ دستگاهی فعال نشده
              </p>
            )}
          </div>

          {/* Dates */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">تاریخ‌ها</span>
            </div>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">تاریخ صدور:</span>
                <span>{formatDate(license.created_at)}</span>
              </div>
              {license.activated_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">تاریخ فعالسازی:</span>
                  <span>{formatDate(license.activated_at)}</span>
                </div>
              )}
              {license.expires_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">تاریخ انقضا:</span>
                  <span>{formatDate(license.expires_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order ID */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Hash className="h-3 w-3" />
            <span>شناسه سفارش: {license.order_id.slice(0, 8)}...</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LicenseDetailsDialog;
