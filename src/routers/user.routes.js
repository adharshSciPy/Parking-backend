import Router from 'express';
import { userRegister, userLogin, tokenVerification, userLogout, updateUser, getAllUsers, deleteUser } from '../controllers/user.controller.js';

const userRouter = Router()

userRouter.route('/register').post(userRegister)
userRouter.route('/login').post(userLogin)
userRouter.route('/verify').post(tokenVerification)
userRouter.route('/logout').post(userLogout)
userRouter.route('/update-user/:userId').put(updateUser)
userRouter.route('/get-all-users').get(getAllUsers)
userRouter.route('/delete-user/:userId').delete(deleteUser)

export default userRouter