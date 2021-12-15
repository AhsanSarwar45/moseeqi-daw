import { createPool } from 'mysql2';

const pool = createPool({
	host: 'localhost',
	user: 'root',
	password: '4545',
	port: 3306,
	database: 'test'
});

pool.getConnection((err) => {
	if (err) {
		console.error('Error connecting to DB');
	}
	console.error('Connected to DB');
});

const executeQuery = (query: any, params: any) => {
	return new Promise((resolve, reject) => {
		try {
			pool.query(query, params, (err, data) => {
				if (err) {
					console.error('Error in executing query');
					reject(err);
				}
				resolve(data);
			});
		} catch (err) {
			reject(err);
		}
	});
};

module.exports = { executeQuery };
