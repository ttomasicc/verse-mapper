import { Schema, model, Types } from 'mongoose'
import validator from 'validator'
import { compare, encrypt } from '../utils/bcryptWrapper.js'

const userSchema = new Schema({
	name: {
		type: String,
		trim: true,
		maxLength: [70, 'A name name must be less than 70 characters.'],
		required: [true, 'Please tell us your name.']
	},
	email: {
		type: String,
		unique: [true, 'An account with a given email already exists.'],
		lowercase: true,
		validate: [validator.isEmail, 'A given email ({VALUE}) is not valid.'],
		required: [true, 'Please provide your email.']
	},
	password: {
		type: String,
		minLength: [8, 'A password must have at least 8 characters.'],
		required: [true, 'A password is required.'],
		select: false
	},
	favoriteTracks: [{
		type: Types.ObjectId,
		ref: 'Track'
	}]
})

userSchema.pre('save', async function(next) {
	if (this.isModified('password')) {
		this.password = await encrypt(this.password)
	}
	next()
})

userSchema.methods.checkPassword = async function(password) {
	if (!this.password) {
		return false
	}
	return await compare(password, this.password)
}

export default model('User', userSchema)
