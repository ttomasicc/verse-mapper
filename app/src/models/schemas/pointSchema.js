import { Schema } from 'mongoose'

export const pointSchema = new Schema({
	type: {
		type: String,
		enum: ['Point'],
		default: 'Point'
	},
	coordinates: {
		type: [Number],
		required: [true, 'A point must have x and y coordinates.']
	}
}, {
	_id: false
})
