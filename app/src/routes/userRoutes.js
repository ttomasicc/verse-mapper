import express from 'express'
import * as userController from '../controllers/userController.js'
import * as authController from '../controllers/authController.js'
import * as trackController from '../controllers/trackController.js'
import * as statsController from '../controllers/statsController.js'

const router = express.Router()

router.post('/signup', authController.signUp)
router.post('/login', authController.login)
router.get('/logout', authController.logout)

// restricts to authenticated users
router.use(authController.authenticate)

router.get('/current', userController.getUser)
router.get('/current/tracks', trackController.getTracks)
router.post('/current/tracks', trackController.postTrack)
router.get('/current/stats', statsController.getCurrentStats)

export default router
