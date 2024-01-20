import { catchAsync } from '../utils/catchAsync.js'
import { AppError } from '../errors/appError.js'

export const getTrackByISRC = async (isrc) => {
	if (!isrc) return null
	const tokenData = await getAccessToken()

	const query = `${ encodeURIComponent(`isrc:${ isrc }`) }&type=track&offset=0&limit=20`
	const call = await fetch(`${ process.env.SPOTIFY_BASE_URL }/search?q=${ query }`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `${ tokenData.type } ${ tokenData.token }`
		}
	})

	const res = await call.json()

	if (!call.ok) {
		console.error(`[ ERROR ] ${ new Date() }`, res)
		throw new AppError('Error occurred while searching tracks.')
	}

	return processTracksResponse(res.tracks)
		.tracks
		.find((track) => track.isrc === isrc)
}

export const getTracks = catchAsync(async (req, res, next) => {
	const { q: query, url } = req.query

	if (url) {
		return res.json({
			status: 'success',
			data: { tracks: processTracksResponse(await getMoreTracks(url)) }
		})
	}

	if (!query.trim()) {
		return res.json({
			status: 'success',
			data: { tracks: [] }
		})
	}

	return res.json({
		status: 'success',
		data: { tracks: processTracksResponse(await searchTracks(query.trim())) }
	})
})

const getMoreTracks = async (url) => {
	const tokenData = await getAccessToken()

	const call = await fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `${ tokenData.type } ${ tokenData.token }`
		}
	})

	const res = await call.json()

	if (!call.ok) {
		console.error(`[ ERROR ] ${ new Date() }`, res)
		throw new AppError('Error getting tracks.')
	}

	return res.tracks
}

const searchTracks = async (searchQuery) => {
	const tokenData = await getAccessToken()

	const query = `${ encodeURIComponent(searchQuery) }&type=track&offset=0&limit=20`
	const call = await fetch(`${ process.env.SPOTIFY_BASE_URL }/search?q=${ query }`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `${ tokenData.type } ${ tokenData.token }`
		}
	})

	const res = await call.json()

	if (!call.ok) {
		console.error(`[ ERROR ] ${ new Date() }`, res)
		throw new AppError('Error occurred while searching tracks.')
	}

	return res.tracks
}

const processTracksResponse = (tracksResponse) => {
	return {
		previous: tracksResponse.previous,
		next: tracksResponse.next,
		total: tracksResponse.total,
		tracks: tracksResponse.items.map(track => {
			return {
				isrc: track.external_ids.isrc,
				name: track.name,
				href: track.external_urls.spotify,
				preview: track.preview_url,
				artists: track.artists.map(artist => {
					return {
						spotifyId: artist.id,
						name: artist.name,
						href: artist.external_urls.spotify
					}
				}),
				album: {
					href: track.album.external_urls.spotify,
					name: track.album.name,
					release: track.album.release_date,
					img: track.album.images[1]
				}
			}
		})
	}
}

const getAccessToken = async () => {
	const call = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': 'Basic ' + (new Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'))
		},
		body: new URLSearchParams({
			'grant_type': 'client_credentials'
		})
	})

	const res = await call.json()

	if (!call.ok) {
		console.error(`[ ERROR ] ${ new Date() }`, res)
		throw new AppError('Error accessing Spotify API.')
	}

	const { token_type: type, access_token: token } = res
	return { type, token }
}
