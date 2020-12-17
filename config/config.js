/** @format */

require("dotenv").config();

const mongoose = require("mongoose");

module.exports = (DB_name) => {
	mongoose
		.connect("mongodb://localhost/Admin-App-DB", {
			useCreateIndex: true,
			useFindAndModify: true,
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
		.then(() => {
			console.log(`CONNECTION ESTABLISHED WITH DATA-BASE ${DB_name}`);
		})
		.catch((error) =>
			console.log(`DATABASE CONNECTION NOT ESTABLISHED AND FAILED ${error}`)
		);
};
