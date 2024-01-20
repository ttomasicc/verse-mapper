const frmLogin = document.getElementById('frmLogin')
const btnSubmit = frmLogin.querySelector('button')
const pErrMess = document.getElementById('errMess')

frmLogin.addEventListener('submit', async (e) => {
	e.preventDefault()
	btnSubmit.setAttribute('aria-busy', 'true')

	try {
		const call = await fetch('/api/v1/users/login', {
			method: 'POST',
			headers: defaultHeaders,
			body: JSON.stringify(formDataToObject(new FormData(frmLogin)))
		})
		const res = await call.json()

		if (res.status === 'success') {
			location.assign('/home')
		} else {
			showErr(pErrMess, res.message)
		}
	} catch (err) {
		console.error(`[ ERROR ] ${ new Date() } - ${ err }`)
	}

	btnSubmit.removeAttribute('aria-busy')
})

document.querySelectorAll('input').forEach((inEl) => {
	inEl.addEventListener('keypress', () => hideErr(pErrMess))
})
