import { Schema } from 'mongoose'

export const imgSchema = new Schema({
	url: String,
	width: Number,
	height: Number
}, {
	_id: false
})
