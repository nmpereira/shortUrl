const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
	user: { type: String },
	title: { type: String },
	description: { type: String },
	key: { type: Number },
	completed: { type: Boolean },
	completedDate: { type: Date },
	created_at: { type: Date, required: true, default: Date.now },
	updated_at: { type: Date, required: true }
});

module.exports = mongoose.model('Tasks', taskSchema);
