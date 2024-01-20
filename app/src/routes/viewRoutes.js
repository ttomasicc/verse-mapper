import express from 'express'
import * as viewController from '../controllers/viewController.js'
import * as authController from '../controllers/authController.js'

const router = express.Router()

router.use(authController.isLoggedIn)

router.get('/', viewController.getOverview)
router.get('/login', viewController.getLoginForm)
router.get('/signup', viewController.getSignupForm)

router.get('/home', authController.authenticate, viewController.getHome)
router.get('/favorites', authController.authenticate, viewController.getFavorites)
router.get('/statistics', authController.authenticate, viewController.getStats)

export default router
