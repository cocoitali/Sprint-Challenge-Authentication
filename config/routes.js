const axios = require('axios')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../database/dbConfig')

const { authenticate } = require('../auth/authenticate')

module.exports = server => {
	server.post('/api/register', register)
	server.post('/api/login', login)
	server.get('/api/jokes', authenticate, getJokes)
}

function register(req, res) {
	// implement user registration
	const creds = req.body
	const hash = bcrypt.hashSync(creds.password, 14)
	creds.password = hash
	db('users')
		.insert(creds)
		.then(id => {
			res.status(201).json(id)
		})
		.catch(() => {
			res.status(500).json({ error: 'Unable to register user.' })
		})
}

function generateToken(user) {
	const payload = {
		username: user.username
	}

	const secret = process.env.JWT_SECRET

	const options = {
		expiresIn: '10m'
	}
	return jwt.sign(payload, secret, options)
}

function login(req, res) {
	// implement user login
	const creds = req.body
	db('users')
		.where({ username: creds.username })
		.first()
		.then(user => {
			if (user && bcrypt.compareSync(creds.password, user.password)) {
				const token = generateToken(user)
				res
					.status(200)
					.json({ message: `${user.username} is logged in`, token })
			} else {
				res.status(401).json({ message: 'You shall not pass!' })
			}
		})
		.catch(() => {
			res.status(500).json({ message: 'Please try logging in again.' })
		})
}

function getJokes(req, res) {
	const requestOptions = {
		headers: { accept: 'application/json' }
	}

	axios
		.get('https://icanhazdadjoke.com/search', requestOptions)
		.then(response => {
			res.status(200).json(response.data.results)
		})
		.catch(err => {
			res.status(500).json({ message: 'Error Fetching Jokes', error: err })
		})
}
