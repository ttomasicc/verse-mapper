import jwt from 'jsonwebtoken'

export const signJwt = ({ id }) => new Promise((resolve, reject) => {
	jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_TIMEOUT,
		issuer: process.env.JWT_ISSUER
	}, (err, token) => err ? reject(err) : resolve(token))
})

export const verifyJwt = (token) => new Promise((resolve, reject) => {
	jwt.verify(token, process.env.JWT_SECRET, {
		issuer: process.env.JWT_ISSUER
	}, (err, decoded) => err ? reject(err) : resolve(decoded))
})
