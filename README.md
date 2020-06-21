# Collaborative Slate Editor

# Build Record

```
cd record
npm run build
```

# Build Slate-Value

```
cd slate-value
npm run build
```

# Build Common

```
cd common
npm run build
```

# Build Backend

```
cd backend
npm run build
```

# Deploy Backend

```
sam deploy
```

# Build Frontend

Copy WebSocketURL from backend deployment to frontend/.env

```
REACT_APP_WEBSOCKETURL={WebSocketURL}
```

```
cd frontend
npm run build
```

# Deploy Frontend

## Locally

```
cd frontend
npm run start
```

## S3 Bucket

Copy contents of frontend/build to S3 bucket created when backend deployed
