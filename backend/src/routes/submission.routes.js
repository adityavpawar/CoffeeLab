import express from "express"
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getAllSubmission, getAllTheSubmissionForProblem, getSubmissionForProblem } from "../controllers/submission.controller.js";


const submissionRoutes = express.Router();

 submissionRoutes.get("/get-all-submissions", authMiddleware, getAllSubmission);

 submissionRoutes.get("/get-submission/:problamId", authMiddleware, getSubmissionForProblem)

 submissionRoutes.get("/get-submissions-count/:problamId", authMiddleware, getAllTheSubmissionForProblem)

export default submissionRoutes;