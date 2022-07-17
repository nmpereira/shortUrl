const mongoose = require('mongoose');

const hashSchema = new mongoose.Schema({
	longUrl: { type: String },
	shortUrl: { type: String },
	timesVisited: { type: Number },
	ttl: { type: Date },
	created_at: { type: Date, required: true, default: Date.now },
	updated_at: { type: Date, required: true }
});

module.exports = mongoose.model('Hashs', hashSchema);



