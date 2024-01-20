import { Schema} from 'mongoose'
import { imgSchema } from './imgSchema.js'

export const albumSchema = new Schema({
	name: {
		type: String,
		trim: true,
		required: [true, 'Album name is required.']
	},
	href: String,
	release: Date,
	img: imgSchema
}, {
	_id: false
})
