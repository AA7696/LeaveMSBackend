import express from 'express';
import { applyLeave, updateLeaveStatus, getAllLeaves, getUserLeaves, getLeaveBalance, deleteLeave  } from '../controllers/leaveController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const router = express.Router();


// Leave routes for applying, viewing, approving, and rejecting leaves
// What this file does:
// 1. Sets up an Express router to handle leave-related routes.
// 2. Defines a POST route for applying for leave that is protected by the authMiddleware and calls the applyLeave controller.
// 3. Defines a GET route for fetching leave applications that is protected by the authMiddleware and calls the getLeaves controller.
// 4. Defines a PATCH route for approving leave applications that is protected by the authMiddleware and calls the approveLeave controller.
// 5. Defines a PATCH route for rejecting leave applications that is protected by the authMiddleware and calls the rejectLeave controller.


router.post('/apply', authMiddleware, applyLeave);
router.get('/user', authMiddleware, getUserLeaves);
router.get('/balance', authMiddleware, getLeaveBalance);
router.get('/', authMiddleware, getAllLeaves);
router.patch('/:id/approve', authMiddleware, updateLeaveStatus);
router.patch('/:id/reject', authMiddleware, updateLeaveStatus);
router.delete('/:id', authMiddleware, deleteLeave);

export default router;

