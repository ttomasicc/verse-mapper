import ms from 'ms'
import UserModel from '../models/userModel.js'
import { catchAsync } from '../utils/catchAsync.js'
import { signJwt, verifyJwt } from '../utils/jwtHelper.js'
import { AppError } from '../errors/appError.js'

const createSendJwt = async (user, req, res, statusCode = 200) => {
	const token = await signJwt(user)

	res.cookie('jwt', token, {
		expires: new Date(Date.now() + ms(process.env.JWT_TIMEOUT)),
		secure: req.secure,
		httpOnly: true
	})

	user.password = undefined

	res.status(statusCode).json({
		status: 'success',
		token,
		data: { user }
	})
}

export const signUp = catchAsync(async (req, res) => {
	const { name, email, password } = req.body

	const user = await UserModel.create({ name, email, password })

	await createSendJwt(user, req, res, 201)
})

export const login = catchAsync(async (req, res, next) => {
	const { email, password } = req.body

	if (!email || !password) {
		return next(new AppError('Please provide email and password.'))
	}

	const user = await UserModel.findOne({ email }).select('+password')

	if (!user || !(await user.checkPassword(password))) {
		return next(new AppError(`Incorrect email or password.`, 401))
	}

	await createSendJwt(user, req, res)
})

export const logout = (req, res) => {
	res.clearCookie('jwt')
	res.status(200).json({
		status: 'success',
		data: null
	})
}

export const authenticate = catchAsync(async (req, res, next) => {
	const { authorization } = req.headers

	if (authorization && authorization.startsWith('Bearer')) {
		const token = authorization.split(' ')[1]

		if (token) {
			return await authenticateToken(token, req, res, next)
		}
	} else if (req.cookies.jwt) {
		return await authenticateToken(req.cookies.jwt, req, res, next)
	}

	next(new AppError('Unauthorized access.', 401))
})

export const isLoggedIn = catchAsync(async (req, res, next) => {
	const token = req.cookies.jwt

	if (token) {
		try {
			const decoded = await verifyJwt(token)
			res.locals.user = await UserModel.findById(decoded.id)
		} catch (_) {
		}
	}

	next()
})

const authenticateToken = async (token, req, res, next) => {
	const decoded = await verifyJwt(token)
	const currentUser = await UserModel.findById(decoded.id)

	if (currentUser) {
		req.user = currentUser
		res.locals.user = currentUser
		return next()
	}

	return next(new AppError('The user no longer exists.', 401))
}
