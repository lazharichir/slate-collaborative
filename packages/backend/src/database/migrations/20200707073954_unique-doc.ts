import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
	return knex.schema.table(`documents`, (table) => {
		table.unique([`document`, `version`], `ix_unique_document_version`)
	})
}


export async function down(knex: Knex): Promise<any> {
	return knex.schema.table(`documents`, (table) => {
		table.dropUnique([`document`, `version`], `ix_unique_document_version`)
	})
}

