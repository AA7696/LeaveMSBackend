import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import { ApiErrors } from "../utils/apiErrors.js";
import { ApiResponse } from "../utils/apiResponse.js";
import LeaveBalance from "../models/leaveBalanceModel.js";

// User registration controller
// What this function does:
// 1. Extracts name, email, password, and role from the request body.
// 2. Checks if a user with the provided email already exists in the database.
// 3. If the user exists, it throws a conflict error.
// 4. If the user does not exist, it creates a new user in the database.
// 5. Generates access and refresh tokens for the newly created user.
// 6. Sets the refresh token in an HTTP-only cookie for security.
// 7. Sends a success response with user details (excluding sensitive information like password).
// 8. Catches and handles any errors that occur during the process.

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });

        if (userExists) {
            throw new ApiErrors(409, "User with email already exists");
        }
        
        const user = await User.create({ name, email, password });

        // Initialize leave balance for the new user
        await LeaveBalance.create({user: user._id});

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Set refresh token in HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None',
            secure: true,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Respond with success message and user details
        res.status(201).json(new ApiResponse(201, { user: user, accessToken: accessToken }, "User registered successfully"));

    } catch (error) {
        console.error('Register Error:', error);
         res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Internal Server Error'
    });
       
    }
};

// User login controller
// What this function does:
// 1. Extracts email and password from the request body. 
// 2. Searches for a user with the provided email in the database.
// 3. If the user is not found or the password does not match, it throws an authentication error.
// 4. If authentication is successful, it generates access and refresh tokens.
// 5. Sets the refresh token in an HTTP-only cookie for security.
// 6. Sends a success response with user details (excluding sensitive information like password).
// 7. Catches and handles any errors that occur during the process.

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        // Validate user credentials
        if (!user || !(await user.matchPassword(password))) {
            throw new ApiErrors(401, "Invalid email or password");
        }

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        // Set refresh token in HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        // Respond with success message and user details
        res.status(200).json(new ApiResponse(200, {  user: user }, "User logged in successfully"));
    } catch (error) {
        throw new ApiErrors(500, error.message);
    }
};

// User logout controller
// What this function does:
// 1. Clears the refresh token cookie from the client's browser.
// 2. Sends a success response indicating that the user has been logged out.
// 3. Catches and handles any errors that occur during the process.
export const logoutUser = async (req, res) => {
    try {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });
        res.status(200).json(new ApiResponse(200, null, "User logged out successfully"));
    } catch (error) {
        throw new ApiErrors(500, error.message);
    }
}

// Token refresh controller
// What this function does:
// 1. Extracts the refresh token from the cookies in the request.
// 2. If the refresh token is missing, it throws an unauthorized error.

export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
             return res.status(401).json({ message: "No refresh token found" });

        }
        // Verify refresh token
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        }
        catch (error) {
           return res.status(401).json({ message: "Invalid or expired refresh token" });
        }
        const user = await User.findById(decoded.id);
        if (!user) {
            throw new ApiErrors(404, 'User not found');
        }
        // Generate new tokens
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        // Set new refresh token in HTTP-only cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        // Respond with new access token
        res.status(200).json(new ApiResponse(200, { accessToken: newAccessToken
        }, "Token refreshed successfully"));
    } catch (error) {
        throw new ApiErrors(500, error.message);
    }
}

// Get current user profile
// What this function does:
// 1. Extracts the user object from req.user (set by middleware).
// 2. Returns user details except the password.

export const getUserProfile = async (req, res) => {
    console.log(req.user);
  try {
    if (!req.user) {
      throw new ApiErrors(401, "Unauthorized");
    }
    // Fetch user details from database'
    console.log(req.user.id);
    
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      throw new ApiErrors(404, "User not found");
    }

      
    res.status(200).json(
      new ApiResponse(200, user, "User profile fetched successfully")

    );
  } catch (error) {
    throw new ApiErrors(500, error.message);
  }
};
