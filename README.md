# Collaborative Slate Editor

# Collaborative Value Types

A collaborative value type supports multiple users editing the same document with delayed synchronization. This is
required in cases where one (or more) collaboratives are offline or temporarily out-of-sync (i.e.: the user does not
wait for the backend to acknowledge the change).

To create a new collaborative value type, a reducer and a transformer needs to be implemented.
To support local undo/redo, the inverter needs to be implemented.
To support updating the collaborative value type, the upcaster needs to be implemented.
To minimize the changeset size, the optimizer needs to be implemented.

## Reducer

The reducer takes a value and applied an operation to the value.

```
reducer(value: Value, operation: Operation): Value
```

## Transformer

The transformer takes a two lists of operations and transforms them into their transformed counterparts.

```
transformer(leftOperations: Operation[], topOperations: Operation[], tieBreaker: boolean): [Operation[], Operation[]]
```

The result of applying the left operations and then the transformed top operations must be the same as applying the top
operations and then the transformed left operations.

## Inverter

The inverter takes an operation and returns an operation that would undo the current operation.

```
inverter(operation: Operation): Operation
```

The result of applying the operation then the inverted operation must be in the original value.

## Optimizer

The optimizer takes a list of operations and returns a more condensed version of the same operations.

```
optimizer(operations: Operation[]): Operation[]
```

The result of applying the optimized operations must be the same as applying the operations.

## Upcaster

The upcaster allows these constructs to be updated if the underlying data model ever changes.

```
valueUpcaster(versionedValue: VersionedValue): Value
operationUpcaster(versionedOperation: VersionedOperation): Operation
selectionUpcaster(versionedSelection: VersionedSelection): Selection
```

The operations that were stored offline a few days ago must still be valid.

# Projects

## Slate-Value

The slate-value is a collaborative value type to support the slate-editor.

## Record

The high-level concept to coordinate collaboration efforts of any collaborative value type.

## Record-Service

The record service code is a collaborative service for the frontend.

## Backend

The backend code coordinates the collaborative editing between multiple collaborators.

## Frontend

The frontend code provides a means of viewing and editing the collaborative document.

# How to Build & Deploy

## Build Record

```
cd record
npm run build
```

## Build Slate-Value

```
cd slate-value
npm run build
```

## Build Common

```
cd common
npm run build
```

## Build Backend

```
cd backend
npm run build
```

## Deploy Backend

```
sam deploy
```

## Build Frontend

Copy WebSocketURL from backend deployment to frontend/.env

```
REACT_APP_WEBSOCKETURL={WebSocketURL}
```

```
cd frontend
npm run build
```

## Deploy Frontend

### Locally

```
cd frontend
npm run start
```

### S3 Bucket

Copy contents of frontend/build to S3 bucket created when backend deployed
