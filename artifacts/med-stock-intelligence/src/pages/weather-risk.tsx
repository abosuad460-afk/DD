import { useGetWeatherRisk } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CloudLightning, ThermometerSun, AlertTriangle, Truck, Info, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";

export default function WeatherRisk() {
  const { data: weather, isLoading, isError } = useGetWeatherRisk();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
        <p>جاري تحليل بيانات الطقس وتأثيرها على خطوط الإمداد...</p>
      </div>
    );
  }

  if (isError || !weather) {
    return (
      <div className="p-8 text-center text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
        تعذر تحميل بيانات تأثير الطقس
      </div>
    );
  }

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-destructive/10 border-destructive/20 text-destructive";
      case "warning": return "bg-warning/10 border-warning/20 text-warning-foreground";
      default: return "bg-primary/10 border-primary/20 text-primary";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical": return <Badge variant="destructive" className="px-3 py-1 text-sm">تأثير حرج</Badge>;
      case "warning": return <Badge variant="secondary" className="px-3 py-1 text-sm bg-warning/20 text-warning-foreground">تأثير متوسط</Badge>;
      default: return <Badge variant="outline" className="px-3 py-1 text-sm border-primary text-primary">تأثير منخفض</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">تحليل مخاطر الطقس على الإمداد</h1>
        <p className="text-muted-foreground mt-1">توقع تأخيرات التوريد بناءً على الظروف الجوية القاسية في مدن الموردين الرئيسية</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className={`col-span-1 md:col-span-2 border-2 ${
          weather.severity === 'critical' ? 'border-destructive' :
          weather.severity === 'warning' ? 'border-warning' : 'border-primary'
        }`}>
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl flex items-center gap-2">
                <CloudLightning className={`w-6 h-6 ${
                  weather.severity === 'critical' ? 'text-destructive' :
                  weather.severity === 'warning' ? 'text-warning' : 'text-primary'
                }`} />
                التحذير الجوي الحالي
              </CardTitle>
              {getSeverityBadge(weather.severity)}
            </div>
            <CardDescription className="text-base mt-2 font-medium">
              المدينة المتأثرة: {weather.city}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                <ThermometerSun className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-3xl font-bold text-foreground">{weather.temperature}°C</span>
                <span className="text-sm text-muted-foreground mt-1">درجة الحرارة المتوقعة</span>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                <AlertTriangle className={`w-8 h-8 mb-2 ${
                  weather.severity === 'critical' ? 'text-destructive' :
                  weather.severity === 'warning' ? 'text-warning' : 'text-primary'
                }`} />
                <span className="text-xl font-bold text-foreground">{weather.condition}</span>
                <span className="text-sm text-muted-foreground mt-1">الحالة الجوية</span>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${getSeverityStyle(weather.severity)}`}>
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <Info className="w-5 h-5" />
                توصية الذكاء الاصطناعي السريري
              </h4>
              <p className="text-sm/relaxed leading-relaxed font-medium">
                {weather.recommendation}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="w-5 h-5 text-muted-foreground" />
                التأثير على الشحنات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="text-4xl font-black text-foreground mb-2">{weather.affectedOrders}</div>
                <p className="text-sm text-muted-foreground font-medium">طلبات توريد متأثرة محتملة</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                نافذة الخطر المتوقعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/40 rounded-lg text-center border border-border">
                <p className="font-bold text-foreground text-lg">{weather.riskWindow}</p>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-4">
                آخر تحديث للبيانات: {format(parseISO(weather.updatedAt), 'd MMMM, HH:mm', { locale: ar })}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
