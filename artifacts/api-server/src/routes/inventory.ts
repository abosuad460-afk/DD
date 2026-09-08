import { Router, type IRouter, type RequestHandler } from "express";
import { getAuth } from "@clerk/express";
import {
  AcknowledgeAlertParams,
  AcknowledgeAlertResponse,
  CreateSupplyOrderBody,
  CreateSupplyOrderResponse,
  DecideAlternativeBody,
  DecideAlternativeParams,
  DecideAlternativeResponse,
  GetDashboardResponse,
  GetWeatherRiskResponse,
  ListAlertsResponse,
  ListAlternativesResponse,
  ListMedicinesQueryParams,
  ListMedicinesResponse,
  ListSupplyOrdersResponse,
  UpdateMedicineBody,
  UpdateMedicineParams,
  UpdateMedicineResponse,
  UpdateSupplyOrderBody,
  UpdateSupplyOrderParams,
  UpdateSupplyOrderResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const requireAuth: RequestHandler = (req, res, next) => {
  const auth = getAuth(req);
  const userId = auth.sessionClaims?.userId ?? auth.userId;
  if (!userId) {
    res.status(401).json({ error: "يلزم تسجيل الدخول" });
    return;
  }
  next();
};

router.use(requireAuth);

type StockStatus = "available" | "low" | "critical";
type Priority = "vital" | "essential" | "desirable";
type SupplyStatus = "draft" | "ordered" | "shipped" | "received" | "delayed";
type Severity = "info" | "warning" | "critical";
type Decision = "pending" | "approved" | "rejected";

type Medicine = {
  id: number;
  name: string;
  scientificName: string;
  sku: string;
  category: string;
  stock: number;
  unit: string;
  reorderPoint: number;
  safeStock: number;
  dailyConsumption: number;
  status: StockStatus;
  priority: Priority;
  expiryDate: string;
  location: string;
  predictedRunoutDate: string;
  coverageDays: number;
};

type Alert = {
  id: number;
  medicineId: number;
  medicineName: string;
  title: string;
  message: string;
  severity: Severity;
  createdAt: string;
  acknowledged: boolean;
};

type SupplyOrder = {
  id: number;
  orderNumber: string;
  supplier: string;
  medicineId: number;
  medicineName: string;
  quantity: number;
  status: SupplyStatus;
  orderedAt: string;
  expectedArrival: string;
  priority: Priority;
};

type Alternative = {
  id: number;
  medicineId: number;
  medicineName: string;
  alternativeName: string;
  activeIngredient: string;
  availableStock: number;
  similarity: number;
  decision: Decision;
  pharmacistNote: string;
};

const medicines: Medicine[] = [
  { id: 1, name: "أدرينالين 1 ملغ", scientificName: "Epinephrine", sku: "ER-00192", category: "أدوية الطوارئ", stock: 24, unit: "أمبولة", reorderPoint: 40, safeStock: 90, dailyConsumption: 8, status: "critical", priority: "vital", expiryDate: "2027-05-30", location: "ثلاجة الطوارئ A-01", predictedRunoutDate: "2026-09-11", coverageDays: 3 },
  { id: 2, name: "إنسولين سريع المفعول", scientificName: "Insulin Aspart", sku: "DM-00241", category: "السكري", stock: 68, unit: "قلم", reorderPoint: 75, safeStock: 160, dailyConsumption: 9.7, status: "low", priority: "vital", expiryDate: "2027-02-18", location: "ثلاجة الصيدلية B-03", predictedRunoutDate: "2026-09-15", coverageDays: 7 },
  { id: 3, name: "أموكسيسيلين 500 ملغ", scientificName: "Amoxicillin", sku: "AB-00488", category: "المضادات الحيوية", stock: 310, unit: "كبسولة", reorderPoint: 120, safeStock: 280, dailyConsumption: 18.2, status: "available", priority: "essential", expiryDate: "2027-11-04", location: "مستودع 1، رف C-12", predictedRunoutDate: "2026-09-25", coverageDays: 17 },
  { id: 4, name: "سيفترياكسون 1 جم", scientificName: "Ceftriaxone", sku: "AB-00831", category: "المضادات الحيوية", stock: 42, unit: "فيال", reorderPoint: 65, safeStock: 140, dailyConsumption: 7, status: "low", priority: "essential", expiryDate: "2027-08-21", location: "مستودع 1، رف C-08", predictedRunoutDate: "2026-09-14", coverageDays: 6 },
  { id: 5, name: "باراسيتامول 500 ملغ", scientificName: "Paracetamol", sku: "AN-00110", category: "مسكنات", stock: 1240, unit: "قرص", reorderPoint: 300, safeStock: 800, dailyConsumption: 72.9, status: "available", priority: "essential", expiryDate: "2028-01-12", location: "مستودع 2، رف A-02", predictedRunoutDate: "2026-09-25", coverageDays: 17 },
  { id: 6, name: "أتورفاستاتين 20 ملغ", scientificName: "Atorvastatin", sku: "CV-00672", category: "القلب والأوعية", stock: 185, unit: "قرص", reorderPoint: 90, safeStock: 210, dailyConsumption: 11.6, status: "available", priority: "desirable", expiryDate: "2027-06-09", location: "مستودع 2، رف D-07", predictedRunoutDate: "2026-09-24", coverageDays: 16 },
  { id: 7, name: "هيبارين 5000 وحدة", scientificName: "Heparin Sodium", sku: "CV-00904", category: "مضادات التخثر", stock: 16, unit: "فيال", reorderPoint: 35, safeStock: 80, dailyConsumption: 5.3, status: "critical", priority: "vital", expiryDate: "2027-04-17", location: "الصيدلية المركزية D-02", predictedRunoutDate: "2026-09-11", coverageDays: 3 },
  { id: 8, name: "سالبيوتامول بخاخ", scientificName: "Salbutamol", sku: "RS-00331", category: "الجهاز التنفسي", stock: 96, unit: "بخاخ", reorderPoint: 55, safeStock: 120, dailyConsumption: 6, status: "available", priority: "essential", expiryDate: "2027-09-25", location: "مستودع 1، رف F-04", predictedRunoutDate: "2026-09-24", coverageDays: 16 },
];

const alerts: Alert[] = [
  { id: 1, medicineId: 1, medicineName: "أدرينالين 1 ملغ", title: "مخزون حرج لدواء حيوي", message: "الرصيد يكفي 3 أيام فقط، ونقطة إعادة الطلب متجاوزة.", severity: "critical", createdAt: "2026-09-08T08:35:00+03:00", acknowledged: false },
  { id: 2, medicineId: 7, medicineName: "هيبارين 5000 وحدة", title: "نفاد متوقع خلال 72 ساعة", message: "ينبغي تسريع طلب التوريد رقم PO-2048.", severity: "critical", createdAt: "2026-09-08T07:50:00+03:00", acknowledged: false },
  { id: 3, medicineId: 2, medicineName: "إنسولين سريع المفعول", title: "انخفاض دون المخزون الآمن", message: "الاستهلاك أعلى 12% من المتوسط الأسبوعي.", severity: "warning", createdAt: "2026-09-07T16:20:00+03:00", acknowledged: false },
  { id: 4, medicineId: 4, medicineName: "سيفترياكسون 1 جم", title: "طلب توريد متأخر", message: "تم تحديث الوصول المتوقع بسبب حالة النقل.", severity: "warning", createdAt: "2026-09-07T11:10:00+03:00", acknowledged: true },
];

const orders: SupplyOrder[] = [
  { id: 1, orderNumber: "PO-2048", supplier: "شركة الدواء للخدمات الطبية", medicineId: 7, medicineName: "هيبارين 5000 وحدة", quantity: 240, status: "shipped", orderedAt: "2026-09-05", expectedArrival: "2026-09-10", priority: "vital" },
  { id: 2, orderNumber: "PO-2051", supplier: "مستودعات الشفاء", medicineId: 1, medicineName: "أدرينالين 1 ملغ", quantity: 300, status: "ordered", orderedAt: "2026-09-07", expectedArrival: "2026-09-12", priority: "vital" },
  { id: 3, orderNumber: "PO-2039", supplier: "الإمداد الصحي المتقدم", medicineId: 4, medicineName: "سيفترياكسون 1 جم", quantity: 500, status: "delayed", orderedAt: "2026-09-02", expectedArrival: "2026-09-13", priority: "essential" },
  { id: 4, orderNumber: "PO-2028", supplier: "مستودعات الشفاء", medicineId: 5, medicineName: "باراسيتامول 500 ملغ", quantity: 1500, status: "received", orderedAt: "2026-08-29", expectedArrival: "2026-09-06", priority: "essential" },
];

const alternatives: Alternative[] = [
  { id: 1, medicineId: 4, medicineName: "سيفترياكسون 1 جم", alternativeName: "سيفوتاكسيم 1 جم", activeIngredient: "Cefotaxime", availableStock: 188, similarity: 86, decision: "pending", pharmacistNote: "يتطلب مراجعة الجرعة حسب التشخيص ووظائف الكلى." },
  { id: 2, medicineId: 2, medicineName: "إنسولين سريع المفعول", alternativeName: "إنسولين ليسبرو", activeIngredient: "Insulin Lispro", availableStock: 74, similarity: 94, decision: "pending", pharmacistNote: "بديل سريع المفعول؛ يلزم اعتماد الصيدلي ومراجعة الوصفة." },
  { id: 3, medicineId: 5, medicineName: "باراسيتامول 500 ملغ", alternativeName: "باراسيتامول محلول فموي", activeIngredient: "Paracetamol", availableStock: 320, similarity: 91, decision: "approved", pharmacistNote: "تم الاعتماد للحالات التي يتعذر فيها بلع الأقراص." },
];

function recalculate(medicine: Medicine) {
  medicine.coverageDays = Math.max(0, Math.floor(medicine.stock / medicine.dailyConsumption));
  const runout = new Date("2026-09-08T12:00:00+03:00");
  runout.setDate(runout.getDate() + medicine.coverageDays);
  medicine.predictedRunoutDate = runout.toISOString().slice(0, 10);
  medicine.status = medicine.stock <= medicine.reorderPoint * 0.6
    ? "critical"
    : medicine.stock <= medicine.reorderPoint
      ? "low"
      : "available";
}

router.get("/dashboard", (_req, res) => {
  const availableCount = medicines.filter((item) => item.status === "available").length;
  const lowCount = medicines.filter((item) => item.status === "low").length;
  const criticalCount = medicines.filter((item) => item.status === "critical").length;
  const data = GetDashboardResponse.parse({
    totalMedicines: medicines.length,
    availableCount,
    lowCount,
    criticalCount,
    activeAlerts: alerts.filter((item) => !item.acknowledged).length,
    openOrders: orders.filter((item) => !["received"].includes(item.status)).length,
    stockHealth: Math.round((availableCount / medicines.length) * 100),
    monthlyStockouts: 2,
    earlyDetectionRate: 92,
    averageDispenseMinutes: 6.4,
    consumptionTrend: [
      { day: "الأحد", dispensed: 148, received: 90 },
      { day: "الاثنين", dispensed: 172, received: 210 },
      { day: "الثلاثاء", dispensed: 161, received: 80 },
      { day: "الأربعاء", dispensed: 190, received: 260 },
      { day: "الخميس", dispensed: 184, received: 120 },
      { day: "الجمعة", dispensed: 132, received: 60 },
      { day: "السبت", dispensed: 155, received: 300 },
    ],
    predictedRunouts: [...medicines].sort((a, b) => a.coverageDays - b.coverageDays).slice(0, 5),
    recentAlerts: alerts.slice(0, 4),
    upcomingOrders: orders.filter((item) => item.status !== "received").slice(0, 4),
  });
  res.json(data);
});

router.get("/medicines", (req, res) => {
  const query = ListMedicinesQueryParams.parse(req.query);
  const search = query.search?.trim().toLowerCase();
  const result = medicines.filter((item) =>
    (!search || [item.name, item.scientificName, item.sku, item.category].some((value) => value.toLowerCase().includes(search))) &&
    (!query.status || item.status === query.status) &&
    (!query.priority || item.priority === query.priority),
  );
  res.json(ListMedicinesResponse.parse(result));
});

router.patch("/medicines/:id", (req, res) => {
  const { id } = UpdateMedicineParams.parse(req.params);
  const body = UpdateMedicineBody.parse(req.body);
  const medicine = medicines.find((item) => item.id === id);
  if (!medicine) {
    res.status(404).json({ error: "الدواء غير موجود" });
    return;
  }
  Object.assign(medicine, body);
  recalculate(medicine);
  res.json(UpdateMedicineResponse.parse(medicine));
});

router.get("/alerts", (_req, res) => {
  res.json(ListAlertsResponse.parse(alerts));
});

router.patch("/alerts/:id/acknowledge", (req, res) => {
  const { id } = AcknowledgeAlertParams.parse(req.params);
  const alert = alerts.find((item) => item.id === id);
  if (!alert) {
    res.status(404).json({ error: "التنبيه غير موجود" });
    return;
  }
  alert.acknowledged = true;
  res.json(AcknowledgeAlertResponse.parse(alert));
});

router.get("/supply-orders", (_req, res) => {
  res.json(ListSupplyOrdersResponse.parse(orders));
});

router.post("/supply-orders", (req, res) => {
  const body = CreateSupplyOrderBody.parse(req.body);
  const order: SupplyOrder = {
    id: Math.max(...orders.map((item) => item.id)) + 1,
    orderNumber: `PO-${2051 + orders.length}`,
    orderedAt: new Date().toISOString().slice(0, 10),
    status: "ordered",
    ...body,
    expectedArrival: body.expectedArrival.toISOString().slice(0, 10),
  };
  orders.unshift(order);
  res.status(201).json(CreateSupplyOrderResponse.parse(order));
});

router.patch("/supply-orders/:id", (req, res) => {
  const { id } = UpdateSupplyOrderParams.parse(req.params);
  const body = UpdateSupplyOrderBody.parse(req.body);
  const order = orders.find((item) => item.id === id);
  if (!order) {
    res.status(404).json({ error: "طلب التوريد غير موجود" });
    return;
  }
  Object.assign(order, {
    ...body,
    expectedArrival: body.expectedArrival?.toISOString().slice(0, 10),
  });
  res.json(UpdateSupplyOrderResponse.parse(order));
});

router.get("/alternatives", (_req, res) => {
  res.json(ListAlternativesResponse.parse(alternatives));
});

router.patch("/alternatives/:id/decision", (req, res) => {
  const { id } = DecideAlternativeParams.parse(req.params);
  const body = DecideAlternativeBody.parse(req.body);
  const alternative = alternatives.find((item) => item.id === id);
  if (!alternative) {
    res.status(404).json({ error: "البديل غير موجود" });
    return;
  }
  alternative.decision = body.decision;
  alternative.pharmacistNote = body.pharmacistNote ?? alternative.pharmacistNote;
  res.json(DecideAlternativeResponse.parse(alternative));
});

router.get("/weather", (_req, res) => {
  const data = GetWeatherRiskResponse.parse({
    city: "الرياض",
    temperature: 43,
    condition: "موجة غبار ورياح نشطة",
    severity: "warning",
    riskWindow: "من 10 إلى 12 سبتمبر",
    recommendation: "رفع المخزون الآمن للأدوية الحيوية بنسبة 20% وتسريع الطلبات المتوقعة خلال نافذة التأثر.",
    affectedOrders: 2,
    updatedAt: "2026-09-08T09:20:00+03:00",
  });
  res.json(data);
});

export default router;