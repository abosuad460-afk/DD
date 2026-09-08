import { type ReactNode, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useUser, useClerk } from "@clerk/react";
import { useGetMyAccess } from "@workspace/api-client-react";
import {
  LayoutDashboard,
  Pill,
  BellRing,
  ShoppingCart,
  GitMerge,
  CloudLightning,
  LineChart,
  LogOut,
  ShieldCheck,
  Users,
  Handshake,
  FileText,
  Building2,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  section?: string;
}

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  
  // Fetch role & access
  const { data: access, isLoading: accessLoading } = useGetMyAccess();

  const handleSignOut = async () => {
    await signOut();
  };

  const displayName = user?.fullName || user?.firstName || "المستخدم الحالي";
  const initials = displayName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "م";

  const roleName = useMemo(() => {
    if (!access) return "جاري التحقق...";
    switch(access.role) {
      case 'admin': return "مدير النظام";
      case 'pharmacist': return "صيدلي";
      case 'supply_manager': return "مدير الإمداد";
      case 'beneficiary': return "جهة مستفيدة";
      default: return "مستخدم";
    }
  }, [access]);

  const navigation = useMemo(() => {
    if (!access) return [];
    
    const items: NavItem[] = [];
    const { role } = access;

    if (role === 'admin') {
      items.push({ name: "لوحة القيادة", href: "/dashboard", icon: LayoutDashboard, section: "الرئيسية" });
      
      items.push({ name: "مراجعة الطلبات", href: "/admin/applications", icon: Users, section: "الإدارة والتحكم" });
      items.push({ name: "إدارة الشركاء", href: "/partners", icon: Handshake, section: "الإدارة والتحكم" });
      
      items.push({ name: "الأدوية والمخزون", href: "/medicines", icon: Pill, section: "العمليات" });
      items.push({ name: "التنبيهات", href: "/alerts", icon: BellRing, section: "العمليات" });
      items.push({ name: "طلبات التوريد", href: "/supply-orders", icon: ShoppingCart, section: "العمليات" });
      items.push({ name: "البدائل العلاجية", href: "/alternatives", icon: GitMerge, section: "العمليات" });
      items.push({ name: "تأثير الطقس", href: "/weather", icon: CloudLightning, section: "التقارير" });
      items.push({ name: "التقارير والإحصائيات", href: "/reports", icon: LineChart, section: "التقارير" });
    } 
    else if (role === 'beneficiary') {
      items.push({ name: "حالة الطلب", href: "/join", icon: FileText, section: "الانضمام للمنصة" });
    }
    else {
      // pharmacist / supply_manager
      items.push({ name: "لوحة القيادة", href: "/dashboard", icon: LayoutDashboard, section: "الرئيسية" });
      items.push({ name: "الأدوية والمخزون", href: "/medicines", icon: Pill, section: "العمليات" });
      items.push({ name: "التنبيهات", href: "/alerts", icon: BellRing, section: "العمليات" });
      items.push({ name: "طلبات التوريد", href: "/supply-orders", icon: ShoppingCart, section: "العمليات" });
      items.push({ name: "البدائل العلاجية", href: "/alternatives", icon: GitMerge, section: "العمليات" });
      items.push({ name: "تأثير الطقس", href: "/weather", icon: CloudLightning, section: "التقارير" });
      items.push({ name: "التقارير والإحصائيات", href: "/reports", icon: LineChart, section: "التقارير" });
    }
    return items;
  }, [access]);

  // Group items by section
  const navSections = useMemo(() => {
    const sections: Record<string, NavItem[]> = {};
    navigation.forEach(item => {
      const sectionName = item.section || "عام";
      if (!sections[sectionName]) sections[sectionName] = [];
      sections[sectionName].push(item);
    });
    return sections;
  }, [navigation]);

  return (
    <div dir="rtl" className="flex h-[100dvh] w-full bg-[#f8fafc] font-sans overflow-hidden">
      {/* Cinematic Dark Sidebar */}
      <aside className="w-[280px] bg-sidebar text-sidebar-foreground flex flex-col justify-between hidden md:flex shrink-0 shadow-2xl z-20 relative border-l border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-50 pointer-events-none" />
        
        <div className="flex flex-col h-full overflow-hidden relative z-10">
          <div className="h-24 flex items-center px-6 border-b border-white/10 shrink-0">
            <Link href="/dashboard" className="flex items-center gap-3 group w-full">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform border border-white/10">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg text-white tracking-tight leading-tight">ألفا ميد</span>
                <span className="text-xs text-sidebar-foreground/70 font-medium">المنظومة الاستراتيجية</span>
              </div>
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
            {accessLoading ? (
              <div className="space-y-4 px-2 animate-pulse">
                <div className="h-4 bg-white/5 rounded w-1/3 mb-6" />
                {[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-white/5 rounded-lg w-full" />)}
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(navSections).map(([section, items]) => (
                  <div key={section} className="space-y-2">
                    <div className="text-[11px] font-bold text-sidebar-foreground/50 uppercase tracking-widest px-3 mb-2">
                      {section}
                    </div>
                    <nav className="space-y-1">
                      {items.map((item) => {
                        const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative overflow-hidden",
                              isActive
                                ? "bg-primary/20 text-white shadow-inner"
                                : "text-sidebar-foreground/80 hover:bg-white/5 hover:text-white"
                            )}
                          >
                            {isActive && (
                              <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_var(--color-primary)]" />
                            )}
                            <item.icon className={cn(
                              "w-5 h-5 transition-colors",
                              isActive ? "text-primary-foreground" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"
                            )} />
                            {item.name}
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/10 shrink-0 bg-sidebar/50 backdrop-blur-md">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 mb-3 transition-colors hover:bg-white/10 cursor-default">
              <Avatar className="w-10 h-10 border border-white/20 shadow-md">
                <AvatarImage src={user?.imageUrl} alt={displayName} />
                <AvatarFallback className="bg-primary text-white font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-white truncate">{displayName}</span>
                <span className="text-xs text-sidebar-foreground/70 flex items-center gap-1.5">
                  <div className={cn("w-1.5 h-1.5 rounded-full", access?.role === 'admin' ? "bg-secondary" : "bg-primary")}></div>
                  {roleName}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
            >
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        {/* Mobile Header */}
        <header className="h-16 bg-white border-b border-border flex md:hidden items-center justify-between px-4 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3 text-primary font-bold">
            <div className="bg-gradient-to-br from-primary to-primary/80 w-8 h-8 rounded-lg flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span>ألفا ميد</span>
          </div>
          
          <button onClick={handleSignOut} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </header>
        
        {/* Scrollable Main Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8 md:pt-10 scroll-smooth relative">
          {/* Subtle background flair */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />
          
          <div className="max-w-[1400px] mx-auto space-y-8 pb-12 min-h-full">
            {children}
          </div>
        </div>
      </main>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
}