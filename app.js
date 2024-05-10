import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import userRoute from './src/routers/user.routes.js'
import bookingRouter from './src/routers/booking.routes.js';
import floorRouter from './src/routers/floor.routes.js';
import { pushNotification, updateSlots } from './src/utils/slot.utils.js';

const app = express();

app.use(cors())
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (client) => {
    console.log('Client connected', client.id)

    const interval = setInterval(async () => {
        // clear slot
        const updatedSlots = await updateSlots()
        const notification = await pushNotification()
        client.emit('notification', { message: notification })
        client.emit('clear-slot', { floorDetails: updatedSlots })
    }, 5000)

    client.on('disconnect', () => {
        clearInterval(interval)
    })
})


app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: true, limit: '16kb' }))
app.use(cookieParser())

app.use('/api/v1/user', userRoute)
app.use('/api/v1/floor', floorRouter)
app.use('/api/v1/booking', bookingRouter)

export { server }