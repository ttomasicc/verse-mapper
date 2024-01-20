import express from 'express'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import morgan from 'morgan'
import * as path from 'path'
import { fileURLToPath } from 'url'
import ms from 'ms'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import compression from 'compression'

import viewRouter from './routes/viewRoutes.js'
import userRouter from './routes/userRoutes.js'
import * as spotifyService from './services/spotifyService.js'
import * as musixService from './services/musixService.js'

import { AppError } from './errors/appError.js'
import errorHandler from './errors/errorHandler.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()

// sets pug as the view engine
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, '..', 'public')))
app.use('/css', express.static(path.join(__dirname, '..', 'node_modules', '@picocss', 'pico', 'css'), {
	setHeaders: (res, path) => {
		if (path.endsWith('.css')) {
			res.setHeader('Content-Type', 'text/css');
		}
	},
}))
app.use('/icons', express.static(path.join(__dirname, '..', 'node_modules', 'bootstrap-icons', 'font'), {
	setHeaders: (res, path) => {
		if (path.endsWith('.css')) {
			res.setHeader('Content-Type', 'text/css');
		}
	},
}))

// sets secure HTTP response headers
app.use(helmet({
	contentSecurityPolicy: {
		directives: {
			...helmet.contentSecurityPolicy.getDefaultDirectives(),
			'script-src': ['\'self\'', 'https://unpkg.com/'],
			'img-src': ['\'self\'', 'blob:', 'data:', 'https:'],
			'frame-src': ['\'self\'']
		}
	}
}))

// sets API request limit
app.use('/api', rateLimit({
	max: process.env.REQUESTS_LIMIT,
	windowMs: ms(process.env.REQUESTS_LIMIT_WINDOW),
	message: `Too many requests, please try again in ${ms(ms(process.env.REQUESTS_LIMIT_WINDOW), { long: true })}`,
	validate: {
		ip: false
	}
}))

// parses request body
app.use(express.json({ limit: '10kb' }))

// parses cookies
app.use(cookieParser())

// sanitizes data against nosql query injection
app.use(mongoSanitize())

if (process.env.NODE_ENV === 'dev') {
	// adds HTTP request logger
	app.use(morgan('dev'))
}

// compresses text outputs
app.use(compression())

// adds view rendering
app.use('/', viewRouter)

// adds resource routers
app.use('/api/v1/users', userRouter)
app.get('/api/v1/tracks/search', spotifyService.getTracks)
app.get('/api/v1/lyrics/:isrc', musixService.getLyricsByISRC)

// matches unknown paths
app.all('*', (req, res, next) => {
	next(new AppError(`Not found: ${req.originalUrl}.`, 404))
})

// adds global error handler
app.use(errorHandler)

export default app
