const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const port = process.env.PORT || 3000;
const Hashs = require('./app/model/hash');
const shortHash = require('short-hash');

// view engine setup
app.set('view engine', 'ejs');
app.use(express.static('public'));

// configs
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.set('json spaces', 2);

app.listen(port, () => console.log(`Listening on port ${port}`));

// mongoose setup
mongoose.connect(process.env.dburi);
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.error('Connected to db'));

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

app.post('/create', async (req, res) => {
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

		// res.status(201).redirect(`/`);
		// res.status(201).send({ msg: `${reqBody.longUrl} was shortened to ${shortUrl}` });
		const data = shortUrl;
		const reqOrigin = req.headers.origin;
		const shortenedUrl = `${reqOrigin}/${shortUrl}`;
		console.log('origin', `${reqOrigin}/${shortUrl}`);
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

const urlValidator = (value) => {
	const linkRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
	return linkRegex.test(value);
};

const createShort = (value) => {
	try {
		if (urlValidator(value)) {
			return shortHash(value);
		} else {
			return false;
		}
	} catch (err) {
		console.log(err);
	}
};
