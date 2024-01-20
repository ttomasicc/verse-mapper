export const getOverview = (req, res) => {
	res.status(200).render('overview', {
		title: 'Overview'
	})
}

export const getLoginForm = (req, res) => {
	res.status(200).render('login', {
		title: 'Login'
	})
}

export const getSignupForm = (req, res) => {
	res.status(200).render('signup', {
		title: 'Sign up'
	})
}

export const getHome = (req, res) => {
	res.status(200).render('home', {
		title: 'Login'
	})
}

export const getFavorites = (req, res) => {
	res.status(200).render('favorites', {
		title: 'Favorite tracks'
	})
}

export const getStats = (req, res) => {
	res.status(200).render('statistics', {
		title: 'Statistics'
	})
}
