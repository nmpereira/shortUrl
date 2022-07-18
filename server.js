const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const port = process.env.PORT || 3000;
const Hashs = require('./app/model/hash');
const { logger, createShort } = require('./app/helpers/helpers');
// view engine setup
app.set('view engine', 'ejs');
app.use(express.static('public'));

// configs
app.use(bodyParser.urlencoded({ extended: true })).use(cors()).use(express.json()).use(logger);
app.set('json spaces', 2);

// app.listen doesnt run for test suite
/* istanbul ignore next */
if (require.main === module) {
	app.listen(port, () => {
		console.log(`Server listening on port ${port}`);
	});
}

// mongoose setup
mongoose.connect(process.env.dburi);
const db = mongoose.connection;
db.on('error', (error) => console.log(error));
db.once('open', () => console.log('Connected to db'));

app.get('/', async (req, res) => {
	try {
		const data = '';
		const shortenedUrl = '';
		res.render('index.ejs', { data, shortenedUrl });
	} catch (err) {
		console.log(err);
	}
});

app.get('/showlinks', async (req, res) => {
	try {
		const data = await readFromDb();
		res.status(200).json({ data });
		// res.render('index.ejs');
	} catch (err) {
		console.log(err);
	}
});

app.get('/:shortLink', async (req, res) => {
	try {
		const data = await readFromDb('shortUrl', req.params.shortLink);
		if (data) {
			res.status(301).redirect(data.longUrl);
		} else {
			res.status(301).send(`${req.params.shortLink} is not a valid short link`);
		}
	} catch (err) {
		console.log(err);
	}
});

app.post('/', async (req, res) => {
	try {
		const reqBody = req.body;
		let randomizeDate = new Date();
		let randomizeNum = Math.random() * 10000;
		console.log(`${reqBody.longUrl}${randomizeDate}${randomizeNum}`);
		let shortUrl = '';
		if (reqBody.randomize === 'on') {
			shortUrl = createShort(`${reqBody.longUrl}${randomizeDate}${randomizeNum}`);
		} else {
			shortUrl = createShort(reqBody.longUrl);
		}

		if (!shortUrl) {
			res.status(400).send({ msg: `${reqBody.longUrl} is not a valid link` });
		}
		writeToDb(reqBody.longUrl, shortUrl, reqBody.timesVisited, reqBody.ttl);

		const data = shortUrl;
		const reqOrigin = req.headers.origin;
		const shortenedUrl = `${reqOrigin}/${shortUrl}`;

		res.render('index.ejs', { data, shortenedUrl });
	} catch (err) {
		console.log(err);
	}
});

// read all documents from db
const readFromDb = async (key, value) => {
	console.log('read from db');
	if (key != undefined && value != undefined) {
		return await Hashs.findOne({ [key]: value });
	} else {
		return await Hashs.find().lean();
	}
};

// helps to write to db. Upsert helps with adding if not found, or update if found.
const writeToDb = async (longUrl, shortUrl, timesVisited, ttl) => {
	console.log('write to db');
	const query = { shortUrl: shortUrl };
	const updated_at = Date.now();
	const update = {
		$set: {
			longUrl,
			shortUrl,
			timesVisited,
			ttl
		},
		updated_at
	};

	return await Hashs.findOneAndUpdate(query, update, { upsert: true });
};

module.exports = app;
