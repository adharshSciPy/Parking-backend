// import { authMiddleware } from '../middleware/auth.middleware.js'
// bookingRouter.route('/create-booking/:userId').post(authMiddleware, createBooking)

import Router from 'express'
import { createBooking, cancelBooking, extendBooking, updateBooking, getAllBookingsByUser, getAllUsersBooking } from '../controllers/booking.controller.js'

const bookingRouter = Router()

bookingRouter.route('/create-booking/:floorId/:slotId/:userId').post(createBooking)
bookingRouter.route('/cancel-booking/:floorId/:slotId').put(cancelBooking)
bookingRouter.route('/extend-booking/:floorId/:slotId').put(extendBooking)
bookingRouter.route('/update-booking/:floorId/:slotId').put(updateBooking)
bookingRouter.route('/get-bookings-byuser/:userId').get(getAllBookingsByUser)
bookingRouter.route('/get-allbookings').get(getAllUsersBooking)

export default bookingRouter