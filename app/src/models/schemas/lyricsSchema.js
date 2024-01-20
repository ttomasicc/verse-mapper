import { Schema, Types } from 'mongoose'

export const lyricsSchema = new Schema({
	text: {
		type: String,
		trim: true,
		required: [true, 'Lyrics cannot be empty.']
	},
	updated: Date,
	copy: {
		type: String,
		trim: true,
		required: [true, 'Lyrics must be copyrighted.']
	},
	locations: [{
		type: Types.ObjectId,
		ref: 'Location'
	}]
}, {
	_id: false
})
