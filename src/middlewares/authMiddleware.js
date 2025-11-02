import jwt from "jsonwebtoken";
import { ApiErrors } from "../utils/apiErrors.js";

// Auth middleware to verify access tokens
// What this function does:
// 1. Extracts the token from the Authorization header of the request.
// 2. If the token is missing or does not start with 'Bearer ', it throws an unauthorized error.
// 3. Verifies the token using the ACCESS_TOKEN_SECRET.
// 4. If the token is valid, it attaches the decoded user information to the request object and calls next() to proceed.
// 5. If the token is invalid or expired, it throws an unauthorized error.
// 6. This middleware can be used to protect routes that require authentication.

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiErrors(401, 'Unauthorized');
        
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        throw new ApiErrors(401, 'Invalid or expired token');
    }
};