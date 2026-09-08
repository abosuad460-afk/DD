import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { 
  useListBeneficiaryApplications, 
  useDecideBeneficiaryApplication 
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Users, CheckCircle, XCircle, Search, ShieldAlert, Building, Phone, Mail, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { BeneficiaryApplication, UserRole } from "@workspace/api-client-react";

export default function AdminApplications() {
  const { data: applications, isLoading } = useListBeneficiaryApplications();
  const decideMutation = useDecideBeneficiaryApplication();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const [selectedApp, setSelectedApp] = useState<BeneficiaryApplication | null>(null);
  const [decisionType, setDecisionType] = useState<'approved' | 'rejected' | null>(null);
  const [reviewerNote, setReviewerNote] = useState("");
  const [assignedRole, setAssignedRole] = useState<UserRole>('beneficiary');

  const filteredApps = applications?.filter(app => {
    const matchesSearch = app.organization.includes(search) || app.fullName.includes(search);
    const matchesStatus = filterStatus === "all" || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  const openDecisionModal = (app: BeneficiaryApplication, type: 'approved' | 'rejected') => {
    setSelectedApp(app);
    setDecisionType(type);
    setAssignedRole(app.requestedRole);
    setReviewerNote("");
  };

  const handleDecision = () => {
    if (!selectedApp || !decisionType) return;
    
    decideMutation.mutate(
      {
        id: selectedApp.id,
        data: {
          decision: decisionType,
          reviewerNote,
          ...(decisionType === 'approved' ? { assignedRole } : {})
        }
      },
      {
        onSuccess: () => {
          toast({
            title: decisionType === 'approved' ? "تم الاعتماد بنجاح" : "تم الرفض",
            description: `تم حفظ القرار للمنشأة ${selectedApp.organization}.`,
          });
          queryClient.invalidateQueries({ queryKey: ["/api/beneficiary-applications"] });
          setSelectedApp(null);
        },
        onError: (error: any) => {
          toast({
            title: "فشل حفظ القرار",
            description: error.message || "يرجى المحاولة مرة أخرى",
            variant: "destructive",
          });
        }
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 font-bold px-3 py-1">قيد المراجعة</Badge>;
      case 'approved': return <Badge variant="outline" className="bg-success/10 text-success border-success/20 font-bold px-3 py-1">معتمد</Badge>;
      case 'rejected': return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 font-bold px-3 py-1">مرفوض</Badge>;
      default: return <Badge variant="outline">غير معروف</Badge>;
    }
  };

  const getRoleName = (role: string) => {
    switch(role) {
      case 'pharmacist': return "صيدلي";
      case 'supply_manager': return "مدير إمداد";
      case 'beneficiary': return "جهة مستفيدة";
      default: return role;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-pulse flex flex-col items-center gap-4 text-primary">
          <ShieldAlert className="w-12 h-12 opacity-50" />
          <p className="font-bold text-lg">جاري تحميل السجلات الأمنية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            مراجعة طلبات الانضمام
          </h1>
          <p className="text-muted-foreground mt-2 font-medium text-lg">مركز التحكم في الصلاحيات والتحقق من المنشآت الجديدة</p>
        </div>
        <div className="flex items-center gap-3 bg-card p-2 rounded-2xl shadow-sm border">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px] bg-transparent border-none font-bold">
              <SelectValue placeholder="تصفية بالحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الطلبات</SelectItem>
              <SelectItem value="pending">قيد المراجعة</SelectItem>
              <SelectItem value="approved">معتمدة</SelectItem>
              <SelectItem value="rejected">مرفوضة</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-card">
        <CardHeader className="bg-muted/20 border-b border-border/50 py-5">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="البحث باسم المنشأة أو الممثل المفوض..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-4 pr-12 h-12 bg-background border-border/60 rounded-xl font-medium"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/40">
            {filteredApps.length > 0 ? filteredApps.map(app => (
              <div key={app.id} className="p-6 hover:bg-muted/10 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/10">
                    <Building className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-foreground">{app.organization}</h3>
                      {getStatusBadge(app.status)}
                    </div>
                    <p className="text-sm text-muted-foreground font-medium mb-3">
                      {app.organizationType} • مقدم الطلب: <span className="text-foreground">{app.fullName}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {app.email}</span>
                      <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> <span dir="ltr">{app.phone}</span></span>
                      <span className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md text-foreground">
                        <ShieldAlert className="w-3.5 h-3.5 text-primary" />
                        صلاحية مطلوبة: {getRoleName(app.requestedRole)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {app.status === 'pending' ? (
                  <div className="flex items-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-border/50">
                    <Button 
                      variant="outline" 
                      className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground font-bold rounded-xl h-11"
                      onClick={() => openDecisionModal(app, 'rejected')}
                    >
                      <XCircle className="w-4 h-4 ml-2" />
                      رفض الطلب
                    </Button>
                    <Button 
                      className="bg-success hover:bg-success/90 text-success-foreground font-bold rounded-xl h-11 shadow-lg shadow-success/20"
                      onClick={() => openDecisionModal(app, 'approved')}
                    >
                      <CheckCircle className="w-4 h-4 ml-2" />
                      اعتماد وتوثيق
                    </Button>
                  </div>
                ) : (
                  <div className="text-left shrink-0">
                    <p className="text-xs text-muted-foreground font-medium mb-1">تاريخ المراجعة</p>
                    <p className="font-bold text-sm bg-muted/50 px-3 py-1.5 rounded-lg border">
                      {app.reviewedAt ? format(parseISO(app.reviewedAt), 'dd MMM yyyy', { locale: ar }) : '---'}
                    </p>
                  </div>
                )}
              </div>
            )) : (
              <div className="p-16 text-center text-muted-foreground flex flex-col items-center">
                <FileText className="w-16 h-16 opacity-20 mb-4" />
                <p className="text-xl font-bold text-foreground mb-2">لا توجد طلبات</p>
                <p>لم يتم العثور على طلبات مطابقة للبحث أو التصفية.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className={`h-2 w-full ${decisionType === 'approved' ? 'bg-success' : 'bg-destructive'}`} />
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-black flex items-center gap-2">
                {decisionType === 'approved' ? (
                  <><CheckCircle className="w-6 h-6 text-success" /> اعتماد المنشأة</>
                ) : (
                  <><XCircle className="w-6 h-6 text-destructive" /> رفض المنشأة</>
                )}
              </DialogTitle>
              <DialogDescription className="text-base font-medium mt-2">
                {selectedApp?.organization} - {selectedApp?.fullName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {decisionType === 'approved' && (
                <div className="space-y-3">
                  <label className="text-sm font-bold text-foreground">تأكيد صلاحية الدخول</label>
                  <Select value={assignedRole} onValueChange={(v) => setAssignedRole(v as UserRole)}>
                    <SelectTrigger className="h-12 bg-muted/50 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pharmacist">إدارة مخزون صيدلاني</SelectItem>
                      <SelectItem value="supply_manager">إدارة الإمداد والتوريد</SelectItem>
                      <SelectItem value="beneficiary">استعلام واطلاع</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground">ملاحظات الإدارة {decisionType === 'rejected' && <span className="text-destructive">*</span>}</label>
                <textarea 
                  className="w-full h-32 p-4 rounded-xl border border-input bg-muted/50 focus:ring-2 focus:ring-ring focus:border-transparent outline-none resize-none font-medium"
                  placeholder="أضف ملاحظات أسباب الرفض أو توجيهات للمنشأة..."
                  value={reviewerNote}
                  onChange={(e) => setReviewerNote(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="mt-8 flex gap-3 sm:justify-start">
              <Button 
                variant="outline" 
                onClick={() => setSelectedApp(null)}
                className="rounded-xl h-12 font-bold"
              >
                إلغاء
              </Button>
              <Button 
                onClick={handleDecision}
                disabled={decideMutation.isPending || (decisionType === 'rejected' && !reviewerNote.trim())}
                className={`rounded-xl h-12 px-8 font-bold text-white shadow-xl ${
                  decisionType === 'approved' 
                    ? 'bg-success hover:bg-success/90 shadow-success/20' 
                    : 'bg-destructive hover:bg-destructive/90 shadow-destructive/20'
                }`}
              >
                {decideMutation.isPending ? "جاري الحفظ..." : "تأكيد القرار"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}