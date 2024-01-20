const frmSignup = document.getElementById('frmSignup')
const btnSubmit = frmSignup.querySelector('button')
const pErrMess = document.getElementById('errMess')

frmSignup.addEventListener('submit', async (e) => {
	e.preventDefault()
	btnSubmit.setAttribute('aria-busy', 'true')

	try {
		const call = await fetch('/api/v1/users/signup', {
			method: 'POST',
			headers: defaultHeaders,
			body: JSON.stringify(formDataToObject(new FormData(frmSignup)))
		})
		const res = await call.json()

		if (res.status === 'success') {
			location.assign('/home')
		} else {
			showErr(pErrMess, res.message.includes('email') ? 'User already exists.' : res.message)
		}
	} catch (err) {
		console.error(`[ ERROR ] ${ new Date() } - ${ err }`)
	}

	btnSubmit.removeAttribute('aria-busy')
})

document.querySelectorAll('input').forEach((inEl) => {
	inEl.addEventListener('keypress', () => hideErr(pErrMess))
})
