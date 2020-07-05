require("ts-node/register")

module.exports = {
	client: `pg`,
	connection: `postgresql://@localhost/topicseed`,
	pool: {
		min: 2,
		max: 10,
	},
	migrations: {
		tableName: `knex_migrations`,
		directory: `migrations`,
	},
	timezone: `UTC`,
}
