import mongoose from 'mongoose'
import { AppError } from '../errors/appError.js'
import { catchAsync } from '../utils/catchAsync.js'
import * as spotifyService from '../services/spotifyService.js'
import * as geocodingService from '../services/geocodingService.js'
import * as musixService from '../services/musixService.js'
import LocationModel from '../models/locationModel.js'
import ArtistModel from '../models/artistModel.js'
import TrackModel from '../models/trackModel.js'
import UserModel from '../models/userModel.js'

export const getTracks = catchAsync(async (req, res, next) => {
	res.status(200).json({
		status: 'success',
		data: { tracks: await TrackModel.find({ _id: { $in: req.user.favoriteTracks } }) }
	})
})

export const postTrack = catchAsync(async (req, res, next) => {
	const { isrc } = req.body

	const user = await UserModel.findById(req.user.id)
	const track = await TrackModel.findOne({ isrc })

	if (track) {
		if (user.favoriteTracks.includes(track._id)) {
			return next(new AppError('Track is already in favorites.'))
		}
		await UserModel.findOneAndUpdate(
			{ _id: user.id },
			{ $push: { favoriteTracks: track._id } }
		)

		return res.status(201).json({
			status: 'success',
			data: { track }
		})
	}

	const spotifyTrack = await spotifyService.getTrackByISRC(isrc)
	if (!spotifyTrack) {
		return next(new AppError('Track not found.'))
	}

	const { message: { body: { track: musixTrack } } } = await musixService.getTrack(isrc)
	if (!musixTrack) {
		return next(new AppError('Track not found.'))
	}

	const { track_id: musixTrackId, has_lyrics: hasLyrics } = musixTrack
	if (hasLyrics) {
		spotifyTrack.lyrics = await musixService.getLyricsByMusixId(musixTrackId)
		if (spotifyTrack.lyrics) spotifyTrack.lyrics.locations = await geocodingService.geocodeLyrics(spotifyTrack.lyrics.text)
	}

	const newTrack = await TrackModel.findById(await persistTrack(spotifyTrack))

	await UserModel.findOneAndUpdate(
		{ _id: user.id },
		{ $push: { favoriteTracks: newTrack._id } }
	)

	res.status(201).json({
		status: 'success'
	})
})

const persistTrack = async (track) => {
	let trackId = null
	let error = null

	const session = await mongoose.startSession()
	session.startTransaction()

	try {
		await saveArtists(track.artists)
		track.artists = await getArtistsIdsBySpotifyIds(track.artists.map((a) => a.spotifyId))

		if (track.lyrics && track.lyrics.locations.length) {
			await saveLocations(track.lyrics.locations)
			track.lyrics.locations = await getLocationsIdsByLyrics(track.lyrics.locations.map((l) => l.lyrics))
		}

		trackId = await TrackModel.create(track)

		await session.commitTransaction()
	} catch (err) {
		await session.abortTransaction()
		error = err
	}
	await session.endSession()

	if (error) {
		throw error
	}
	return trackId
}

const saveArtists = async (artists) => {
	try {
		await ArtistModel.insertMany(artists, { ordered: false })
	} catch (err) {
		if (err.code !== 11000)
			throw err
	}
}

const getArtistsIdsBySpotifyIds = async (spotifyIds) =>
	(await ArtistModel.find({ spotifyId: { $in: spotifyIds } }, 'id'))
		.map((a) => a.id)

const saveLocations = async (locations) => {
	const locationDocuments = locations.map((l) => ({
		...l,
		geo: {
			type: 'Point',
			coordinates: [l.lng, l.lat]
		}
	}))

	try {
		await LocationModel.insertMany(locationDocuments, { ordered: false })
	} catch (err) {
		if (err.code !== 11000)
			throw err
	}
}

const getLocationsIdsByLyrics = async (lyricsArray) =>
	(await LocationModel.find({ lyrics: { $in: lyricsArray } }, 'id'))
		.map((l) => l.id)
