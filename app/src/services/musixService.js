import { catchAsync } from '../utils/catchAsync.js'
import { AppError } from '../errors/appError.js'
import * as geocodingService from './geocodingService.js'

export const getLyricsByISRC = catchAsync(async (req, res, next) => {
	const { isrc } = req.params

	const { message: { body: { track } } } = await getTrack(isrc)

	if (!track) return next(new AppError('Track not found.', 404))

	const { track_id: musixTrackId, has_lyrics: hasLyrics } = track

	if (!hasLyrics) return next(new AppError('Lyrics not found.', 404))

	const lyrics = await getLyricsByMusixId(musixTrackId)
	if (lyrics) lyrics.locations = await geocodingService.geocodeLyrics(lyrics.text)

	return res.json({
		status: 'success',
		data: { lyrics }
	})
})

export const getTrack = async (isrc) => {
	if (!isrc) return null

	const call = await fetch(appendApiKey(`${ process.env.MUSIX_BASE_URL }/track.get?track_isrc=${ isrc }`))
	const res = await call.json()

	if (!call.ok) {
		console.info(`[ INFO ] ${ new Date() } - track not found:`, res)
		return null
	}

	return res
}

export const getLyricsByMusixId = async (musixTrackId) => {
	const call = await fetch(appendApiKey(`${ process.env.MUSIX_BASE_URL }/track.lyrics.get?track_id=${ musixTrackId }`))
	const res = await call.json()

	if (!call.ok) {
		console.info(`[ INFO ] ${ new Date() } - lyrics not found:`, res)
		return null
	}

	const lyrics = res.message.body.lyrics
	return {
		lang: lyrics.lyrics_language,
		text: lyrics.lyrics_body,
		updated: lyrics.updated_time,
		copy: lyrics.lyrics_copyright
	}
}

const appendApiKey = (url) => `${ url }&apikey=${ process.env.MUSIX_API_KEY }`
