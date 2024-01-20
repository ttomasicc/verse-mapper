import { Schema, model } from 'mongoose'

const artistSchema = new Schema({
	spotifyId: {
		type: String,
		required: [true, 'Artist SpotifyID is required.'],
		unique: true
	},
	name: {
		type: String,
		trim: true,
		required: [true, 'Artist name is required.']
	}
}, {
	toJSON: { virtuals: true },
	toObject: { virtuals: true }
})

artistSchema.virtual('href').get(function () {
	return `https://open.spotify.com/artist/${ this.spotifyId }`
})

export default model('Artist', artistSchema)
