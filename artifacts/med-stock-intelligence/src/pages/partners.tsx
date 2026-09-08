import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { 
  useListPartners, 
  useCreatePartner,
  useUpdatePartner
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Handshake, Search, Plus, MapPin, Building, Phone, Mail, Edit3, ShieldAlert } from "lucide-react";
import type { Partner, PartnerStatus } from "@workspace/api-client-react";

const formSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون أكثر من حرفين"),
  type: z.string().min(1, "نوع الشريك مطلوب"),
  city: z.string().min(1, "المدينة مطلوبة"),
  contactName: z.string().min(2, "اسم جهة الاتصال مطلوب"),
  contactEmail: z.string().email("البريد الإلكتروني غير صالح"),
  contactPhone: z.string().min(8, "رقم الهاتف غير صالح"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Partners() {
  const { data: partners, isLoading } = useListPartners();
  const createMutation = useCreatePartner();
  const updateMutation = useUpdatePartner();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  const filteredPartners = partners?.filter(p => 
    p.name.includes(search) || p.city.includes(search) || p.contactName.includes(search)
  ) || [];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "distributor",
      city: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
    },
  });

  const onOpenCreate = () => {
    form.reset({
      name: "", type: "distributor", city: "", contactName: "", contactEmail: "", contactPhone: ""
    });
    setEditingPartner(null);
    setIsCreateOpen(true);
  };

  const onOpenEdit = (partner: Partner) => {
    form.reset({
      name: partner.name,
      type: partner.type,
      city: partner.city,
      contactName: partner.contactName,
      contactEmail: partner.contactEmail,
      contactPhone: partner.contactPhone,
    });
    setEditingPartner(partner);
    setIsCreateOpen(true);
  };

  const onSubmit = (data: FormValues) => {
    if (editingPartner) {
      updateMutation.mutate({ id: editingPartner.id, data }, {
        onSuccess: () => {
          toast({ title: "تم التحديث بنجاح" });
          queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
          setIsCreateOpen(false);
        }
      });
    } else {
      createMutation.mutate({ data }, {
        onSuccess: () => {
          toast({ title: "تمت إضافة الشريك بنجاح" });
          queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
          setIsCreateOpen(false);
        }
      });
    }
  };

  const toggleStatus = (partner: Partner) => {
    const newStatus: PartnerStatus = partner.status === 'active' ? 'suspended' : 'active';
    updateMutation.mutate({ id: partner.id, data: { status: newStatus } }, {
      onSuccess: () => {
        toast({ title: `تم تغيير الحالة إلى ${newStatus === 'active' ? 'نشط' : 'موقوف'}` });
        queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-pulse flex flex-col items-center gap-4 text-primary">
          <Handshake className="w-12 h-12 opacity-50" />
          <p className="font-bold text-lg">جاري تحميل شبكة الشركاء...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Handshake className="w-8 h-8 text-primary" />
            شبكة الشركاء الاستراتيجيين
          </h1>
          <p className="text-muted-foreground mt-2 font-medium text-lg">إدارة وتوثيق الموردين والجهات المتعاونة في سلسلة الإمداد</p>
        </div>
        <Button 
          onClick={onOpenCreate}
          className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl h-12 px-6 shadow-xl shadow-primary/20"
        >
          <Plus className="w-5 h-5 ml-2" />
          إضافة شريك جديد
        </Button>
      </div>

      <div className="relative max-w-md mb-8">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input 
          placeholder="البحث في الشبكة..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-4 pr-12 h-14 bg-card border-border/60 rounded-2xl shadow-sm font-medium text-lg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPartners.map(partner => (
          <Card key={partner.id} className="border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-[2rem] overflow-hidden group bg-card">
            <div className={`h-2 w-full ${partner.status === 'active' ? 'bg-success' : partner.status === 'suspended' ? 'bg-destructive' : 'bg-warning'}`} />
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center border shadow-inner">
                  <Building className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`font-bold px-3 py-1 border-2 ${
                    partner.status === 'active' ? 'bg-success/10 text-success border-success/20' : 
                    partner.status === 'suspended' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                    'bg-warning/10 text-warning border-warning/20'
                  }`}>
                    {partner.status === 'active' ? 'نشط' : partner.status === 'suspended' ? 'موقوف' : 'قيد التأهيل'}
                  </Badge>
                  <button onClick={() => onOpenEdit(partner)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-2xl font-black text-foreground mb-1 truncate">{partner.name}</h3>
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-6">
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md">{partner.type}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {partner.city}</span>
              </div>

              <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border/40">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">جهة الاتصال</p>
                <p className="font-bold text-foreground flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-primary" /> {partner.contactName}
                </p>
                <div className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
                  <span className="flex items-center gap-2"><Phone className="w-4 h-4" /> <span dir="ltr">{partner.contactPhone}</span></span>
                  <span className="flex items-center gap-2 truncate"><Mail className="w-4 h-4" /> {partner.contactEmail}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border/50 flex items-center justify-between">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground font-medium mb-0.5">عدد الأصناف</p>
                  <p className="font-black text-xl text-primary">{partner.medicinesCount}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toggleStatus(partner)}
                  className={`font-bold rounded-lg h-9 ${partner.status === 'active' ? 'text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground' : 'text-success border-success hover:bg-success hover:text-success-foreground'}`}
                >
                  {partner.status === 'active' ? 'إيقاف الشراكة' : 'تنشيط الشراكة'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
          <div className="bg-muted/30 p-6 border-b">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-foreground flex items-center gap-3">
                <Handshake className="w-6 h-6 text-primary" />
                {editingPartner ? "تعديل بيانات الشريك" : "تسجيل شريك جديد"}
              </DialogTitle>
            </DialogHeader>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6 bg-card">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">اسم الجهة</FormLabel>
                    <FormControl><Input className="h-12 rounded-xl bg-muted/50" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">التصنيف</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="h-12 rounded-xl bg-muted/50"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="distributor">موزع معتمد</SelectItem>
                        <SelectItem value="manufacturer">مصنع أدوية</SelectItem>
                        <SelectItem value="logistics">شركة نقل مبرد</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="font-bold">المدينة / النطاق الجغرافي</FormLabel>
                    <FormControl><Input className="h-12 rounded-xl bg-muted/50" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <div className="md:col-span-2 border-t pt-4 mt-2">
                  <p className="font-black text-lg mb-4">بيانات التواصل المعتمدة</p>
                </div>

                <FormField control={form.control} name="contactName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">اسم المفوض</FormLabel>
                    <FormControl><Input className="h-12 rounded-xl bg-muted/50" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="contactPhone" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">رقم الهاتف</FormLabel>
                    <FormControl><Input className="h-12 rounded-xl bg-muted/50" dir="ltr" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="contactEmail" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="font-bold">البريد الإلكتروني</FormLabel>
                    <FormControl><Input type="email" className="h-12 rounded-xl bg-muted/50" dir="ltr" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="pt-6 border-t flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl h-12 font-bold">إلغاء</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="rounded-xl h-12 px-8 font-bold bg-primary hover:bg-primary/90 shadow-lg">
                  {editingPartner ? "تحديث البيانات" : "حفظ الشريك"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}