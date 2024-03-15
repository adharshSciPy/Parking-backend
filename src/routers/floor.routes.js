import Router from 'express'
import { createFloorAndSlot, updateFloorAndSlot,  getFloorSlotDesign, deleteFloor, deleteSlot } from '../controllers/floor.controller.js'

const floorRouter = Router()

floorRouter.route('/create-floor-design').post(createFloorAndSlot)
floorRouter.route('/update-floor-design').put(updateFloorAndSlot)
floorRouter.route('/get-floor-design').get(getFloorSlotDesign)
floorRouter.route('/delete-slot/:slotId/:floorId').delete(deleteSlot)
floorRouter.route('/delete-floor/:floorId').delete(deleteFloor)

export default floorRouter