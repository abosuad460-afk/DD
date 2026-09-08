import { Link } from "wouter";
import { 
  ShieldCheck, 
  Activity, 
  TrendingUp, 
  CloudLightning,
  ChevronLeft,
  Pill,
  Lock,
  Globe2
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomeLanding() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/20" dir="rtl">
      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border/40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform duration-300">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl text-foreground tracking-tight leading-none">ألفا ميد</span>
              <span className="text-[11px] font-semibold text-muted-foreground tracking-widest uppercase">ALPHAMED</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost" className="font-bold text-muted-foreground hover:text-foreground text-base">
                تسجيل الدخول
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="font-bold shadow-xl shadow-primary/20 rounded-full px-8 h-11 text-base bg-primary hover:bg-primary/90">
                حساب جديد
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Cinematic Hero Section */}
      <main className="flex-1 pt-32 pb-24 flex flex-col items-center justify-center text-center px-6 relative overflow-hidden min-h-[90vh]">
        {/* Deep Cinematic Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-background to-transparent -z-10 pointer-events-none" />

        <div className="max-w-5xl mx-auto space-y-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary font-bold text-sm border border-primary/20 shadow-sm backdrop-blur-md">
            <Globe2 className="w-4 h-4" />
            <span>المنصة الرائدة لإدارة وتأمين الإمداد الطبي</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-foreground leading-[1.1] tracking-tight">
            السيطرة الكاملة على <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-secondary">
              المخزون الدوائي
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
            منظومة سحابية سيادية مدعومة بالذكاء الاصطناعي لحماية سلاسل الإمداد الطبية، التنبؤ الدقيق بالنواقص، وضمان استمرارية الرعاية الصحية بكفاءة مطلقة.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-8">
            <Link href="/sign-up">
              <Button size="lg" className="rounded-full px-10 h-16 text-lg font-bold shadow-2xl shadow-primary/30 group bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105">
                تأسيس شراكة استراتيجية
                <ChevronLeft className="w-6 h-6 mr-2 group-hover:-translate-x-1.5 transition-transform" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="rounded-full px-10 h-16 text-lg font-bold border-border/80 bg-background/50 backdrop-blur-md hover:bg-muted hover:border-border transition-all duration-300">
                تسجيل دخول المنشآت
              </Button>
            </Link>
          </div>
        </div>

        {/* Cinematic Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto w-full mt-32 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="group relative bg-card border border-border/50 p-10 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 shadow-inner border border-primary/10">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-black mb-4 text-foreground">أمن استراتيجي</h3>
            <p className="text-muted-foreground leading-relaxed text-lg font-medium">
              حماية تامة للمخزون الدائري مع تنبيهات استباقية قبل النفاذ لضمان توفر الأدوية الحيوية على مدار الساعة.
            </p>
          </div>

          <div className="group relative bg-card border border-border/50 p-10 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-8 shadow-inner border border-secondary/10">
              <TrendingUp className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-2xl font-black mb-4 text-foreground">ذكاء تنبؤي</h3>
            <p className="text-muted-foreground leading-relaxed text-lg font-medium">
              خوارزميات متقدمة تحلل أنماط الاستهلاك بدقة لتقديم توصيات توريد مثالية ومنع الهدر الدوائي.
            </p>
          </div>

          <div className="group relative bg-card border border-border/50 p-10 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-16 h-16 rounded-2xl bg-warning/10 flex items-center justify-center mb-8 shadow-inner border border-warning/10">
              <CloudLightning className="w-8 h-8 text-warning" />
            </div>
            <h3 className="text-2xl font-black mb-4 text-foreground">استجابة للمتغيرات</h3>
            <p className="text-muted-foreground leading-relaxed text-lg font-medium">
              ربط مباشر بالظروف المناخية والبيئية لتوقع الطوارئ الصحية وتعديل خطط الإمداد استباقياً.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}