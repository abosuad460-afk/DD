import { useState } from "react";
import { useListMedicines, useUpdateMedicine, getListMedicinesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Filter, Edit2, Loader2, Pill } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Medicine, StockStatus, MedicinePriority, MedicineUpdate } from "@workspace/api-client-react";

export default function Medicines() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StockStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<MedicinePriority | "all">("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: medicines, isLoading } = useListMedicines({
    search: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    priority: priorityFilter === "all" ? undefined : priorityFilter,
  });

  const [editingMed, setEditingMed] = useState<Medicine | null>(null);
  const [editForm, setEditForm] = useState<MedicineUpdate>({});

  const updateMedicine = useUpdateMedicine();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    // basic debounce
    setTimeout(() => setDebouncedSearch(e.target.value), 300);
  };

  const handleEditClick = (med: Medicine) => {
    setEditingMed(med);
    setEditForm({
      stock: med.stock,
      reorderPoint: med.reorderPoint,
      safeStock: med.safeStock,
      priority: med.priority,
    });
  };

  const handleSave = () => {
    if (!editingMed) return;
    updateMedicine.mutate(
      { id: editingMed.id, data: editForm },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListMedicinesQueryKey() });
          toast({
            title: "تم التحديث",
            description: "تم تحديث بيانات الدواء بنجاح",
          });
          setEditingMed(null);
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "خطأ",
            description: "تعذر تحديث بيانات الدواء",
          });
        }
      }
    );
  };

  const getStatusBadge = (status: StockStatus) => {
    switch (status) {
      case "available": return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">متوفر</Badge>;
      case "low": return <Badge variant="secondary" className="bg-warning/20 text-warning-foreground hover:bg-warning/30">منخفض</Badge>;
      case "critical": return <Badge variant="destructive">حرج</Badge>;
      default: return null;
    }
  };

  const getPriorityBadge = (priority: MedicinePriority) => {
    switch (priority) {
      case "vital": return <Badge variant="outline" className="border-destructive text-destructive">حيوي</Badge>;
      case "essential": return <Badge variant="outline" className="border-warning text-warning-foreground">أساسي</Badge>;
      case "desirable": return <Badge variant="outline" className="border-primary text-primary">مرغوب</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">إدارة الأدوية والمخزون</h1>
          <p className="text-muted-foreground mt-1">تتبع المخزون، تعديل نقاط إعادة الطلب ومستويات الأمان</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث بالاسم العلمي أو التجاري..."
                className="pr-9"
                value={search}
                onChange={handleSearch}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="حالة المخزون" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="available">متوفر</SelectItem>
                  <SelectItem value="low">منخفض</SelectItem>
                  <SelectItem value="critical">حرج</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={(v: any) => setPriorityFilter(v)}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="الأولوية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="vital">حيوي</SelectItem>
                  <SelectItem value="essential">أساسي</SelectItem>
                  <SelectItem value="desirable">مرغوب</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[300px]">الدواء</TableHead>
                  <TableHead>الفئة</TableHead>
                  <TableHead>المخزون الحالي</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الأولوية</TableHead>
                  <TableHead>نقطة إعادة الطلب</TableHead>
                  <TableHead className="text-left">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      جاري تحميل البيانات...
                    </TableCell>
                  </TableRow>
                ) : medicines?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      <Pill className="w-12 h-12 mx-auto mb-3 text-muted/50" />
                      لا توجد أدوية مطابقة للبحث
                    </TableCell>
                  </TableRow>
                ) : (
                  medicines?.map((med) => (
                    <TableRow key={med.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="font-semibold text-sm text-foreground">{med.name}</div>
                        <div className="text-xs text-muted-foreground">{med.scientificName} • {med.sku}</div>
                      </TableCell>
                      <TableCell className="text-sm">{med.category}</TableCell>
                      <TableCell>
                        <div className="font-medium">{med.stock} {med.unit}</div>
                        <div className="text-xs text-muted-foreground">يكفي لـ {med.coverageDays} يوم</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(med.status)}</TableCell>
                      <TableCell>{getPriorityBadge(med.priority)}</TableCell>
                      <TableCell className="text-sm">
                        {med.reorderPoint} {med.unit}
                      </TableCell>
                      <TableCell className="text-left">
                        <Button variant="ghost" size="sm" onClick={() => handleEditClick(med)}>
                          <Edit2 className="w-4 h-4 ml-2" />
                          تعديل
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

      <Dialog open={!!editingMed} onOpenChange={(open) => !open && setEditingMed(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تعديل إعدادات المخزون</DialogTitle>
            <DialogDescription>
              {editingMed?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">
                المخزون الفعلي
              </Label>
              <Input
                id="stock"
                type="number"
                className="col-span-3"
                value={editForm.stock || 0}
                onChange={(e) => setEditForm((prev: any) => ({ ...prev, stock: Number(e.target.value) }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reorderPoint" className="text-right">
                نقطة إعادة الطلب
              </Label>
              <Input
                id="reorderPoint"
                type="number"
                className="col-span-3"
                value={editForm.reorderPoint || 0}
                onChange={(e) => setEditForm((prev: any) => ({ ...prev, reorderPoint: Number(e.target.value) }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="safeStock" className="text-right">
                مخزون الأمان
              </Label>
              <Input
                id="safeStock"
                type="number"
                className="col-span-3"
                value={editForm.safeStock || 0}
                onChange={(e) => setEditForm((prev: any) => ({ ...prev, safeStock: Number(e.target.value) }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                الأولوية
              </Label>
              <div className="col-span-3">
                <Select 
                  value={editForm.priority} 
                  onValueChange={(v: MedicinePriority) => setEditForm((prev: any) => ({ ...prev, priority: v }))}
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
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">إلغاء</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={updateMedicine.isPending}>
              {updateMedicine.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
