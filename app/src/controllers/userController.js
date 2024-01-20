import { catchAsync } from '../utils/catchAsync.js'
import UserModel from '../models/userModel.js'
import { AppError } from '../errors/appError.js'

export const getUser = catchAsync(async (req, res, next) => {
	const { id } = req.user

	const user = await UserModel.findById(id)

	if (!user) {
		return next(new AppError('User not found.', 404))
	}

	res.status(200).json({
		status: 'success',
		data: { user }
	})
})
