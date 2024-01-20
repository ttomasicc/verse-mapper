import {Schema, model} from 'mongoose'
import { pointSchema } from './schemas/pointSchema.js'

const locationSchema = new Schema({
	lyrics: {
		type: String,
		lowercase: true,
		trim: true,
		required: [true, 'Location must be mapped to a lyric.'],
		unique: [true, 'Location lyrics already exist.']
	},
	name: {
		type: String,
		trim: true,
		required: [true, 'Location must be named.']
	},
	country: String,
	geo: {
		type: pointSchema,
		required: [true, 'Location must have coordinates.']
	}
})

export default model('Location', locationSchema)
