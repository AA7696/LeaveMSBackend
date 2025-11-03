import Leave from "../models/leaveModel.js";
import { ApiErrors } from "../utils/apiErrors.js";
import { ApiResponse } from "../utils/apiResponse.js";
import LeaveBalance from "../models/leaveBalanceModel.js";


// Leave application controller
// What this function does:
// 1. Extracts user ID from the authenticated request object and leave details from the request body.
// 2. Creates a new leave application in the database associated with the user.
// 3. Sends a success response with the created leave application details.
// 4. Catches and handles any errors that occur during the process.

export const applyLeave = async (req, res) => {
    try {
        const { userId, type, startDate, endDate, reason } = req.body;


        // Create leave application
        const leave = await Leave.create({
            user: userId,
            type,
            startDate,
            endDate,
            reason,
            status: 'pending'
        });



        res.status(201).json(new ApiResponse(201, leave, "Leave application submitted successfully"));
    } catch (error) {
        throw new ApiErrors(500, error.message);
    }
};

// Leave status update controller
// What this function does:
// Extracts leave ID from the request parameters and new status from the request body.
// Also update leave balance if it is Accepted by admin
export const updateLeaveStatus = async (req, res) => {
    try {
        const leaveId = req.params.id;
        let status;

        // Determine status from route path
        if (req.path.endsWith('/approve')) {
            status = 'approved';
        } else if (req.path.endsWith('/reject')) {
            status = 'rejected';
        } else {
            throw new ApiErrors(400, "Invalid status route");
        }

        const leave = await Leave.findById(leaveId);
        if (!leave) {
            throw new ApiErrors(404, "Leave application not found");
        }

        const previousStatus = leave.status;
        leave.status = status;

        if (status === 'approved' && previousStatus !== 'approved') {
            // calculate no if days of leave
            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);
            const msInDay = 24 * 60 * 60 * 1000;
            const diffDays = Math.ceil((end - start) / msInDay) + 1;

            if (leave.type !== 'unpaid') {
                const leaveBalance = await LeaveBalance.findOne({ user: leave.user });
                if (!leaveBalance) {
                    throw new ApiErrors(404, "Leave balance record not found for user");
                }

                const availableLeaves = leaveBalance.balances[leave.type] || 0;
                if (availableLeaves < diffDays) {
                    throw new ApiErrors(400, `Insufficient ${leave.type} leave balance`);
                }

                // Deduct the leave days from available balance
                leaveBalance.balances[leave.type] -= diffDays;
                await leaveBalance.save();
            }
        }

        await leave.save();
        res.status(200).json(new ApiResponse(200, leave, "Leave status updated successfully"));
    } catch (error) {
        throw new ApiErrors(500, error.message);
    }
}

// Get leave applications for a user controller
// What this function does:
// 1. Extracts user ID from the authenticated request object.
export const getUserLeaves = async (req, res) => {
    try {
        const userId = req.user.id;
        const leaves = await Leave.find({ user: userId });
        res.status(200).json(new ApiResponse(200, leaves, "User leave applications fetched successfully"));
    } catch (error) {
        throw new ApiErrors(500, error.message);
    }
}


// Get all leave applications controller
// What this function does:
// 1. Fetches all leave applications from the database.
export const getAllLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find().populate('user', 'name email');
        res.status(200).json(new ApiResponse(200, leaves, "All leave applications fetched successfully"));
    } catch (error) {
        throw new ApiErrors(500, error.message);
    }
}

// Fitch  The leave Balance
// So that you get available balance of leaves

export const getLeaveBalance = async (req, res) => {
    console.log("Fetching leave balance for user:", req.user.id);
    try {
        const balance = await LeaveBalance.findOne({ user: req.user.id });
        if (!balance)
            return res.status(404).json({ success: false, message: "Balance not found" });
        res.status(200).json({ success: true, data: balance.balances });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete The Particular leave with leave id and user id

export const deleteLeave = async (req, res) => {
    try {
        const leaveId = req.params.id;
        const userId = req.user.id; // from auth middleware

        //  Find the leave
        const leave = await Leave.findById(leaveId);
        if (!leave) throw new ApiErrors(404, "Leave not found");

        // 2Ensure that only the owner can delete their leave
        if (leave.user.toString() !== userId)
            throw new ApiErrors(403, "Unauthorized to delete this leave");


        // 5 Delete the leave record
        await Leave.findByIdAndDelete(leaveId);

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Leave deleted and balance updated"));
    } catch (error) {
        console.error("Error deleting leave:", error);
        throw new ApiErrors(500, error.message || "Server error while deleting leave");
    }
};