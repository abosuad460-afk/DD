import { useState } from "react";
import { useListSupplyOrders, useCreateSupplyOrder, useUpdateSupplyOrder, getListSupplyOrdersQueryKey, useListMedicines } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Package, CalendarClock, ShoppingCart } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import type { SupplyStatus, MedicinePriority } from "@workspace/api-client-react";

export default function SupplyOrders() {
  const { data: orders, isLoading } = useListSupplyOrders();
  const { data: medicines } = useListMedicines();
  
  const createOrder = useCreateSupplyOrder();
  const updateOrder = useUpdateSupplyOrder();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    supplier: "",
    medicineId: "",
    quantity: "",
    expectedArrival: "",
    priority: "essential" as MedicinePriority,
  });

  const [updateStatusOpen, setUpdateStatusOpen] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState<SupplyStatus>("draft");

  const handleCreateSubmit = () => {
    if (!createForm.supplier || !createForm.medicineId || !createForm.quantity || !createForm.expectedArrival) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى تعبئة جميع الحقول المطلوبة" });
      return;
    }
    
    const med = medicines?.find(m => m.id.toString() === createForm.medicineId);
    
    createOrder.mutate({
      data: {
        supplier: createForm.supplier,
        medicineId: parseInt(createForm.medicineId, 10),
        medicineName: med?.name || "Unknown",
        quantity: parseInt(createForm.quantity, 10),
        expectedArrival: new Date(createForm.expectedArrival).toISOString(),
        priority: createForm.priority,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSupplyOrdersQueryKey() });
        setIsCreateOpen(false);
        setCreateForm({ supplier: "", medicineId: "", quantity: "", expectedArrival: "", priority: "essential" });
        toast({ title: "تم الإنشاء", description: "تم إنشاء طلب التوريد بنجاح" });
      },
      onError: () => toast({ variant: "destructive", title: "خطأ", description: "فشل إنشاء طلب التوريد" })
    });
  };

  const handleStatusUpdate = (orderId: number) => {
    updateOrder.mutate({
      id: orderId,
      data: { status: newStatus }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSupplyOrdersQueryKey() });
        setUpdateStatusOpen(null);
        toast({ title: "تم التحديث", description: "تم تحديث حالة الطلب بنجاح" });
      },
      onError: () => toast({ variant: "destructive", title: "خطأ", description: "فشل تحديث الحالة" })
    });
  };

  const getStatusBadge = (status: SupplyStatus) => {
    switch (status) {
      case "draft": return <Badge variant="outline">مسودة</Badge>;
      case "ordered": return <Badge variant="secondary" className="bg-blue-100 text-blue-800">مطلوب</Badge>;
      case "shipped": return <Badge variant="secondary" className="bg-amber-100 text-amber-800">مشحون</Badge>;
      case "delayed": return <Badge variant="destructive">متأخر</Badge>;
      case "received": return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">مستلم</Badge>;
      default: return null;
    }
  };

  const getPriorityBadge = (priority: MedicinePriority) => {
    switch (priority) {
      case "vital": return <Badge variant="destructive" className="bg-destructive/10 text-destructive border-transparent hover:bg-destructive/20">حيوي</Badge>;
      case "essential": return <Badge variant="secondary" className="bg-warning/20 text-warning-foreground hover:bg-warning/30">أساسي</Badge>;
      case "desirable": return <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">مرغوب</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">طلبات التوريد</h1>
          <p className="text-muted-foreground mt-1">إدارة ومتابعة طلبات التوريد للأدوية</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          طلب توريد جديد
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>رقم الطلب</TableHead>
                  <TableHead>المورد</TableHead>
                  <TableHead>الدواء</TableHead>
                  <TableHead>الكمية</TableHead>
                  <TableHead>الأولوية</TableHead>
                  <TableHead>تاريخ الطلب</TableHead>
                  <TableHead>الوصول المتوقع</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-left">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      جاري تحميل الطلبات...
                    </TableCell>
                  </TableRow>
                ) : orders?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                      <Package className="w-12 h-12 mx-auto mb-3 text-muted/50" />
                      لا توجد طلبات توريد حالية
                    </TableCell>
                  </TableRow>
                ) : (
                  orders?.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                      <TableCell className="font-medium">{order.supplier}</TableCell>
                      <TableCell>{order.medicineName}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>{getPriorityBadge(order.priority)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(parseISO(order.orderedAt), "d MMM yyyy", { locale: ar })}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1.5">
                          <CalendarClock className="w-3.5 h-3.5 text-muted-foreground" />
                          {format(parseISO(order.expectedArrival), "d MMM yyyy", { locale: ar })}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-left">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          disabled={order.status === 'received'}
                          onClick={() => {
                            setUpdateStatusOpen(order.id);
                            setNewStatus(order.status);
                          }}
                        >
                          تحديث الحالة
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Order Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>إنشاء طلب توريد</DialogTitle>
            <DialogDescription>
              أدخل تفاصيل الطلب الجديد لاعتماده وإرساله للمورد.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="supplier">المورد</Label>
              <Input
                id="supplier"
                placeholder="اسم شركة الأدوية"
                value={createForm.supplier}
                onChange={(e) => setCreateForm({ ...createForm, supplier: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="medicine">الدواء</Label>
              <Select value={createForm.medicineId} onValueChange={(v) => setCreateForm({ ...createForm, medicineId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الدواء" />
                </SelectTrigger>
                <SelectContent>
                  {medicines?.map(med => (
                    <SelectItem key={med.id} value={med.id.toString()}>{med.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">الكمية</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={createForm.quantity}
                  onChange={(e) => setCreateForm({ ...createForm, quantity: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">الأولوية</Label>
                <Select 
                  value={createForm.priority} 
                  onValueChange={(v: MedicinePriority) => setCreateForm({ ...createForm, priority: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الأولوية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vital">حيوي</SelectItem>
                    <SelectItem value="essential">أساسي</SelectItem>
                    <SelectItem value="desirable">مرغوب</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">تاريخ الوصول المتوقع</Label>
              <Input
                id="date"
                type="date"
                value={createForm.expectedArrival}
                onChange={(e) => setCreateForm({ ...createForm, expectedArrival: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">إلغاء</Button>
            </DialogClose>
            <Button onClick={handleCreateSubmit} disabled={createOrder.isPending}>
              {createOrder.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              تأكيد الطلب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={!!updateStatusOpen} onOpenChange={(open) => !open && setUpdateStatusOpen(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تحديث حالة الطلب</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status">الحالة الجديدة</Label>
              <Select value={newStatus} onValueChange={(v: SupplyStatus) => setNewStatus(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="ordered">مطلوب</SelectItem>
                  <SelectItem value="shipped">مشحون</SelectItem>
                  <SelectItem value="delayed">متأخر</SelectItem>
                  <SelectItem value="received">مستلم</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">إلغاء</Button>
            </DialogClose>
            <Button 
              onClick={() => updateStatusOpen && handleStatusUpdate(updateStatusOpen)} 
              disabled={updateOrder.isPending}
            >
              {updateOrder.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              حفظ التحديث
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
