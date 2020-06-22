import * as AWS from "aws-sdk";
import ConnectionService from "../domain/ConnectionService";
import {ConnectionId} from "../domain/ConnectionId";
import {Response} from "../application/Response";

export default class ApiGatewayConnectionService<V, S, O> implements ConnectionService<V, S, O> {

    private readonly apigwManagementApi: AWS.ApiGatewayManagementApi;

    constructor(endpoint: string) {
        this.apigwManagementApi = new AWS.ApiGatewayManagementApi({apiVersion: "2018-11-29", endpoint});
    }

    send(connectionId: ConnectionId, message: Response<V, S, O>): Promise<void> {
        return this.apigwManagementApi.postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify(message)
        }).promise().then(() => {});
    }

    close(connectionId: ConnectionId): Promise<void> {
        return this.apigwManagementApi.deleteConnection({
            ConnectionId: connectionId
        }).promise().then(() => {});
    }
}