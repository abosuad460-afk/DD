import { type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useUser, useClerk } from "@clerk/react";
import {
  LayoutDashboard,
  Pill,
  BellRing,
  ShoppingCart,
  GitMerge,
  CloudLightning,
  LineChart,
  LogOut,
  UserRound
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navigation = [
  { name: "لوحة القيادة", href: "/dashboard", icon: LayoutDashboard },
  { name: "الأدوية والمخزون", href: "/medicines", icon: Pill },
  { name: "التنبيهات", href: "/alerts", icon: BellRing },
  { name: "طلبات التوريد", href: "/supply-orders", icon: ShoppingCart },
  { name: "البدائل العلاجية", href: "/alternatives", icon: GitMerge },
  { name: "تأثير الطقس", href: "/weather", icon: CloudLightning },
  { name: "التقارير والإحصائيات", href: "/reports", icon: LineChart },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    await signOut();
  };

  const displayName = user?.fullName || user?.firstName || "المستخدم الحالي";
  const initials = displayName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "م";

  return (
    <div dir="rtl" className="flex h-screen w-full bg-background font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-sidebar border-l border-sidebar-border flex flex-col justify-between hidden md:flex shrink-0 shadow-[var(--shadow-sm)] z-10 relative">
        <div className="flex flex-col h-full overflow-hidden">
          <div className="h-20 flex items-center px-6 border-b border-sidebar-border/60 shrink-0">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
                <Pill className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-sidebar-foreground tracking-tight leading-tight">مخزون الدواء الذكي</span>
                <span className="text-[10px] text-muted-foreground font-medium">منظومة الإدارة المتكاملة</span>
              </div>
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto py-6 px-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">القائمة الرئيسية</div>
            <nav className="space-y-1.5">
              {navigation.map((item) => {
                const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all group relative",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    {isActive && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-l-full" />
                    )}
                    <item.icon className={cn(
                      "w-5 h-5 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                    )} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-sidebar-border bg-card shrink-0">
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-background mb-3 shadow-sm">
              <Avatar className="w-10 h-10 border border-border">
                <AvatarImage src={user?.imageUrl} alt={displayName} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-foreground truncate">{displayName}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                  صيدلي مسؤول
                </span>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] dark:bg-background">
        {/* Mobile Header */}
        <header className="h-16 bg-card border-b border-border flex md:hidden items-center justify-between px-4 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3 text-primary font-bold">
            <div className="bg-gradient-to-br from-primary to-secondary w-8 h-8 rounded-lg flex items-center justify-center text-white">
              <Pill className="w-4 h-4" />
            </div>
            <span>مخزون الدواء</span>
          </div>
          
          <button onClick={handleSignOut} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </header>
        
        {/* Scrollable Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8 md:pt-10 scroll-smooth">
          <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}