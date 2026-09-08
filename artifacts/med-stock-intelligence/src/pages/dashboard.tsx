import { useGetDashboard } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill, AlertTriangle, ShieldCheck, Clock, TrendingUp, Search, BellRing, Activity, ArrowUpRight, ArrowDownRight, ActivitySquare } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";

export default function Dashboard() {
  const { data: dashboard, isLoading, isError } = useGetDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-muted rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted/50 rounded-2xl border border-border/50"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="h-96 bg-muted/50 rounded-2xl border border-border/50"></div>
          <div className="h-96 bg-muted/50 rounded-2xl border border-border/50"></div>
        </div>
      </div>
    );
  }

  if (isError || !dashboard) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-3xl border border-destructive/20 shadow-sm max-w-md mx-auto mt-20">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">تعذر تحميل الرؤية الشاملة</h2>
        <p className="text-muted-foreground text-sm">حدث خطأ أثناء الاتصال بالخوادم الطبية. يرجى المحاولة مرة أخرى لاحقاً.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            الرؤية الشاملة
            <div className="px-2.5 py-1 rounded-md bg-secondary/15 text-secondary text-xs font-semibold">مباشر</div>
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">نظرة عامة على حالة المخزون، التنبيهات السريرية، ومؤشرات الأداء</p>
        </div>
        <div className="text-sm font-medium text-muted-foreground bg-white dark:bg-card px-4 py-2 rounded-xl border shadow-sm flex items-center gap-2">
          <ActivitySquare className="w-4 h-4 text-primary" />
          تحديث آخر: {format(new Date(), 'hh:mm a', { locale: ar })}
        </div>
      </div>

      {/* Premium KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-2xl border-none shadow-[var(--shadow-md)] bg-gradient-to-br from-card to-card hover:shadow-[var(--shadow-lg)] transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1 h-full bg-secondary"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground">صحة المخزون</CardTitle>
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <div className="text-4xl font-black text-foreground tracking-tight">{dashboard.stockHealth}%</div>
              <div className="flex items-center text-xs font-semibold text-secondary mb-1">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                <span>+2.4%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">المستوى العام لتوفر الأدوية</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-[var(--shadow-md)] bg-gradient-to-br from-card to-card hover:shadow-[var(--shadow-lg)] transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1 h-full bg-destructive"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground">أصناف حرجة</CardTitle>
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-destructive tracking-tight">{dashboard.criticalCount}</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">تحت مستوى الأمان فوراً</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-[var(--shadow-md)] bg-gradient-to-br from-card to-card hover:shadow-[var(--shadow-lg)] transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1 h-full bg-warning"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground">تنبيهات نشطة</CardTitle>
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BellRing className="w-5 h-5 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <div className="text-4xl font-black text-warning tracking-tight">{dashboard.activeAlerts}</div>
              <div className="flex items-center text-xs font-semibold text-secondary mb-1">
                <ArrowDownRight className="w-3 h-3 mr-0.5" />
                <span>-1.2%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">تتطلب التدخل والمراجعة</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-[var(--shadow-md)] bg-gradient-to-br from-card to-card hover:shadow-[var(--shadow-lg)] transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1 h-full bg-primary"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground">متوسط زمن الصرف</CardTitle>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-primary tracking-tight">{dashboard.averageDispenseMinutes}</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">دقيقة لكل وصفة طبية</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Predicted Runouts */}
        <Card className="flex flex-col rounded-3xl border border-border shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50 pb-5">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <TrendingUp className="w-5 h-5 text-destructive" />
                </div>
                توقعات النفاد قريباً
              </div>
              <span className="text-xs font-medium bg-background border px-3 py-1 rounded-full shadow-sm">
                الذكاء الاصطناعي
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            {dashboard.predictedRunouts.length > 0 ? (
              <div className="divide-y divide-border/40">
                {dashboard.predictedRunouts.slice(0, 5).map(med => (
                  <div key={med.id} className="flex items-center justify-between p-5 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xs shrink-0">
                        {med.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-foreground">{med.name}</span>
                        <span className="text-xs text-muted-foreground mt-0.5">{med.scientificName}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-destructive flex items-center gap-1.5">
                        <Activity className="w-4 h-4" />
                        يكفي {med.coverageDays} يوم
                      </span>
                      <span className="text-xs text-muted-foreground mt-1 font-medium bg-muted px-2 py-0.5 rounded-md">
                        ينفد: {format(parseISO(med.predictedRunoutDate), 'd MMMM', { locale: ar })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-muted-foreground py-8">
                <div className="w-20 h-20 rounded-full bg-secondary/5 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-10 h-10 text-secondary/50" />
                </div>
                <p className="font-bold text-lg text-foreground">الوضع آمن</p>
                <p className="text-sm">لا توجد توقعات قريبة للنفاد</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card className="flex flex-col rounded-3xl border border-border shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50 pb-5">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 rounded-lg bg-warning/10">
                <BellRing className="w-5 h-5 text-warning" />
              </div>
              سجل التنبيهات الحديثة
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            {dashboard.recentAlerts.length > 0 ? (
              <div className="divide-y divide-border/40">
                {dashboard.recentAlerts.slice(0, 5).map(alert => (
                  <div key={alert.id} className="flex items-start gap-4 p-5 hover:bg-muted/20 transition-colors">
                    <div className={`mt-1 shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm border ${
                      alert.severity === 'critical' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                      alert.severity === 'warning' ? 'bg-warning/10 text-warning border-warning/20' :
                      'bg-primary/10 text-primary border-primary/20'
                    }`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-bold text-foreground truncate">{alert.title}</p>
                        <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap bg-muted px-2 py-0.5 rounded-full">
                          {format(parseISO(alert.createdAt), 'hh:mm a', { locale: ar })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-muted-foreground py-8">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                  <BellRing className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <p className="font-bold text-lg text-foreground">لا توجد تنبيهات</p>
                <p className="text-sm">سجل التنبيهات فارغ حالياً</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

