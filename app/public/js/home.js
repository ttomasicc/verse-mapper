const searchTab = document.getElementById('searchTab')
const divResults = document.getElementById('results')
const inSearch = document.querySelector('input[type="search"]')
const btnBack = document.getElementById('btnBack')

const lyricsTab = document.getElementById('lyricsTab')
const imgAlbum = document.getElementById('imgAlbum')
const pTrackName = document.getElementById('trackName')
const pTrackAuthors = document.getElementById('trackAuthors')
const divLyrics = document.getElementById('lyrics')
const pNmofLocations = document.getElementById('nmofLocations')
const btnFavorite = document.getElementById('btnFavorite')

let searchTimeout = null

inSearch.addEventListener('keypress', () => {
	clearTimeout(searchTimeout);
	searchTimeout = setTimeout(async () => {
		divResults.innerText = ''
		divResults.setAttribute('aria-busy', 'true')

		const { tracks: tracksResponse } = await searchTracks(inSearch.value)
		if (tracksResponse.total) {
			divResults.innerHTML = createTrackGrid(tracksResponse.tracks, 2)
			setTrackBtnListeners()
		} else {
			divResults.innerHTML = '<p style="margin: 40px 0;">No tracks found. 😔</p>'
		}

		divResults.removeAttribute('aria-busy')
	}, 600)
})

btnBack.addEventListener('click', (e) => {
	e.preventDefault()
	searchTab.style.display = 'unset'
	lyricsTab.style.display = 'none'
})

const setTrackBtnListeners = () => {
	document.querySelectorAll('footer button[type="button"]').forEach((btnDetails) =>
		btnDetails.addEventListener('click', async (e) => {
			e.preventDefault()
			btnDetails.setAttribute('aria-busy', 'true')

			await showLyricsTab(JSON.parse(base64ToString(btnDetails.dataset.track)))

			btnDetails.removeAttribute('aria-busy')
		})
	)
}

const showLyricsTab = async (track) => {
	clearMarkers()
	await createLyricsTab(track)

	searchTab.style.display = 'none'
	lyricsTab.style.display = 'unset'
}

const createLyricsTab = async (track) => {
	track.lyrics = await getLyricsByISRC(track.isrc)

	populateLyricsTab(track)
}

const populateLyricsTab = (track) => {
	imgAlbum.src = `${ track.album.img ? track.album.img.url : '/img/music-note.webp' }`
	pTrackName.innerHTML = `<a href="${ track.href }" target="_blank">${ track.name }</a>`
	pTrackAuthors.innerHTML = track.artists.map((a, inx, arr) => `<a href="${ a.href }" target="_blank">${ a.name }${ arr.length === inx + 1 ? '' : ', ' }</a>`).join('')

	if (track.lyrics) {
		const taggedLyrics = track.lyrics.locations.reduce((l, loc) => l.replaceAll(new RegExp(`\\b${loc.lyrics}\\b`, 'gi'), `<mark>${ loc.lyrics }</mark>`), track.lyrics.text)
		divLyrics.innerHTML = taggedLyrics
			.split('\n\n')
			.map((p) => `<p>${ p.replaceAll('\n', '<br>') }</p>`)
			.join('') + `<small>${ track.lyrics.copy }</small>`

		pNmofLocations.innerText = `${ track.lyrics.locations.length }`
		const markers = track.lyrics.locations.map((location) => createMarker({
			coordinates: [location.lat, location.lng],
			popup: location.name
		}))
		fitMarkers(markers)
	} else {
		divLyrics.innerText = 'Lyrics not found.'
		pNmofLocations.innerText = '0'
	}

	setFavoriteButton(track.isrc)
}

const setFavoriteButton = (isrc) => {
	btnFavorite.removeAttribute('disabled')
	btnFavorite.onclick = async () => {
		btnFavorite.setAttribute('aria-busy', 'true')

		try {
			const call = await fetch('/api/v1/users/current/tracks', {
				method: 'POST',
				headers: defaultHeaders,
				body: JSON.stringify({ isrc })
			})
			const res = await call.json()

			if (res.status === 'success') {
				alert('Track successfully added to favorites!')
			} else {
				alert(res.message)
			}

			btnFavorite.setAttribute('disabled', 'true')
		} catch (err) {
			console.error(`[ ERROR ] ${ new Date() } - ${ err }`)
		}

		btnFavorite.removeAttribute('aria-busy')
	}
}

const getLyricsByISRC = async (isrc) => {
	if (!isrc) return null

	try {
		const call = await fetch(`/api/v1/lyrics/${ isrc }`, {
			method: 'GET',
			headers: defaultHeaders
		})
		const res = await call.json()

		if (res.status === 'success') {
			return res.data.lyrics
		} else {
			return null
		}
	} catch (err) {
		console.error(`[ ERROR ] ${ new Date() } - failed to get track lyrics:`, err)
	}

	return null
}

const searchTracks = async (query) => {
	try {
		const call = await fetch(`/api/v1/tracks/search?q=${ encodeURIComponent(query) }`, {
			method: 'GET',
			headers: defaultHeaders
		})
		const res = await call.json()

		if (res.status === 'success') {
			return res.data
		} else {
			return []
		}
	} catch (err) {
		console.error(`[ ERROR ] ${ new Date() } - failed to search tracks:`, err)
	}

	return []
}
