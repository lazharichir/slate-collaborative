// import { UniqueIdGenerator } from "../utils/UniqueIdGenerator"
// import { pubsub } from "./pubsub"

// export const Resolvers: any = {
// 	Query: {
// 		notifications: () => [],
// 	},
// 	Mutation: {
// 		insertNotification: async () => {

// 			const notification = {
// 				id: UniqueIdGenerator.generateNanoId(),
// 				message: UniqueIdGenerator.generateUUID(),
// 			}

// 			pubsub.publish(`NOTIFICATION_ADDED`, {
// 				notificationAdded: notification,
// 			})

// 			return notification

// 		},
// 	},
// 	Subscription: {
// 		notificationAdded: {
// 			subscribe: () => pubsub.asyncIterator(`NOTIFICATION_ADDED`),
// 		},
// 	},
// }