module.exports.createSuperUser = async () => {
	const bcrypt = require("bcrypt");
	const readline = require("readline").createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	const db = require("knex")({
		client: "pg",
		connection: {
			host: process.env.DB_HOST,
			user: process.env.DB_USERNAME,
			password: process.env.DB_PASSWORD,
			database: "access",
		},
	});

	readline.question(`enter email?`, (email) => {
		email = email;
		readline.question(`enter password?`, (password) => {
			password = password;
			readline.close();

			let payload = {
				email: email,
				password: bcrypt.hashSync(password, 5),
			};

			try {
				db.select("*")
					.from("admins")
					.then((rows) => {
						if (rows.length > 0) {
							console.log("super user already exists");
						} else {
							db.insert(payload)
								.into("admins")
								.returning("*")
								.then((rows) => {
									console.log("super user created");
									process.exit(1);
								});
						}
					});
			} catch (error) {
				console.log(error);
				process.exit(1);
			}
		});
	});
};
