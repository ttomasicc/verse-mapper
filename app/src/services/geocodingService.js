export const geocodeLyrics = async (lyrics) => {
	const geocodes = await getGeocodes(lyrics)
	const uniqueLocations = new Set()
	return (await Promise.all(geocodes.map(getLocationByAddress)))
		.filter(Boolean)
		.filter(location => {
			const key = `${ location.lat }_${ location.lng }`
			return !uniqueLocations.has(key) && uniqueLocations.add(key)
		})
}

const getGeocodes = async (lyrics) => {
	const call = await fetch(`${ process.env.GEOCODING_BASE_URL }/geocode`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ text: (lyrics).replace('\n', ' ') })
	})

	const res = await call.json()

	if (!call.ok) {
		console.info(`[ INFO ] ${ new Date() } - lyrics analysis failed:`, res)
		return []
	}

	return res.data.geocodes
}

const getLocationByAddress = async (address) => {
	const call = await fetch(appendApiKey(`${ process.env.GEOAPIFY_BASE_URL }/geocode/search?text=${ encodeURIComponent(address) }&format=json`))
	const res = await call.json()

	if (!call.ok) {
		console.info(`[ INFO ] ${ new Date() } - address location not found:`, res)
		return null
	}

	const firstLocation = res.results[0]
	if (!firstLocation || firstLocation.rank.confidence < 0.95) return null

	return {
		lyrics: address,
		name: firstLocation.name ?? firstLocation.formatted,
		country: firstLocation.country,
		lat: firstLocation.lat,
		lng: firstLocation.lon
	}
}

const appendApiKey = (url) => `${ url }&apiKey=${ process.env.GEOAPIFY_API_KEY }`
