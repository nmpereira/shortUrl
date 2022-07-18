const moment = require('moment');
const shortHash = require('short-hash');
// Handle GET requests to /api route
/* istanbul ignore next */
const logger = (req, res, next) => {
	console.log(
		`${req.method}: '${req.protocol}://${req.get(
			'host'
		)}${req.originalUrl}' at: '${moment().format()}' from ${req.ip ||
			req.headers['x-forwarded-for'] ||
			req.socket.remoteAddress ||
			req.ip ||
			null}`
	);
	next();
};
module.exports = logger;

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

module.exports = { logger, urlValidator, createShort };
