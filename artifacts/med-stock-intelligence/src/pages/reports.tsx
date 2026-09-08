import React, { useState, useMemo, useRef } from "react";
import { 
  useGetDashboard, 
  useListMedicines, 
  useListSupplyOrders, 
  useListAlerts 
} from "@workspace/api-client-react";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Printer, Download, FileSpreadsheet, Activity, TrendingUp, AlertCircle, ShoppingBag, ShieldAlert,
  Calendar as CalendarIcon, Filter
} from "lucide-react";
import { format, parseISO, isWithinInterval, subDays } from "date-fns";
import { ar } from "date-fns/locale";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell, PieChart, Pie
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export default function Reports() {
  const { data: dashboard, isLoading: dashLoading } = useGetDashboard();
  const { data: medicines, isLoading: medLoading } = useListMedicines();
  const { data: orders, isLoading: ordersLoading } = useListSupplyOrders();
  const { data: alerts, isLoading: alertsLoading } = useListAlerts();

  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date()
  });

  const [activeTab, setActiveTab] = useState("overview");

  const isLoading = dashLoading || medLoading || ordersLoading || alertsLoading;

  // Derive charts and insights
  const inventoryCategoryData = useMemo(() => {
    if (!medicines) return [];
    const counts = medicines.reduce((acc, med) => {
      acc[med.category] = (acc[med.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [medicines]);

  const stockStatusData = useMemo(() => {
    if (!medicines) return [];
    const counts = medicines.reduce((acc, med) => {
      acc[med.status] = (acc[med.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return [
      { name: "متوفر", value: counts["available"] || 0, color: "hsl(var(--secondary))" },
      { name: "منخفض", value: counts["low"] || 0, color: "hsl(var(--warning))" },
      { name: "حرج", value: counts["critical"] || 0, color: "hsl(var(--destructive))" },
    ];
  }, [medicines]);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter(order => {
      const orderDate = parseISO(order.orderedAt);
      return orderDate >= dateRange.from && orderDate <= dateRange.to;
    });
  }, [orders, dateRange]);

  const ordersByStatus = useMemo(() => {
    const counts = filteredOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return [
      { name: "مسودة", value: counts["draft"] || 0 },
      { name: "مطلوب", value: counts["ordered"] || 0 },
      { name: "مشحون", value: counts["shipped"] || 0 },
      { name: "مستلم", value: counts["received"] || 0 },
      { name: "متأخر", value: counts["delayed"] || 0 },
    ];
  }, [filteredOrders]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!medicines) return;
    const bom = "\uFEFF";
    let csv = bom + "الرقم التعريفي,اسم الدواء,الاسم العلمي,التصنيف,المخزون الحالي,الوحدة,نقطة إعادة الطلب,الأيام المتبقية,الحالة\n";
    medicines.forEach(m => {
      csv += `${m.id},"${m.name}","${m.scientificName}","${m.category}",${m.stock},"${m.unit}",${m.reorderPoint},${m.coverageDays},${m.status}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `تقرير_المخزون_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportOrders = () => {
    if (!filteredOrders) return;
    const bom = "\uFEFF";
    let csv = bom + "رقم الطلب,المورد,الدواء,الكمية,الحالة,تاريخ الطلب,تاريخ الوصول المتوقع\n";
    filteredOrders.forEach(o => {
      csv += `"${o.orderNumber}","${o.supplier}","${o.medicineName}",${o.quantity},${o.status},"${format(parseISO(o.orderedAt), "yyyy-MM-dd")}","${format(parseISO(o.expectedArrival), "yyyy-MM-dd")}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `تقرير_الطلبات_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up pb-12 print:bg-white print:text-black">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-primary" />
            مركز التقارير التنفيذية
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">تحليل شامل للمخزون، الاستهلاك، وأداء التوريد</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 bg-background border-border hover:bg-muted font-medium">
                <CalendarIcon className="w-4 h-4" />
                {dateRange.from ? format(dateRange.from, "dd MMM", { locale: ar }) : ""} - {dateRange.to ? format(dateRange.to, "dd MMM", { locale: ar }) : ""}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({ from: range.from, to: range.to });
                  } else if (range?.from) {
                    setDateRange({ from: range.from, to: new Date() });
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Button variant="outline" onClick={handlePrint} className="gap-2 font-medium">
            <Printer className="w-4 h-4" />
            طباعة
          </Button>
          <Button onClick={handleExportCSV} className="gap-2 font-medium shadow-md">
            <Download className="w-4 h-4" />
            تصدير المخزون
          </Button>
        </div>
      </div>

      <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-black mb-2">تقرير أداء مخزون الأدوية الذكي</h1>
        <p className="text-sm text-gray-500">
          تاريخ التقرير: {format(new Date(), "PPP", { locale: ar })}
          <br/>
          الفترة: {format(dateRange.from, "PPP", { locale: ar })} إلى {format(dateRange.to, "PPP", { locale: ar })}
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-6 bg-muted/50 p-1 rounded-xl h-auto border border-border/50 print:hidden">
          <TabsTrigger value="overview" className="rounded-lg py-2.5 px-6 font-bold text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">الملخص التنفيذي</TabsTrigger>
          <TabsTrigger value="inventory" className="rounded-lg py-2.5 px-6 font-bold text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">تحليل المخزون</TabsTrigger>
          <TabsTrigger value="supply" className="rounded-lg py-2.5 px-6 font-bold text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">أداء التوريد</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-sm border-border">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">صحة المخزون</p>
                    <h3 className="text-3xl font-black text-primary">{dashboard?.stockHealth}%</h3>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="mt-4 text-sm font-medium text-muted-foreground">متوسط استقرار الأدوية الحيوية</div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">الأصناف الحرجة</p>
                    <h3 className="text-3xl font-black text-destructive">{dashboard?.criticalCount}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 text-destructive" />
                  </div>
                </div>
                <div className="mt-4 text-sm font-medium text-muted-foreground">صنف تحت مستوى الأمان</div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">طلبات التوريد المفتوحة</p>
                    <h3 className="text-3xl font-black text-foreground">{dashboard?.openOrders}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-secondary" />
                  </div>
                </div>
                <div className="mt-4 text-sm font-medium text-muted-foreground">طلب قيد المعالجة والتنفيذ</div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">متوسط زمن الصرف</p>
                    <h3 className="text-3xl font-black text-warning">{dashboard?.averageDispenseMinutes}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-warning" />
                  </div>
                </div>
                <div className="mt-4 text-sm font-medium text-muted-foreground">دقيقة لكل وصفة طبية</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm border-border">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-lg font-bold">اتجاه الاستهلاك</CardTitle>
                <CardDescription>المنصرف مقابل الوارد (آخر أسبوع)</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-8">
                <div className="h-80 w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dashboard?.consumptionTrend}>
                      <defs>
                        <linearGradient id="colorDispensed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dx={-10} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', fontWeight: 'bold' }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Area type="monotone" dataKey="dispensed" name="منصرف" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorDispensed)" />
                      <Area type="monotone" dataKey="received" name="وارد" stroke="hsl(var(--secondary))" strokeWidth={3} fillOpacity={1} fill="url(#colorReceived)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-lg font-bold">توزيع حالات المخزون</CardTitle>
                <CardDescription>نسبة الأدوية حسب مستوى التوفر</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-8 flex items-center justify-center">
                <div className="h-80 w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stockStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stockStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', fontWeight: 'bold' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* INVENTORY TAB */}
        <TabsContent value="inventory" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="shadow-sm border-border lg:col-span-1">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-lg font-bold">توزيع الأدوية حسب التصنيف</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80 w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inventoryCategoryData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                      <XAxis type="number" axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} width={80} />
                      <RechartsTooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))' }} />
                      <Bar dataKey="value" name="عدد الأصناف" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border lg:col-span-2">
              <CardHeader className="border-b border-border/40 pb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">الأدوية المهددة بالنفاد</CardTitle>
                  <CardDescription>التي يكفي مخزونها لأقل من 30 يوماً</CardDescription>
                </div>
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 hidden md:flex">
                  {medicines?.filter(m => m.coverageDays < 30).length} صنف مهدد
                </Badge>
              </CardHeader>
              <CardContent className="p-0 overflow-auto max-h-[400px]">
                <table className="w-full text-sm text-right">
                  <thead className="bg-muted/50 text-muted-foreground sticky top-0 backdrop-blur-md">
                    <tr>
                      <th className="px-4 py-3 font-semibold">الدواء</th>
                      <th className="px-4 py-3 font-semibold">المخزون الحالي</th>
                      <th className="px-4 py-3 font-semibold">معدل الاستهلاك</th>
                      <th className="px-4 py-3 font-semibold">الأيام المتبقية</th>
                      <th className="px-4 py-3 font-semibold">تاريخ النفاد المتوقع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {medicines?.filter(m => m.coverageDays < 30).sort((a,b) => a.coverageDays - b.coverageDays).map(med => (
                      <tr key={med.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-bold">{med.name}</td>
                        <td className="px-4 py-3">
                          <span className="font-mono bg-muted px-2 py-1 rounded-md">{med.stock}</span> {med.unit}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{med.dailyConsumption} / يوم</td>
                        <td className="px-4 py-3">
                          <span className={`font-bold ${med.coverageDays < 7 ? 'text-destructive' : 'text-warning'}`}>
                            {med.coverageDays}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {format(parseISO(med.predictedRunoutDate), "dd MMM yyyy", { locale: ar })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SUPPLY TAB */}
        <TabsContent value="supply" className="space-y-6 mt-0">
          <div className="flex justify-end mb-4 print:hidden">
            <Button onClick={handleExportOrders} variant="outline" className="gap-2 font-medium">
              <Download className="w-4 h-4" />
              تصدير السجل
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="shadow-sm border-border lg:col-span-1">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-lg font-bold">حالة الطلبات</CardTitle>
                <CardDescription>للفترة المحددة</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-64 w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ordersByStatus} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} />
                      <RechartsTooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))' }} />
                      <Bar dataKey="value" name="عدد الطلبات" radius={[4, 4, 0, 0]} barSize={32}>
                        {ordersByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={
                            entry.name === 'مستلم' ? 'hsl(var(--secondary))' :
                            entry.name === 'متأخر' ? 'hsl(var(--destructive))' :
                            entry.name === 'مطلوب' ? 'hsl(var(--primary))' :
                            'hsl(var(--muted-foreground))'
                          } />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border lg:col-span-2">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-lg font-bold">سجل الطلبات</CardTitle>
                <CardDescription>جميع الطلبات في الفترة المحددة</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-auto max-h-[400px]">
                <table className="w-full text-sm text-right">
                  <thead className="bg-muted/50 text-muted-foreground sticky top-0 backdrop-blur-md">
                    <tr>
                      <th className="px-4 py-3 font-semibold">رقم الطلب</th>
                      <th className="px-4 py-3 font-semibold">المورد</th>
                      <th className="px-4 py-3 font-semibold">الدواء</th>
                      <th className="px-4 py-3 font-semibold">تاريخ الطلب</th>
                      <th className="px-4 py-3 font-semibold">الكمية</th>
                      <th className="px-4 py-3 font-semibold">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredOrders.length > 0 ? filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-mono font-medium">{order.orderNumber}</td>
                        <td className="px-4 py-3 font-bold">{order.supplier}</td>
                        <td className="px-4 py-3">{order.medicineName}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {format(parseISO(order.orderedAt), "dd MMM yyyy", { locale: ar })}
                        </td>
                        <td className="px-4 py-3 font-bold">{order.quantity}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={
                            order.status === 'received' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                            order.status === 'delayed' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                            order.status === 'ordered' ? 'bg-primary/10 text-primary border-primary/20' :
                            'bg-muted text-muted-foreground'
                          }>
                            {order.status === 'draft' && 'مسودة'}
                            {order.status === 'ordered' && 'مطلوب'}
                            {order.status === 'shipped' && 'مشحون'}
                            {order.status === 'received' && 'مستلم'}
                            {order.status === 'delayed' && 'متأخر'}
                          </Badge>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">لا توجد طلبات في هذه الفترة</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}