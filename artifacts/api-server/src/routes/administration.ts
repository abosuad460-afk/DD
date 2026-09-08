import { getAuth } from "@clerk/express";
import { Router, type Request, type RequestHandler } from "express";

type Role = "admin" | "pharmacist" | "supply_manager" | "beneficiary";
type Decision = "pending" | "approved" | "rejected";

const router = Router();
const roles = new Map<string, Role>();

const applications = [
  { id: 1, userId: "demo-1", fullName: "د. نورة العتيبي", email: "noura@example.sa", phone: "0551234567", organization: "صيدلية الشفاء", organizationType: "صيدلية", requestedRole: "pharmacist" as Role, status: "pending" as Decision, submittedAt: "2026-09-07T08:30:00Z", reviewedAt: "", reviewerNote: "" },
  { id: 2, userId: "demo-2", fullName: "عبدالعزيز الحربي", email: "aziz@example.sa", phone: "0539876543", organization: "مستودع الإمداد الطبي", organizationType: "مستودع", requestedRole: "supply_manager" as Role, status: "pending" as Decision, submittedAt: "2026-09-06T11:15:00Z", reviewedAt: "", reviewerNote: "" },
  { id: 3, userId: "demo-3", fullName: "مركز رعاية الندى", email: "care@example.sa", phone: "0112345678", organization: "مركز رعاية الندى", organizationType: "مركز طبي", requestedRole: "beneficiary" as Role, status: "approved" as Decision, submittedAt: "2026-09-03T09:00:00Z", reviewedAt: "2026-09-04T10:00:00Z", reviewerNote: "تم التحقق من بيانات الجهة" },
];

const partners = [
  { id: 1, name: "صيدليات الشفاء", type: "سلسلة صيدليات", city: "الرياض", contactName: "سارة المطيري", contactEmail: "sara@shifa.sa", contactPhone: "0551112233", status: "active", medicinesCount: 286, joinedAt: "2026-01-18" },
  { id: 2, name: "مستودع الإمداد الطبي", type: "مورد وموزع", city: "جدة", contactName: "خالد الزهراني", contactEmail: "khaled@emdad.sa", contactPhone: "0507788991", status: "active", medicinesCount: 412, joinedAt: "2026-02-12" },
  { id: 3, name: "مركز رعاية الندى", type: "مركز طبي", city: "الدمام", contactName: "ريم القحطاني", contactEmail: "reem@alnada.sa", contactPhone: "0564433221", status: "onboarding", medicinesCount: 74, joinedAt: "2026-08-28" },
];

function userId(req: Request) {
  return getAuth(req).userId!;
}

const authenticated: RequestHandler = (req, res, next) => {
  if (!getAuth(req).userId) return void res.status(401).json({ error: "يلزم تسجيل الدخول" });
  next();
};

function roleFor(req: Request): Role {
  const id = userId(req);
  if (!roles.size) roles.set(id, "admin");
  return roles.get(id) ?? "beneficiary";
}

const adminOnly: RequestHandler = (req, res, next) => {
  if (roleFor(req) !== "admin") return void res.status(403).json({ error: "هذه العملية مخصصة للإدارة" });
  next();
};

router.use(authenticated);

router.get("/access/me", (req, res) => {
  const role = roleFor(req);
  const permissions = role === "admin"
    ? ["manage_users", "approve_beneficiaries", "manage_partners", "manage_inventory", "manage_supply", "approve_alternatives", "view_reports"]
    : role === "pharmacist"
      ? ["manage_inventory", "approve_alternatives", "view_reports"]
      : role === "supply_manager"
        ? ["manage_supply", "view_reports"]
        : ["view_inventory"];
  res.json({ userId: userId(req), role, permissions });
});

router.get("/beneficiary-applications", (req, res) => {
  const role = roleFor(req);
  res.json(role === "admin" ? applications : applications.filter((item) => item.userId === userId(req)));
});

router.post("/beneficiary-applications", (req, res) => {
  const existing = applications.find((item) => item.userId === userId(req) && item.status === "pending");
  if (existing) return void res.status(409).json({ error: "لديك طلب قيد المراجعة بالفعل" });
  const created = { id: Math.max(...applications.map((item) => item.id), 0) + 1, userId: userId(req), ...req.body, status: "pending" as Decision, submittedAt: new Date().toISOString(), reviewedAt: "", reviewerNote: "" };
  applications.unshift(created);
  res.status(201).json(created);
});

router.patch("/beneficiary-applications/:id/decision", adminOnly, (req, res) => {
  const application = applications.find((item) => item.id === Number(req.params.id));
  if (!application) return void res.status(404).json({ error: "الطلب غير موجود" });
  application.status = req.body.decision;
  application.reviewerNote = req.body.reviewerNote ?? "";
  application.reviewedAt = new Date().toISOString();
  if (req.body.decision === "approved") roles.set(application.userId, req.body.assignedRole ?? application.requestedRole);
  res.json(application);
});

router.get("/partners", (_req, res) => res.json(partners));

router.post("/partners", adminOnly, (req, res) => {
  const created = { id: Math.max(...partners.map((item) => item.id), 0) + 1, ...req.body, status: "onboarding", medicinesCount: 0, joinedAt: new Date().toISOString().slice(0, 10) };
  partners.unshift(created);
  res.status(201).json(created);
});

router.patch("/partners/:id", adminOnly, (req, res) => {
  const partner = partners.find((item) => item.id === Number(req.params.id));
  if (!partner) return void res.status(404).json({ error: "الجهة غير موجودة" });
  Object.assign(partner, req.body);
  res.json(partner);
});

router.delete("/partners/:id", adminOnly, (req, res) => {
  const index = partners.findIndex((item) => item.id === Number(req.params.id));
  if (index < 0) return void res.status(404).json({ error: "الجهة غير موجودة" });
  partners.splice(index, 1);
  res.status(204).send();
});

export default router;