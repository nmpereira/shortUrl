const { urlValidator, createShort } = require('../helpers/helpers');

test('Check if short-hash matches', () => {
	const input_1 = 'https://www.npmjs.com/package/shorthash';
	const input_2 = 'https://www.npmjs.com/package/jest';
	const input_3 = 'https://github.com/nmpereira/shortUrl';

	expect(createShort(input_1)).toEqual('da47c1f2');
	expect(createShort(input_2)).toEqual('a9d46efa');
	expect(createShort(input_3)).toEqual('cd0491bc');
});

test('Check for valid url (valid)', () => {
	const input_1 = 'https://www.npmjs.com/package/shorthash';
	const input_2 = 'https://www.npmjs.com/package/jest';
	const input_3 = 'https://github.com/nmpereira/shortUrl';

	expect(urlValidator(input_1)).toEqual(true);
	expect(urlValidator(input_2)).toEqual(true);
	expect(urlValidator(input_3)).toEqual(true);
});

test('Check for valid url (empty)', () => {
	const input_1 = '';
	const input_2 = ' ';
	const input_3 = '  ';

	expect(urlValidator(input_1)).toEqual(false);
	expect(urlValidator(input_2)).toEqual(false);
	expect(urlValidator(input_3)).toEqual(false);
});

test('Check for valid url (invalid)', () => {
	const input_1 = 'https3://github.com/nmpereira/shortUrl';
	const input_2 = 'https***://github.com/nmpereira/shortUrl';
	const input_3 = '#https#://github.com/nmpereira/shortUrl';
	const input_4 = 'https';
	const input_5 = 'asdasdasd';
	const input_6 = '23424';
	const input_7 = '';

	expect(urlValidator(input_1)).toEqual(false);
	expect(urlValidator(input_2)).toEqual(false);
	expect(urlValidator(input_3)).toEqual(false);
	expect(urlValidator(input_4)).toEqual(false);
	expect(urlValidator(input_5)).toEqual(false);
	expect(urlValidator(input_6)).toEqual(false);
	expect(urlValidator(input_7)).toEqual(false);
});
