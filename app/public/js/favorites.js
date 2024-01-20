document.addEventListener('DOMContentLoaded', async () => {
	const divResults = document.getElementById('results')

	const call = await fetch('/api/v1/users/current/tracks', {
		method: 'GET',
		headers: defaultHeaders
	})

	const res = await call.json()

	if (res.status === 'success') {
		const { data: { tracks } } = res
		if (tracks.length) {
			divResults.innerHTML = createTrackTable(tracks)
			setListeners()
		} else {
			divResults.innerHTML = '<p style="margin: 40px 0;">No tracks found. 😔</p>'
		}
	}
})

const createTrackTable = (tracks) =>
	tracks.reduce((table, track, inx, arr) => {
		table += `
		<tr data-track='${ stringToBase64(JSON.stringify(track)) }'>
      <th scope="row">${ inx + 1 }</th>
      <td><a href="${ track.href }" target="_blank">${ track.name }</a></td>
      <td>${ track.artists.map((a, inx, arr) => `<a href="${ a.href }" target="_blank">${ a.name }${ arr.length === inx + 1 ? '' : ', ' }</a>`).join('') }</td>
      <td><a href="${ track.album.href }" target="_blank">${ track.album.name } (${ track.album.release.split('-')[0] })</a></td>
      <td data-tooltip="Display locations" style="cursor: pointer;"><i class="bi bi-compass"></i></td>
      <td data-tooltip="View lyrics" style="cursor: pointer;"><i class="bi bi-body-text"></i></td>
    </tr>`

		if (arr.length === inx + 1) {
			table += '</tbody></table>'
		}

		return table
	}, `<table>
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">Track name</th>
      <th scope="col">Artists</th>
      <th scope="col">Album</th>
      <th scope="col"></th>
      <th scope="col"></th>
    </tr>
  </thead>
  <tbody>`)

const setListeners = () => {
	document.querySelectorAll('i[class="bi bi-compass"]').forEach((i) =>
		i.addEventListener('click', () => {
			const track = JSON.parse(base64ToString(i.parentElement.parentElement.dataset.track))
			clearMarkers()

			if (track.lyrics) {
				const markers = track.lyrics.locations.map((location) => createMarker({
					coordinates: location.geo.coordinates.reverse(),
					popup: location.name
				}))

				if (markers.length) {
					fitMarkers(markers)
					return
				}
			}
			setTimeout(() => alert('No locations found.'), 0)
		})
	)

	document.querySelectorAll('i[class="bi bi-body-text"]').forEach((i) =>
		i.addEventListener('click', () => {
			const track = JSON.parse(base64ToString(i.parentElement.parentElement.dataset.track))
			document.getElementById('placeHolder').innerHTML = createLyricsDialog(track)
			document.querySelector('footer a[href="#close"]').addEventListener('click', (e) => {
				e.preventDefault()
				document.getElementById('placeHolder').innerHTML = ''
			})
		})
	)
}

const createLyricsDialog = (track) => `
<dialog open>
  <article>
    <h3><a href="${ track.href }">${ track.name }</a> by ${ track.artists.map((a, inx, arr) => `<a href="${ a.href }" target="_blank">${ a.name }${ arr.length === inx + 1 ? '' : ', ' }</a>`).join('') }</h3>
    <p>
      ${ track.lyrics ? track.lyrics.text.split('\n\n').map((p) => `<p>${ p.replaceAll('\n', '<br>') }</p>`).join('') + `<small>${ track.lyrics.copy }</small>` : 'Lyrics not available.' }
    </p>
    <footer>
      <a href="#close" role="button">Close</a>
    </footer>
  </article>
</dialog>`
