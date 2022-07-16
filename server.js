const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const port = process.env.PORT || 3000;
const Tasks = require('./app/model/task');

// view engine setup
app.set('view engine', 'ejs');
app.use(express.static('public'));

// configs
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.set('json spaces', 2);

app.listen(port, () => console.log(`Listening on port ${port}`));
console.log(process.env);
// mongoose setup
mongoose.connect(process.env.dburi);
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.error('Connected to db'));

app.get('/', async (req, res) => {
	try {
		const data = await readFromDb();
		const datecomplete = data.map((item) => new Date(item.completedDate));
		// console.log('datecomplete', datecomplete);
		res.render('index.ejs', { data: data, datecomplete: datecomplete });
	} catch (err) {
		console.log(err);
	}
});
app.get('/tasks', async (req, res) => {
	try {
		const data = await readFromDb();

		res.status(200).json({ data });
		// res.status(200).json({ key });
	} catch (err) {
		console.log(err);
	}
});
app.get('/task/:id', async (req, res) => {
	let valueId = req.params.id;
	let key = 'key';
	try {
		const data = await readFromDb(key, valueId);
		res.status(200).send(data);
	} catch (err) {
		console.log(err);
	}
});

app.get('/task/:id/date', async (req, res) => {
	let valueId = req.params.id;
	let key = 'key';
	try {
		const data = await readFromDb(key, valueId);
		const response = data.completedDate;
		if (response) {
			res.status(200).send(response);
		} else {
			res.status(200).send('');
		}
	} catch (err) {
		console.log(err);
	}
});

app.post('/tasks', async (req, res) => {
	const key = await nextKey();
	console.log('key', key);
	try {
		const reqBody = req.body;
		writeToDb(key, reqBody.user, reqBody.title, reqBody.description, reqBody.completed, reqBody.completedDate);

		res.status(201).redirect(`/`);
	} catch (err) {
		console.log(err);
	}
});
app.patch('/task/:id', async (req, res) => {
	let key = req.params.id;

	try {
		const reqBody = req.body;
		writeToDb(key, reqBody.user, reqBody.title, reqBody.description, reqBody.completed, reqBody.completedDate);

		res.status(201).redirect(`/tasks`);
	} catch (err) {
		console.log(err);
	}
});
app.delete('/task/:id', async (req, res) => {
	let key = req.params.id;
	console.log('deleting...', key);
	try {
		deleteFromDb(key);
		res.status(202).send({ message: `${key} has been deleted` });
	} catch (err) {
		console.log(err);
	}
});

// read all documents from db

const readFromDb = async (key, value) => {
	console.log('read from db');
	if (key != undefined && value != undefined) {
		return await Tasks.findOne({ [key]: value });
	} else {
		return await Tasks.find().lean();
	}
};

// helps to write to db. Upsert helps with adding if not found, or update if found.
const writeToDb = async (key, user, title, description, completed, completedDate) => {
	console.log('write to db');
	const query = { key: key };
	const updated_at = Date.now();
	const update = {
		$set: {
			key: key,
			user: user,
			title: title,
			description: description,
			completed: completed,
			completedDate: completedDate
		},
		updated_at
	};
	return await Tasks.findOneAndUpdate(query, update, { upsert: true });
};

const deleteFromDb = async (quoteId) => {
	console.log('delete from db');
	const query = { quoteId: quoteId };
	return await Tasks.findOneAndDelete(query);
};

const nextKey = async () => {
	const data = await readFromDb();
	const keys = data.map((item) => item.key);
	console.log('next key:', Math.max(...keys));

	return Math.max(...keys) == -Infinity ? 1 : Math.max(...keys) + 1;
};
