module.exports.createSuperUser = async () => {
	require("dotenv").config();

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
			database: process.env.DB_NAME,
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
				permissions: { superuser: "*" },
				created_at: new Date(),
				updated_at: new Date(),
			};

			try {
				db.select("*")
					.from("admins")
					.then((rows) => {
						if (rows.length > 0) {
							console.log("\x1b[31m", "super user already exists");
							process.exit();
						} else {
							db.insert(payload)
								.into("admins")
								.returning("*")
								.then((rows) => {
									console.log("\x1b[32m", "super user created successfully");
									process.exit();
								});
						}
					});
			} catch (error) {
				console.log(error);
				process.exit();
			}
		});
	});
};
