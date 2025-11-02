import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/authRoutes.js'
import leaveRoutes from './routes/leaveRoutes.js'
const app = express();

app.use(
  cors({
    origin: "https://leave-ms-gamma.vercel.app", 
    credentials: true,              
  })
);

app.use(express.json({limit: "16kb"}))

app.use(express.urlencoded({extended: true, limit: "16kb"}))

app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/leaves', leaveRoutes)







export default app