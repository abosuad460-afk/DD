import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { 
  useListBeneficiaryApplications, 
  useCreateBeneficiaryApplication 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { FileText, Clock, CheckCircle2, XCircle, Building2, Send } from "lucide-react";

const formSchema = z.object({
  fullName: z.string().min(2, "الاسم يجب أن يكون أكثر من حرفين"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  phone: z.string().min(8, "رقم الهاتف يجب أن يكون 8 أرقام على الأقل"),
  organization: z.string().min(2, "اسم الجهة مطلوب"),
  organizationType: z.string().min(1, "نوع الجهة مطلوب"),
  requestedRole: z.enum(['pharmacist', 'supply_manager', 'beneficiary'], {
    required_error: "يرجى اختيار الصلاحية المطلوبة",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function Join() {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: apps, isLoading } = useListBeneficiaryApplications();
  const createMutation = useCreateBeneficiaryApplication();

  // Find user's existing application (assuming they have one active)
  const myApp = apps?.find(app => app.userId === user?.id);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.primaryEmailAddress?.emailAddress || "",
      phone: "",
      organization: "",
      organizationType: "",
      requestedRole: "beneficiary",
    },
  });

  const onSubmit = (data: FormValues) => {
    createMutation.mutate({ data }, {
      onSuccess: () => {
        toast({
          title: "تم إرسال الطلب بنجاح",
          description: "ستتم مراجعة طلبك من قبل إدارة النظام قريباً.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/beneficiary-applications"] });
      },
      onError: (error: any) => {
        toast({
          title: "حدث خطأ",
          description: error?.message || "فشل إرسال الطلب. يرجى المحاولة مرة أخرى.",
          variant: "destructive",
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-pulse flex flex-col items-center gap-4 text-primary">
          <Building2 className="w-12 h-12 opacity-50" />
          <p className="font-bold text-lg">جاري التحقق من السجلات...</p>
        </div>
      </div>
    );
  }

  // If user already has an application, show its status
  if (myApp) {
    const isPending = myApp.status === 'pending';
    const isApproved = myApp.status === 'approved';
    const isRejected = myApp.status === 'rejected';

    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">حالة الانضمام</h1>
          <p className="text-muted-foreground mt-2 text-lg">متابعة طلب تسجيل منشأتك في منظومة ألفا ميد</p>
        </div>

        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden relative">
          <div className={`absolute top-0 right-0 w-2 h-full ${
            isPending ? "bg-warning" : isApproved ? "bg-success" : "bg-destructive"
          }`} />
          
          <CardHeader className="bg-muted/30 pb-8 pt-10 px-10 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner border ${
                  isPending ? "bg-warning/10 text-warning border-warning/20" : 
                  isApproved ? "bg-success/10 text-success border-success/20" : 
                  "bg-destructive/10 text-destructive border-destructive/20"
                }`}>
                  {isPending && <Clock className="w-8 h-8" />}
                  {isApproved && <CheckCircle2 className="w-8 h-8" />}
                  {isRejected && <XCircle className="w-8 h-8" />}
                </div>
                <div>
                  <CardTitle className="text-2xl font-black mb-1">
                    {isPending ? "طلبك قيد المراجعة" : isApproved ? "تم قبول طلبك" : "تم رفض الطلب"}
                  </CardTitle>
                  <CardDescription className="text-base font-medium">
                    مقدم بتاريخ {format(parseISO(myApp.submittedAt), 'dd MMMM yyyy', { locale: ar })}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-10 space-y-8">
            {isPending && (
              <p className="text-lg text-muted-foreground leading-relaxed">
                تقوم الإدارة حالياً بمراجعة بيانات منشأتك (<strong>{myApp.organization}</strong>). 
                سيتم إشعارك فور اكتمال عملية التحقق من المستندات والصلاحيات المطلوبة.
              </p>
            )}
            {isApproved && (
              <p className="text-lg text-muted-foreground leading-relaxed">
                مرحباً بك في منظومة ألفا ميد. تم توثيق منشأتك ومنحك صلاحية الدخول الاستراتيجية.
                يمكنك الآن الوصول إلى لوحة القيادة والعمليات التشغيلية المخصصة لك.
              </p>
            )}
            {isRejected && (
              <div className="space-y-4">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  نأسف، لم نتمكن من اعتماد طلب منشأتك (<strong>{myApp.organization}</strong>) في الوقت الحالي.
                </p>
                {myApp.reviewerNote && (
                  <div className="bg-destructive/5 border border-destructive/10 rounded-xl p-4">
                    <p className="font-bold text-destructive mb-1">ملاحظات الإدارة:</p>
                    <p className="text-destructive/80 font-medium">{myApp.reviewerNote}</p>
                  </div>
                )}
              </div>
            )}

            <div className="bg-muted/30 rounded-2xl p-6 border border-border/50">
              <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                بيانات الطلب المسجلة
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">الجهة / المنشأة</p>
                  <p className="font-bold">{myApp.organization} ({myApp.organizationType})</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">مقدم الطلب</p>
                  <p className="font-bold">{myApp.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">بيانات التواصل</p>
                  <p className="font-bold" dir="ltr">{myApp.email} | {myApp.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">الصلاحية المطلوبة</p>
                  <p className="font-bold">
                    {myApp.requestedRole === 'pharmacist' ? "منشأة صيدلانية" :
                     myApp.requestedRole === 'supply_manager' ? "مورد إقليمي" : "جهة مستفيدة"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Application Form
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">طلب انضمام للمنظومة</h1>
        <p className="text-muted-foreground mt-2 text-lg">سجل منشأتك الطبية للربط مع الشبكة الاستراتيجية لإمداد الدواء</p>
      </div>

      <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-primary/5 pb-8 pt-10 px-10 border-b border-primary/10">
          <CardTitle className="text-2xl font-black text-primary flex items-center gap-3">
            <Building2 className="w-7 h-7" />
            نموذج تسجيل منشأة جديدة
          </CardTitle>
          <CardDescription className="text-base font-medium">
            يرجى تعبئة البيانات بدقة لتسريع عملية المراجعة والمصادقة الأمنية.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="font-bold text-lg border-b pb-2">بيانات الممثل المفوض</h3>
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-bold">الاسم الكامل</FormLabel>
                        <FormControl>
                          <Input className="h-12 rounded-xl bg-muted/50 border-border/50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-bold">البريد الإلكتروني الرسمي</FormLabel>
                        <FormControl>
                          <Input className="h-12 rounded-xl bg-muted/50 border-border/50" type="email" dir="ltr" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-bold">رقم الهاتف</FormLabel>
                        <FormControl>
                          <Input className="h-12 rounded-xl bg-muted/50 border-border/50" dir="ltr" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-6">
                  <h3 className="font-bold text-lg border-b pb-2">بيانات المنشأة</h3>
                  <FormField
                    control={form.control}
                    name="organization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-bold">اسم الجهة / المنشأة</FormLabel>
                        <FormControl>
                          <Input className="h-12 rounded-xl bg-muted/50 border-border/50" placeholder="مثال: مستشفى التخصصي الأول" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="organizationType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-bold">التصنيف</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-border/50">
                              <SelectValue placeholder="اختر نوع المنشأة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hospital">مستشفى / مجمع طبي</SelectItem>
                            <SelectItem value="pharmacy">سلسلة صيدليات</SelectItem>
                            <SelectItem value="clinic">مستوصف</SelectItem>
                            <SelectItem value="distributor">موزع إقليمي</SelectItem>
                            <SelectItem value="government">جهة حكومية</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="requestedRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-bold">صلاحية الدخول المطلوبة</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-border/50">
                              <SelectValue placeholder="اختر الصلاحية" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pharmacist">إدارة مخزون صيدلاني (مستشفيات وصيدليات)</SelectItem>
                            <SelectItem value="supply_manager">إدارة الإمداد والتوريد (موزعين)</SelectItem>
                            <SelectItem value="beneficiary">استعلام واطلاع (جهات مستفيدة)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="pt-6 border-t flex justify-end">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="rounded-xl px-10 h-14 text-base font-bold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "جاري الإرسال..." : "إرسال طلب الاعتماد"}
                  <Send className="w-5 h-5 mr-3 rtl:ml-3 rtl:mr-0" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}