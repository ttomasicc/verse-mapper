const map = L.map('map', {
	maxZoom: 15,
	zoomControl: false
}).setView([46.30768920228406, 16.338049033628586], 10)

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '&copy <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map)

let mapBounds = L.latLngBounds()

const createMarker = ({ coordinates, popup }) => {
	const marker = L.marker(coordinates).addTo(map)
	if (popup) marker.bindPopup(popup)
	mapBounds.extend(coordinates)
	marker._icon.removeAttribute('role')
	return marker
}

const clearMarkers = () => {
	mapBounds = L.latLngBounds()
	map.eachLayer((layer) => {
		if (layer instanceof L.Marker) {
			layer.remove()
		}
	})
}

const fitMarkers = (markers) => {
	if (!Array.isArray(markers) || !markers.length) return
	setTimeout(() => {
		map.invalidateSize()
		map.fitBounds(mapBounds, {
			padding: [10, 10]
		})
	}, 0)
}

const fitCircle = (circle) => {
	if (!circle) return

	setTimeout(() => {
		map.invalidateSize()
		map.fitBounds(circle.getBounds(), {
			padding: [10, 10]
		})
	}, 0)
}
