import Router from 'express'
import { notifyEndTime } from '../controllers/notification.controller.js'

const notificationRouter = Router()

notificationRouter.route('/notify-end-time').get(notifyEndTime)

export default notificationRouter