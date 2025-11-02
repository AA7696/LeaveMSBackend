import mongoose from "mongoose";
// Leave schema definition
const leaveSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['annual', 'casual', 'sick', 'unpaid'],
        required: true
    },
    startDate: {
        type: Date,
        required: true

    },
    endDate: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,   
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });
// Leave model based on the schema
const Leave = mongoose.model('Leave', leaveSchema);
export default Leave;