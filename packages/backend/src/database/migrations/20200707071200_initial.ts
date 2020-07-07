import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {

	return knex.schema.createTable(`documents`, function (table) {
		table.uuid(`id`).primary(`pk_ops_id`)
		table.string(`document`).notNullable()
		table.string(`version`).notNullable()
		table.integer(`revision`).unsigned().notNullable()
		table.timestamp('inserted_at', { useTz: true }).defaultTo(knex.fn.now())
		table.string('inserted_by').notNullable()
		table.jsonb(`value`).notNullable()
		table.jsonb(`cursors`).notNullable()
		table.jsonb(`metadata`).notNullable()
		table.index([ `document`, `version` ], `ix_ops_document_version`)
	})
	
	.createTable(`changesets`, function (table) {
		table.uuid(`id`).primary(`pk_changesets_id`)
		table.string(`document`).notNullable()
		table.string(`version`).notNullable()
		table.integer(`revision`).unsigned().notNullable()
		table.timestamp('inserted_at', { useTz: true }).defaultTo(knex.fn.now())
		table.string('inserted_by').notNullable()
		table.jsonb(`operations`).notNullable()
		table.jsonb(`metadata`).notNullable()
		table.index([ `document`, `version`, `revision` ], `ix_changesets_document_version_revision`)
	})
	
	.createTable(`connections`, function (table) {
		table.uuid(`id`).primary(`pk_ops_id`)
		table.string(`connection`).notNullable()
		table.string(`document`).notNullable()
		table.string(`version`).notNullable()
		table.timestamp('initiated_at', { useTz: true }).defaultTo(knex.fn.now())
		table.string('initiated_by').notNullable()
		table.index([ `connection` ], `ix_connections_connection`)
		table.index([ `document`, `version` ], `ix_connections_document_version`)
	});

}

export async function down(knex: Knex): Promise<any> {
	return knex.schema
		.dropTableIfExists(`documents`)
		.dropTableIfExists(`changesets`)
		.dropTableIfExists(`connections`)
}

