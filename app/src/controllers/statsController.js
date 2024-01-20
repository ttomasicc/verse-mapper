import { catchAsync } from '../utils/catchAsync.js'
import TrackModel from '../models/trackModel.js'

export const getCurrentStats = catchAsync(async (req, res, next) => {
	const stats = {}

	stats.topLocations = await TrackModel.aggregate([
		{
			$match: {
				_id: { $in: req.user.favoriteTracks },
				lyrics: { $ne: null }
			}
		},
		{ $unwind: '$lyrics.locations' },
		{
			$lookup: {
				from: 'locations',
				localField: 'lyrics.locations',
				foreignField: '_id',
				as: 'lyrics.locations'
			}
		},
		{
			$group: {
				_id: { $arrayElemAt: ['$lyrics.locations.country', 0] },
				count: { $sum: 1 },
				places: { $push: { $arrayElemAt: ['$lyrics.locations.name', 0] } }
			}
		},
		{
			$project: {
				_id: 0,
				country: '$_id',
				count: 1,
				places: 1
			}
		},
		{
			$sort: {
				count: -1
			}
		}
	])

	const { lat, lng, r } = req.query
	const earthRadius = 6378
	const radius = r / earthRadius

	if (lat && lng && r) {
		stats.nearbyLocations = await TrackModel.aggregate([
			{
				$match: {
					_id: { $in: req.user.favoriteTracks },
					lyrics: { $ne: null }
				}
			},
			{ $unwind: '$lyrics.locations' },
			{
				$lookup: {
					from: 'locations',
					localField: 'lyrics.locations',
					foreignField: '_id',
					as: 'lyrics.locations'
				}
			},
			{
				$addFields: {
					firstLocation: { $arrayElemAt: ['$lyrics.locations', 0] }
				}
			},
			{
				$group: {
					_id: '$firstLocation.geo.coordinates',
					location: { $first: '$firstLocation' }
				}
			},
			{ $replaceRoot: { newRoot: '$location' } },
			{
				$match: {
					geo: { $geoWithin: { $centerSphere: [[parseFloat(lng), parseFloat(lat)], radius] } }
				}
			}
		])
	}

	res.status(200).json({
		status: 'success',
		data: { stats }
	})
})
