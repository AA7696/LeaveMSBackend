import express from "express";
import { registerUser, loginUser, refreshToken, logoutUser, getUserProfile } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const router = express.Router();
// Auth routes for user registration, login, token refresh, and logout
// What this file does:
// 1. Sets up an Express router to handle authentication-related routes.
// 2. Defines a POST route for user registration that calls the registerUser controller.
// 3. Defines a POST route for user login that calls the loginUser controller.
// 4. Defines a POST route for refreshing tokens that calls the refreshToken controller.
// 5. Defines a POST route for user logout that is protected by the authMiddleware and calls the logoutUser controller.
// 6. Exports the router for use in the main application.
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh-token', refreshToken);
router.post('/logout', authMiddleware, logoutUser);
router.get('/profile', authMiddleware, getUserProfile);


export default router;
