import { useState } from "react";
import { useListAlternatives, useDecideAlternative, getListAlternativesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, GitMerge, Check, X, ClipboardType, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Alternative, AlternativeDecisionDecision, DecisionStatus } from "@workspace/api-client-react";

export default function Alternatives() {
  const { data: alternatives, isLoading } = useListAlternatives();
  const decideAlternative = useDecideAlternative();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [decisionOpen, setDecisionOpen] = useState<{ id: number, type: AlternativeDecisionDecision } | null>(null);
  const [note, setNote] = useState("");

  const handleDecisionSubmit = () => {
    if (!decisionOpen) return;
    
    decideAlternative.mutate({
      id: decisionOpen.id,
      data: {
        decision: decisionOpen.type,
        pharmacistNote: note
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAlternativesQueryKey() });
        setDecisionOpen(null);
        setNote("");
        toast({
          title: decisionOpen.type === "approved" ? "تم الاعتماد" : "تم الرفض",
          description: "تم تسجيل القرار بنجاح وتحديث النظام"
        });
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "حدث خطأ أثناء تسجيل القرار"
        });
      }
    });
  };

  const getStatusBadge = (status: DecisionStatus) => {
    switch (status) {
      case "pending": return <Badge variant="secondary" className="bg-warning/20 text-warning-foreground">قيد المراجعة</Badge>;
      case "approved": return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">معتمد</Badge>;
      case "rejected": return <Badge variant="destructive">مرفوض</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">البدائل العلاجية المقترحة</h1>
        <p className="text-muted-foreground mt-1">مراجعة البدائل الدوائية عند نقص المخزون واعتمادها سريرياً</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {isLoading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground bg-card rounded-xl border border-border">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p>جاري تحميل المقترحات...</p>
          </div>
        ) : alternatives?.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground bg-card rounded-xl border border-border">
            <GitMerge className="w-16 h-16 mb-4 text-muted/50" />
            <h3 className="text-lg font-medium text-foreground">لا توجد اقتراحات بدائل حالياً</h3>
            <p>المخزون الحالي يلبي الاحتياج أو لا توجد بدائل معلقة للمراجعة</p>
          </div>
        ) : (
          alternatives?.map((alt) => (
            <Card key={alt.id} className={`overflow-hidden ${alt.decision !== 'pending' ? 'opacity-80 bg-muted/20' : ''}`}>
              <CardHeader className="bg-muted/30 pb-4 border-b border-border">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-warning" />
                      نقص في: {alt.medicineName}
                    </CardTitle>
                    <p className="text-sm font-medium text-muted-foreground">
                      البديل المقترح: <span className="text-foreground">{alt.alternativeName}</span>
                    </p>
                  </div>
                  {getStatusBadge(alt.decision)}
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-background rounded-md p-3 border border-border">
                    <p className="text-muted-foreground mb-1">المادة الفعالة المشتركة</p>
                    <p className="font-semibold">{alt.activeIngredient}</p>
                  </div>
                  <div className="bg-background rounded-md p-3 border border-border">
                    <p className="text-muted-foreground mb-1">نسبة التطابق السريري</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${alt.similarity >= 90 ? 'bg-emerald-500' : alt.similarity >= 75 ? 'bg-warning' : 'bg-destructive'}`} 
                          style={{ width: `${alt.similarity}%` }}
                        />
                      </div>
                      <span className="font-bold">{alt.similarity}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm border-t border-border pt-4">
                  <span className="text-muted-foreground">مخزون البديل المتوفر:</span>
                  <Badge variant="outline" className="font-bold font-mono">{alt.availableStock} وحدة</Badge>
                </div>

                {alt.pharmacistNote && (
                  <div className="bg-accent/50 p-3 rounded-lg mt-4 text-sm">
                    <p className="font-semibold text-accent-foreground flex items-center gap-2 mb-1">
                      <ClipboardType className="w-4 h-4" />
                      ملاحظة الصيدلي:
                    </p>
                    <p className="text-muted-foreground">{alt.pharmacistNote}</p>
                  </div>
                )}
              </CardContent>
              
              {alt.decision === "pending" && (
                <CardFooter className="p-5 pt-0 flex gap-3">
                  <Button 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" 
                    onClick={() => setDecisionOpen({ id: alt.id, type: "approved" })}
                  >
                    <Check className="w-4 h-4 ml-2" />
                    اعتماد البديل
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={() => setDecisionOpen({ id: alt.id, type: "rejected" })}
                  >
                    <X className="w-4 h-4 ml-2" />
                    رفض
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!decisionOpen} onOpenChange={(open) => !open && setDecisionOpen(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {decisionOpen?.type === 'approved' ? 'تأكيد اعتماد البديل' : 'تأكيد رفض البديل'}
            </DialogTitle>
            <DialogDescription>
              يرجى كتابة ملاحظة طبية توضح سبب قرارك (اختياري).
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note">ملاحظة الصيدلي السريري</Label>
              <Textarea 
                id="note" 
                placeholder="أدخل ملاحظاتك هنا..." 
                className="min-h-[100px]"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">إلغاء</Button>
            </DialogClose>
            <Button 
              onClick={handleDecisionSubmit} 
              disabled={decideAlternative.isPending}
              variant={decisionOpen?.type === 'approved' ? 'default' : 'destructive'}
              className={decisionOpen?.type === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
              {decideAlternative.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              تأكيد القرار
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
