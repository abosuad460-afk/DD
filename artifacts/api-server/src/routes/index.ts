import { Router, type IRouter } from "express";
import healthRouter from "./health";
import inventoryRouter from "./inventory";
import administrationRouter from "./administration";

const router: IRouter = Router();

router.use(healthRouter);
router.use(inventoryRouter);
router.use(administrationRouter);

export default router;
