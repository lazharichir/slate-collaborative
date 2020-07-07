import Knex from "knex"
import PgResourceRepository from "../infrastructure/PgResourceRepository"
import PgResourceConnectionRepository from "../infrastructure/PgResourceConnectionRepository"
import {
	slateOperationUpcaster,
	slateSelectionUpcaster,
	SlateValue,
	slateValueUpcaster,
} from "@wleroux/slate-value"
import ResourceConnectionRepository from "../domain/ResourceConnectionRepository"

const knex = Knex({
	client: `pg`,
	connection: `postgresql://@localhost/topicseed`,
})

export const resourcesPgRepository = new PgResourceRepository(
	knex,
	slateValueUpcaster,
	slateSelectionUpcaster,
	slateOperationUpcaster,
	SlateValue.DEFAULT
)

export const resourceConnectionPgRepository: ResourceConnectionRepository = new PgResourceConnectionRepository(
	knex
)

export const repositories = {
	resources: resourcesPgRepository,
	connections: resourceConnectionPgRepository,
}

export default repositories
