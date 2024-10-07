import { Router } from "express"
import { logginUser, registerUser,logoutUser } from "../controllers/user.controllers.js"
import { upload } from "../middleware/multer.middleware.js"
import { verifyJWT } from "../middleware/auth.middleware.js"

const router = Router()

router.route("/register").post(upload.fields(
    [{ name: "avtar", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]), registerUser)

router.route("/login").post(logginUser)

router.route("/logout").post(verifyJWT,logoutUser)

export default router;