import jwt from 'jsonwebtoken';


// Generate Access Token
export const generateAccessToken = (user) => {
    // Implementation for generating access token
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );

};


// Generate Refresh Token
export const generateRefreshToken = (user) => {
    // Implementation for generating refresh token
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
}
  