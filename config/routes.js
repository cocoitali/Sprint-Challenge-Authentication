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

function login(req, res) {
	// implement user login
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
