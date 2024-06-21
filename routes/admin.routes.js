import express from 'express'
import AdminController from '../controllers/admin.controller.js'
const router=express.Router()
router.post('/login',AdminController.login)
export default router;