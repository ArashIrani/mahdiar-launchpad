import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Package, Key, TrendingUp, AlertCircle, ShoppingBag } from "lucide-react";

interface Order {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  product_id: string;
}

interface License {
  id: string;
  status: string;
  created_at: string;
}

interface DashboardStatsProps {
  orders: Order[];
  licenses: License[];
  products: Record<string, string>;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--destructive))", "hsl(var(--muted))"];

const DashboardStats = ({ orders, licenses, products }: DashboardStatsProps) => {
  // Calculate stats
  const completedOrders = orders.filter((o) => o.status === "completed");
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.amount, 0);
  const activeLicenses = licenses.filter((l) => l.status === "active").length;
  const revokedLicenses = licenses.filter((l) => l.status === "revoked").length;

  // Get last 7 days sales data
  const getLast7DaysSales = () => {
    const days: { date: string; amount: number; count: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayOrders = completedOrders.filter(
        (o) => o.created_at.split("T")[0] === dateStr
      );
      days.push({
        date: new Date(dateStr).toLocaleDateString("fa-IR", {
          month: "short",
          day: "numeric",
        }),
        amount: dayOrders.reduce((sum, o) => sum + o.amount, 0) / 1000,
        count: dayOrders.length,
      });
    }
    return days;
  };

  // License status pie data
  const licenseStatusData = [
    { name: "فعال", value: activeLicenses },
    { name: "لغو شده", value: revokedLicenses },
    { name: "سایر", value: licenses.length - activeLicenses - revokedLicenses },
  ].filter((d) => d.value > 0);

  // Sales by product data
  const getSalesByProduct = () => {
    const productSales: Record<string, { name: string; amount: number; count: number }> = {};
    
    completedOrders.forEach((order) => {
      const productName = products[order.product_id] || "نامشخص";
      if (!productSales[order.product_id]) {
        productSales[order.product_id] = { name: productName, amount: 0, count: 0 };
      }
      productSales[order.product_id].amount += order.amount;
      productSales[order.product_id].count += 1;
    });

    return Object.values(productSales).sort((a, b) => b.amount - a.amount);
  };

  const productSalesData = getSalesByProduct();

  const salesData = getLast7DaysSales();

  const formatPrice = (amount: number) => {
    return amount.toLocaleString("fa-IR") + " تومان";
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">درآمد کل</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              از {completedOrders.length} سفارش موفق
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کل سفارشات</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">
              {orders.filter((o) => o.status === "pending").length} در انتظار
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">لایسنس‌های فعال</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLicenses}</div>
            <p className="text-xs text-muted-foreground">
              از مجموع {licenses.length} لایسنس
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">لایسنس‌های لغو شده</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revokedLicenses}</div>
            <p className="text-xs text-muted-foreground">
              {licenses.length > 0
                ? ((revokedLicenses / licenses.length) * 100).toFixed(1)
                : 0}
              % از کل
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>فروش ۷ روز اخیر</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {salesData.some((d) => d.amount > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis
                      fontSize={12}
                      tickFormatter={(v) => `${v}k`}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value * 1000} تومان`, "مبلغ"]}
                      labelFormatter={(label) => `تاریخ: ${label}`}
                    />
                    <Bar
                      dataKey="amount"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  داده‌ای برای نمایش وجود ندارد
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sales by Product Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              فروش به تفکیک محصول
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {productSalesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productSalesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="amount"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {productSalesData.map((_, index) => (
                        <Cell
                          key={`cell-product-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [formatPrice(value), "مبلغ"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  فروشی وجود ندارد
                </div>
              )}
            </div>
            {/* Product sales table */}
            {productSalesData.length > 0 && (
              <div className="mt-4 space-y-2">
                {productSalesData.map((product, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span>{product.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">{product.count} سفارش</span>
                      <span className="font-medium">{formatPrice(product.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* License Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>وضعیت لایسنس‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {licenseStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={licenseStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {licenseStatusData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  لایسنسی وجود ندارد
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardStats;
