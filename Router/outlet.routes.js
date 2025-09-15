import { Router } from "express";
import { isAuthenticate } from "../Middleware/Auth.js";
import { validateRequest } from "../Middleware/validateMiddleware.js";
import {
  createOutletValidator,
  updateOutletValidator,
} from "../validations/outlet.schema.js";
import {
  createOutlet,
  getOutletConfig,
  getOutletDetails,
  getOutlets,
  updateOutlet,
} from "../controllers/outlet.controller.js";
import { authorize } from "../Middleware/authorize.js";

const router = Router();

router.use(isAuthenticate);

// Fetch all active outlets from the database.
router.get("/", 
  authorize(["SUPER_ADMIN"]),
   getOutlets);

//  Create a new outlet record in the database.
router.post(
  "/",
  authorize("SUPER_ADMIN"),
  createOutletValidator,
  validateRequest,
  createOutlet
);

//Update details of an existing outlet.
router.patch(
  "/:id/update",
  authorize("SUPER_ADMIN"),
  updateOutletValidator,
  validateRequest,
  updateOutlet
);

//Retrieve specific outlet configuration details such as delivery charges,      delivery configuration, operating hours, and GST number. *         Managers can access only their own outlet's config; Super Admins can access any.
router.get("/:id/config", authorize("SUPER_ADMIN"), getOutletConfig);
router.get("/:id/details", authorize("SUPER_ADMIN"), getOutletDetails);

export default router;
