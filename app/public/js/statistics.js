let currentLocationMarker = null
let currentRadiusMarker = null

document.addEventListener('DOMContentLoaded', async () => {
	const inRadius = document.getElementById('inRadius')
	const btnNearby = document.getElementById('btnNearby')

	const { topLocations } = await getStats()
	setCountryStats(topLocations)

	inRadius.addEventListener('input', () => {
		inRadius.parentElement.querySelector('strong').innerText = inRadius.value
	})

	btnNearby.addEventListener('click', () => {
		clearMarkers()
		clearRadius()
		btnNearby.setAttribute('aria-busy', 'true')

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				async (position) => {
					const coordinates = [position.coords.latitude, position.coords.longitude]
					drawRadius(coordinates)
					const { nearbyLocations } = await getStats(`lat=${ coordinates[0] }&lng=${ coordinates[1] }&r=${ inRadius.value }`)
					if (nearbyLocations && nearbyLocations.length) {
						displayLocations(nearbyLocations)
					} else {
						alert('No nearby locations found.')
					}
				},
				() => alert('For the best experience, please allow geolocation.'),
				{ enableHighAccuracy: true }
			)
		} else {
			alert('Geolocation is not supported by this browser.')
		}

		btnNearby.removeAttribute('aria-busy')
	})
})

const drawRadius = (coordinates) => {
	const inRadius = document.getElementById('inRadius')

	currentLocationMarker = createMarker({ coordinates, popup: 'Your location' })
	currentRadiusMarker = L.circle(coordinates, {
		radius: inRadius.value * 1000,
		color: '#00ffff',
		opacity: 0.7
	}).addTo(map)

	fitCircle(currentRadiusMarker)
}

const displayLocations = (locations) => {
	locations.map((location) => createMarker({
		coordinates: location.geo.coordinates.reverse(),
		popup: location.name
	}))
}

const getStats = async (q) => {
	const url = '/api/v1/users/current/stats'
	const call = await fetch(q ? `${ url }?${ q }` : url, {
		method: 'GET',
		headers: defaultHeaders
	})

	const res = await call.json()

	if (res.status === 'success') {
		return res.data.stats
	} else {
		console.error(`[ ERROR ${ new Date() } ] - ${ res.message }`)
	}
}

const clearRadius = () => {
	if (currentRadiusMarker) {
		map.removeLayer(currentRadiusMarker)
	}
}

const setCountryStats = (locations) => {
	const countries = locations.map((l) => l.country)
	const occurrences = locations.map((l) => l.count)

	new Chart(document.getElementById('chartCountry').getContext('2d'), {
		type: 'bar',
		data: {
			labels: countries,
			datasets: [{
				label: 'Count',
				data: occurrences
			}]
		}
	})
}
