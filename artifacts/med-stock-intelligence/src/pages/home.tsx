import { Link } from "wouter";
import { 
  ShieldCheck, 
  Activity, 
  TrendingUp, 
  CloudLightning,
  ChevronLeft,
  Pill
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomeLanding() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/20" dir="rtl">
      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Pill className="w-6 h-6" />
            </div>
            <span className="font-bold text-lg tracking-tight">مخزون الدواء الذكي</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost" className="font-medium text-muted-foreground hover:text-foreground">
                تسجيل الدخول
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="font-medium shadow-md shadow-primary/20 rounded-full px-6">
                حساب جديد
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 pt-24 pb-16 flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm border border-primary/20 shadow-sm">
            <Activity className="w-4 h-4" />
            <span>نظام متكامل لإدارة الصيدليات والمخازن الطبية</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-foreground leading-[1.15] tracking-tight">
            أدر مخزونك الدوائي <br />
            <span className="text-gradient">بذكاء ودقة متناهية</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            منصة سحابية مدعومة بالذكاء الاصطناعي لتحليل استهلاك الأدوية، التنبؤ بنواقص المخزون، وتقديم بدائل علاجية فورية. مصممة لتلبية احتياجات الرعاية الصحية الحديثة.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/sign-up">
              <Button size="lg" className="rounded-full px-8 h-14 text-base font-semibold shadow-xl shadow-primary/25 group">
                ابدأ رحلة التحول الرقمي
                <ChevronLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-base font-semibold border-border bg-card hover:bg-muted">
                استكشف المنصة
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full mt-24 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="bg-card border border-border/60 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10 group-hover:bg-primary/10 transition-colors" />
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">حماية المخزون</h3>
            <p className="text-muted-foreground leading-relaxed">تنبيهات استباقية قبل نفاد الأدوية الحرجة لضمان استمرارية الرعاية للمرضى.</p>
          </div>

          <div className="bg-card border border-border/60 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-[100px] -z-10 group-hover:bg-secondary/10 transition-colors" />
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6">
              <TrendingUp className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-xl font-bold mb-3">تحليلات تنبؤية</h3>
            <p className="text-muted-foreground leading-relaxed">فهم أعمق لنمط الاستهلاك باستخدام خوارزميات ذكية لتحديد الكميات المطلوبة بدقة.</p>
          </div>

          <div className="bg-card border border-border/60 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-warning/5 rounded-bl-[100px] -z-10 group-hover:bg-warning/10 transition-colors" />
            <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center mb-6">
              <CloudLightning className="w-6 h-6 text-warning" />
            </div>
            <h3 className="text-xl font-bold mb-3">ربط بالمتغيرات البيئية</h3>
            <p className="text-muted-foreground leading-relaxed">توقع ارتفاع الطلب على أدوية معينة بناءً على تحذيرات الطقس والتغيرات المناخية.</p>
          </div>
        </div>
      </main>
    </div>
  );
}