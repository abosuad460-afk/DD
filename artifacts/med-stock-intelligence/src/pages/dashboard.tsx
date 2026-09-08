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
        <Card className="rounded-[2rem] border-none cinematic-shadow bg-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-2 h-full bg-secondary"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">صحة المخزون</CardTitle>
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-secondary/20 shadow-inner">
              <ShieldCheck className="w-6 h-6 text-secondary" />
            </div>
          </CardHeader>
          <CardContent className="z-10 relative">
            <div className="flex items-end gap-3">
              <div className="text-5xl font-black text-foreground tracking-tight">{dashboard.stockHealth}%</div>
              <div className="flex items-center text-sm font-bold text-secondary mb-1.5 bg-secondary/10 px-2 py-1 rounded-lg">
                <ArrowUpRight className="w-4 h-4 mr-0.5" />
                <span>+2.4%</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3 font-medium">المستوى العام لتوفر الأدوية الحيوية</p>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none cinematic-shadow bg-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-2 h-full bg-destructive"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">أصناف حرجة</CardTitle>
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-destructive/20 shadow-inner">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
          </CardHeader>
          <CardContent className="z-10 relative">
            <div className="text-5xl font-black text-destructive tracking-tight">{dashboard.criticalCount}</div>
            <p className="text-sm text-muted-foreground mt-3 font-medium">أصناف تحت مستوى الأمان فوراً</p>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none cinematic-shadow bg-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-2 h-full bg-warning"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">تنبيهات نشطة</CardTitle>
            <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-warning/20 shadow-inner">
              <BellRing className="w-6 h-6 text-warning" />
            </div>
          </CardHeader>
          <CardContent className="z-10 relative">
            <div className="flex items-end gap-3">
              <div className="text-5xl font-black text-warning tracking-tight">{dashboard.activeAlerts}</div>
              <div className="flex items-center text-sm font-bold text-success mb-1.5 bg-success/10 px-2 py-1 rounded-lg">
                <ArrowDownRight className="w-4 h-4 mr-0.5 text-success" />
                <span className="text-success">-1.2%</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3 font-medium">تتطلب التدخل والمراجعة السريعة</p>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none cinematic-shadow bg-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-2 h-full bg-primary"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">متوسط زمن الصرف</CardTitle>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-primary/20 shadow-inner">
              <Clock className="w-6 h-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="z-10 relative">
            <div className="text-5xl font-black text-primary tracking-tight">{dashboard.averageDispenseMinutes}<span className="text-2xl font-bold ml-1 text-primary/70">د</span></div>
            <p className="text-sm text-muted-foreground mt-3 font-medium">لكل وصفة طبية مصروفة</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Predicted Runouts */}
        <Card className="flex flex-col rounded-[2rem] border-none cinematic-shadow overflow-hidden bg-card">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b border-border/50 pb-6 pt-8 px-8">
            <CardTitle className="flex items-center justify-between text-xl font-black">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/10 shadow-inner">
                  <TrendingUp className="w-6 h-6 text-destructive" />
                </div>
                توقعات النفاذ الكارثي
              </div>
              <span className="text-xs font-bold bg-background border px-4 py-2 rounded-full shadow-sm text-primary flex items-center gap-2">
                <Activity className="w-4 h-4" />
                الذكاء الاصطناعي النشط
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            {dashboard.predictedRunouts.length > 0 ? (
              <div className="divide-y divide-border/40">
                {dashboard.predictedRunouts.slice(0, 5).map(med => (
                  <div key={med.id} className="flex items-center justify-between p-6 hover:bg-muted/30 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary font-black text-sm shrink-0 border border-secondary/20 shadow-inner group-hover:scale-105 transition-transform">
                        {med.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-lg text-foreground mb-1">{med.name}</span>
                        <span className="text-sm text-muted-foreground font-medium">{med.scientificName}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-base font-black text-destructive flex items-center gap-2 mb-1.5 bg-destructive/5 px-3 py-1 rounded-lg">
                        <Activity className="w-4 h-4" />
                        الرصيد: {med.coverageDays} أيام
                      </span>
                      <span className="text-xs font-bold text-muted-foreground">
                        تاريخ النفاذ: {format(parseISO(med.predictedRunoutDate), 'd MMMM', { locale: ar })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-muted-foreground py-10">
                <div className="w-24 h-24 rounded-full bg-success/5 flex items-center justify-center mb-6 border border-success/10 shadow-inner">
                  <ShieldCheck className="w-12 h-12 text-success/70" />
                </div>
                <p className="font-black text-2xl text-foreground mb-2">النطاق آمن كلياً</p>
                <p className="text-base font-medium">لا توجد مؤشرات لنفاذ المخزون في المدى المنظور</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card className="flex flex-col rounded-[2rem] border-none cinematic-shadow overflow-hidden bg-card">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b border-border/50 pb-6 pt-8 px-8">
            <CardTitle className="flex items-center gap-3 text-xl font-black">
              <div className="p-3 rounded-2xl bg-warning/10 border border-warning/10 shadow-inner">
                <BellRing className="w-6 h-6 text-warning" />
              </div>
              السجل الأمني للتنبيهات
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            {dashboard.recentAlerts.length > 0 ? (
              <div className="divide-y divide-border/40">
                {dashboard.recentAlerts.slice(0, 5).map(alert => (
                  <div key={alert.id} className="flex items-start gap-5 p-6 hover:bg-muted/30 transition-colors group cursor-pointer">
                    <div className={`mt-1 shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner border group-hover:scale-105 transition-transform ${
                      alert.severity === 'critical' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                      alert.severity === 'warning' ? 'bg-warning/10 text-warning border-warning/20' :
                      'bg-primary/10 text-primary border-primary/20'
                    }`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-base font-bold text-foreground truncate">{alert.title}</p>
                        <span className="text-xs font-bold text-muted-foreground whitespace-nowrap bg-muted px-3 py-1 rounded-lg">
                          {format(parseISO(alert.createdAt), 'hh:mm a', { locale: ar })}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed line-clamp-2">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-muted-foreground py-10">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6 border shadow-inner">
                  <BellRing className="w-12 h-12 text-muted-foreground/50" />
                </div>
                <p className="font-black text-2xl text-foreground mb-2">الشبكة مستقرة</p>
                <p className="text-base font-medium">سجل التنبيهات لا يحتوي على أي طوارئ نشطة</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

