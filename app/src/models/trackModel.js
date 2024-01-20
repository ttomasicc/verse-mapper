import { Schema, Types, model } from 'mongoose'
import { albumSchema } from './schemas/albumSchema.js'
import { lyricsSchema } from './schemas/lyricsSchema.js'

const trackSchema = new Schema({
	isrc: {
		type: String,
		unique: true,
		trim: true,
		required: [true, 'Track ISRC is required.']
	},
	name: {
		type: String,
		trim: true,
		required: [true, 'Track name is required.']
	},
	href: String,
	preview: String,
	album: {
		type: albumSchema,
		required: [true, 'A track must belong to an album.']
	},
	artists: {
		type: [{
			type: Types.ObjectId,
			ref: 'Artist'
		}],
		required: [true, 'A track must have at least one artist.']
	},
	lyrics: lyricsSchema
})

trackSchema.pre(/^find/, function (next) {
	this
		.select('-__v')
		.populate({
			path: 'artists',
			select: '-__v'
		})
		.populate({
			path: 'lyrics.locations',
			select: '-__v'
		})

	next()
})

export default model('Track', trackSchema)
