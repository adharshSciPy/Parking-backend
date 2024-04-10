import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import userRoute from './src/routers/user.routes.js'
import bookingRouter from './src/routers/booking.routes.js';
import floorRouter from './src/routers/floor.routes.js';
import notificationRouter from './src/routers/notification.routes.js';

const app = express();

//for production
// app.use(cors({
//     origin: process.env.ALLOW_ORIGIN_1,
//     credentials: true,
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
// }))

app.use(cors())

app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: true, limit: '16kb' }))
app.use(cookieParser())

app.use('/api/v1/user', userRoute)
app.use('/api/v1/floor', floorRouter)
app.use('/api/v1/booking', bookingRouter)
app.use('/api/v1/notification', notificationRouter)

export { app }