import Router from 'express'
import { notifiyEndTime } from '../controllers/notification.controller.js'

const notificationRouter = Router()

notificationRouter.route('/notify-end-time').get(notifiyEndTime)

export default notificationRouter