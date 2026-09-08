import { useListAlerts, useAcknowledgeAlert, getListAlertsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, BellRing, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import type { AlertSeverity } from "@workspace/api-client-react";

export default function Alerts() {
  const { data: alerts, isLoading } = useListAlerts();
  const acknowledgeAlert = useAcknowledgeAlert();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleAcknowledge = (id: number) => {
    acknowledgeAlert.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAlertsQueryKey() });
          toast({
            title: "تم التأكيد",
            description: "تم استلام التنبيه بنجاح",
          });
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "خطأ",
            description: "تعذر تأكيد التنبيه",
          });
        }
      }
    );
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case "critical": return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case "warning": return <BellRing className="w-5 h-5 text-warning" />;
      case "info": return <Info className="w-5 h-5 text-primary" />;
      default: return null;
    }
  };

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case "critical": return <Badge variant="destructive">حرج جداً</Badge>;
      case "warning": return <Badge variant="secondary" className="bg-warning/20 text-warning-foreground">تحذير</Badge>;
      case "info": return <Badge variant="outline" className="text-primary border-primary">معلومة</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">التنبيهات المبكرة</h1>
        <p className="text-muted-foreground mt-1">إشعارات المخزون وتوقعات النقص لتفادي الانقطاع</p>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-card rounded-xl border border-border">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p>جاري تحميل التنبيهات...</p>
          </div>
        ) : alerts?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-card rounded-xl border border-border">
            <CheckCircle2 className="w-16 h-16 mb-4 text-emerald-500/50" />
            <h3 className="text-lg font-medium text-foreground">لا توجد تنبيهات نشطة</h3>
            <p>جميع مستويات المخزون ضمن النطاق الآمن</p>
          </div>
        ) : (
          alerts?.map((alert) => (
            <Card key={alert.id} className={alert.acknowledged ? "opacity-70" : "border-l-4 " + (
              alert.severity === "critical" ? "border-l-destructive" :
              alert.severity === "warning" ? "border-l-warning" : "border-l-primary"
            )}>
              <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className={`p-3 rounded-full shrink-0 ${
                  alert.severity === "critical" ? "bg-destructive/10" :
                  alert.severity === "warning" ? "bg-warning/10" : "bg-primary/10"
                }`}>
                  {getSeverityIcon(alert.severity)}
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getSeverityBadge(alert.severity)}
                    <span className="text-sm font-semibold">{alert.medicineName}</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{alert.title}</h3>
                  <p className="text-muted-foreground">{alert.message}</p>
                  <p className="text-xs text-muted-foreground pt-2">
                    تاريخ التنبيه: {format(parseISO(alert.createdAt), "d MMMM yyyy, HH:mm", { locale: ar })}
                  </p>
                </div>

                <div className="shrink-0 w-full md:w-auto flex flex-col gap-2">
                  {!alert.acknowledged ? (
                    <Button 
                      className="w-full md:w-auto" 
                      onClick={() => handleAcknowledge(alert.id)}
                      disabled={acknowledgeAlert.isPending}
                    >
                      {acknowledgeAlert.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      استلام التنبيه
                    </Button>
                  ) : (
                    <Button variant="ghost" disabled className="w-full md:w-auto text-emerald-600">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      تم الاستلام
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
