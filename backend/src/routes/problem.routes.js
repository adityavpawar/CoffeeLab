import express from 'express';
import authRoutes from './auth.routes.js';
import { authMiddleware, checkAdmin } from '../middleware/auth.middleware.js';
import { createProblem, deleteProblem, getAllProblems, getAllProblemsSolvedByUser, getProblemById, updateproblem } from '../controllers/problem.controller.js';

const problemRoutes = express.Router();

problemRoutes.post("/create-problem" , authRoutes, checkAdmin, createProblem)

problemRoutes.get("/get-all-problems", authMiddleware, getAllProblems);

problemRoutes.get("/get-problem/:id", authMiddleware, getProblemById);

problemRoutes.put("/update-problem/:id", authMiddleware, checkAdmin, updateproblem)

problemRoutes.delete("/delete-problem/:id", authMiddleware, checkAdmin, deleteProblem)

problemRoutes.get("/get-solved-problems", authMiddleware, getAllProblemsSolvedByUser);

export default problemRoutes;