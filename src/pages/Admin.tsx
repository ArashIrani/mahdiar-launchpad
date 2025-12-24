import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, LogOut, Package, Key, AlertTriangle, Eye, CalendarPlus, Ban, MoreHorizontal, RefreshCw, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LicenseDetailsDialog from "@/components/admin/LicenseDetailsDialog";
import ExtendLicenseDialog from "@/components/admin/ExtendLicenseDialog";
import RevokeLicenseDialog from "@/components/admin/RevokeLicenseDialog";
import ReactivateLicenseDialog from "@/components/admin/ReactivateLicenseDialog";
import CreateLicenseDialog from "@/components/admin/CreateLicenseDialog";

interface Order {
  id: string;
  customer_email: string | null;
  customer_phone: string | null;
  amount: number;
  status: string;
  authority: string | null;
  ref_id: string | null;
  created_at: string;
  product_id: string;
}

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

interface Product {
  id: string;
  name: string;
}

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [products, setProducts] = useState<Record<string, string>>({});
  const [dataLoading, setDataLoading] = useState(true);

  // License management states
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setDataLoading(true);
    
    // Fetch products first for mapping
    const { data: productsData } = await supabase
      .from("products")
      .select("id, name");
    
    const productMap: Record<string, string> = {};
    productsData?.forEach((p: Product) => {
      productMap[p.id] = p.name;
    });
    setProducts(productMap);

    // Fetch orders
    const { data: ordersData } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    
    setOrders(ordersData || []);

    // Fetch licenses
    const { data: licensesData } = await supabase
      .from("licenses")
      .select("*")
      .order("created_at", { ascending: false });
    
    setLicenses(licensesData || []);
    setDataLoading(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (amount: number) => {
    return amount.toLocaleString("fa-IR") + " تومان";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
      active: "default",
      revoked: "destructive",
    };
    const labels: Record<string, string> = {
      completed: "تکمیل شده",
      pending: "در انتظار",
      failed: "ناموفق",
      active: "فعال",
      revoked: "لغو شده",
    };
    return (
      <Badge variant={variants[status] || "outline"}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>دسترسی محدود</CardTitle>
            <CardDescription>
              شما دسترسی ادمین ندارید. لطفاً با پشتیبانی تماس بگیرید.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={signOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              خروج
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">پنل مدیریت</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={signOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              خروج
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="orders" className="gap-2">
              <Package className="h-4 w-4" />
              سفارشات
            </TabsTrigger>
            <TabsTrigger value="licenses" className="gap-2">
              <Key className="h-4 w-4" />
              لایسنس‌ها
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>سفارشات</CardTitle>
                <CardDescription>لیست تمام سفارشات ثبت شده</CardDescription>
              </CardHeader>
              <CardContent>
                {dataLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">سفارشی یافت نشد</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>محصول</TableHead>
                          <TableHead>مشتری</TableHead>
                          <TableHead>مبلغ</TableHead>
                          <TableHead>وضعیت</TableHead>
                          <TableHead>کد پیگیری</TableHead>
                          <TableHead>تاریخ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">
                              {products[order.product_id] || "نامشخص"}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {order.customer_email && <div>{order.customer_email}</div>}
                                {order.customer_phone && <div dir="ltr">{order.customer_phone}</div>}
                              </div>
                            </TableCell>
                            <TableCell>{formatPrice(order.amount)}</TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell dir="ltr" className="font-mono text-xs">
                              {order.ref_id || "-"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatDate(order.created_at)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Licenses Tab */}
          <TabsContent value="licenses">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>لایسنس‌ها</CardTitle>
                  <CardDescription>لیست تمام لایسنس‌های صادر شده</CardDescription>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  صدور لایسنس
                </Button>
              </CardHeader>
              <CardContent>
                {dataLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : licenses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">لایسنسی یافت نشد</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>کلید لایسنس</TableHead>
                          <TableHead>محصول</TableHead>
                          <TableHead>وضعیت</TableHead>
                          <TableHead>دستگاه</TableHead>
                          <TableHead>انقضا</TableHead>
                          <TableHead>تاریخ صدور</TableHead>
                          <TableHead className="w-[60px]">عملیات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {licenses.map((license) => (
                          <TableRow key={license.id}>
                            <TableCell dir="ltr" className="font-mono text-xs max-w-[150px] truncate">
                              {license.license_key}
                            </TableCell>
                            <TableCell>
                              {products[license.product_id] || "نامشخص"}
                            </TableCell>
                            <TableCell>{getStatusBadge(license.status)}</TableCell>
                            <TableCell dir="ltr" className="text-xs max-w-[100px] truncate">
                              {license.device_id ? license.device_id.slice(0, 12) + "..." : "-"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {license.expires_at ? formatDate(license.expires_at) : "-"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatDate(license.created_at)}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedLicense(license);
                                      setDetailsDialogOpen(true);
                                    }}
                                  >
                                    <Eye className="ml-2 h-4 w-4" />
                                    مشاهده جزئیات
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedLicense(license);
                                      setExtendDialogOpen(true);
                                    }}
                                  >
                                    <CalendarPlus className="ml-2 h-4 w-4" />
                                    تمدید انقضا
                                  </DropdownMenuItem>
                                  {license.status !== "revoked" ? (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedLicense(license);
                                        setRevokeDialogOpen(true);
                                      }}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Ban className="ml-2 h-4 w-4" />
                                      لغو لایسنس
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedLicense(license);
                                        setReactivateDialogOpen(true);
                                      }}
                                      className="text-primary focus:text-primary"
                                    >
                                      <RefreshCw className="ml-2 h-4 w-4" />
                                      فعال‌سازی مجدد
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* License Management Dialogs */}
      <LicenseDetailsDialog
        license={selectedLicense}
        productName={selectedLicense ? products[selectedLicense.product_id] || "نامشخص" : ""}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />

      <ExtendLicenseDialog
        licenseId={selectedLicense?.id || null}
        currentExpiry={selectedLicense?.expires_at || null}
        open={extendDialogOpen}
        onOpenChange={setExtendDialogOpen}
        onSuccess={fetchData}
      />

      <RevokeLicenseDialog
        licenseId={selectedLicense?.id || null}
        licenseKey={selectedLicense?.license_key || ""}
        open={revokeDialogOpen}
        onOpenChange={setRevokeDialogOpen}
        onSuccess={fetchData}
      />

      <ReactivateLicenseDialog
        licenseId={selectedLicense?.id || null}
        licenseKey={selectedLicense?.license_key || ""}
        open={reactivateDialogOpen}
        onOpenChange={setReactivateDialogOpen}
        onSuccess={fetchData}
      />

      <CreateLicenseDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default Admin;
