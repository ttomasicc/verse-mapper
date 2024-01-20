const htmlEl = document.querySelector('html')
const themeSwitchEl = document.getElementById('themeSwitch')
const btnLogout = document.getElementById('btnLogout')

htmlEl.dataset.theme = localStorage.getItem('theme') ?? 'dark'

themeSwitchEl.addEventListener('click', () => {
	htmlEl.dataset.theme = htmlEl.dataset.theme === 'dark' ? 'light' : 'dark'
	localStorage.setItem('theme', htmlEl.dataset.theme)
})

btnLogout?.addEventListener('click', async () => {
	try {
		const call = await fetch('/api/v1/users/logout')
		const response = await call.json()

		if (response.status === 'success') {
			location.assign('/')
		}
	} catch (_) {
		alert('Error logging out. Please try again.')
	}
})

const stringToBase64 = (str) => {
	const utf8 = encodeURIComponent(str);
	const bytes = new Uint8Array(utf8.length);

	for (let i = 0; i < utf8.length; i++) {
		bytes[i] = utf8.charCodeAt(i);
	}

	return btoa(String.fromCharCode.apply(null, bytes));
}
const base64ToString = (base64) => decodeURIComponent(atob(base64))

const formDataToObject = (frmData) => Object.fromEntries(frmData.entries())

const defaultHeaders = {
	'Accept': 'application/json',
	'Content-Type': 'application/json'
}

const showErr = (errEl, message) => {
	errEl.style.visibility = 'visible'
	errEl.innerText = message
}
const hideErr = (errEl) => (errEl.style.visibility = 'hidden')

const createTrackCard = (track) => `
	<article>
		<a href="${ track.album.href }" target="_blank" style="display: block; text-align: center;">
			<img style="border-radius: 3%;" src="${ track.album.img ? track.album.img.url : '/img/music-note.webp' }" width="300" height="300" alt="${ track.album.name } cover"/>
			<br>
			<strong>${ track.album.name.toUpperCase() } (${ track.album.release.split('-')[0] })</strong>
		</a>
		<footer>
			<p style="margin: auto;"><strong>${ track.name }</strong></p>
			<p>${ track.artists.map((a, inx, arr) => `<a href="${ a.href }" target="_blank">${ a.name }${ arr.length === inx + 1 ? '' : ', ' }</a>`).join('') }</p>
			<button type="button" data-track='${ stringToBase64(JSON.stringify(track)) }'>Details</button>
		</footer>
	</article>
`.trim().replaceAll(/[\r\n\t]/gm, '')

const createTrackGrid = (tracks, columns = 2) =>
	tracks.reduce((grid, track, inx) => {
		// ends and/or starts a new grid with n columns
		if (inx % columns === 0) {
			if (inx > 0) {
				grid += '</div>'
			}
			grid += '<div class="grid">'
		}

		// creates a track card
		grid += `<div>${ createTrackCard(track) }</div>`

		// fills empty columns
		if (tracks.length % columns !== 0 && tracks.length === inx + 1) {
			for (let i = 0; i < columns - tracks.length % columns; i++) {
				grid += '<div></div>'
			}
			grid += '</div>'
		}

		return grid
	}, '')
