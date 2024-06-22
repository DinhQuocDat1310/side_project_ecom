
## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

[MongoDB](https://www.mongodb.com/docs/) cloud db
## Installation (node 18)

```bash
$ yarn install
```
## Database

```bash
$ npx prisma generate
$ npx prisma db push    
```
## Enviroment

```bash
# Database connection

$ DATABASE_URL= mongodb+srv://<usename>:<password>@cluster0.xxxxxx.mongodb.net/yourdatabasename?retryWrites=true&w=majority&appName=appName

#Port
PORT=

#Token
ACCESS_TOKEN_JWT_SECRET_KEY=
REFRESH_TOKEN_JWT_SECRET_KEY=
EXPIRES_ACCESS_TOKEN_IN_24_HOURS=

#Email - Brevo
BREVO_API_KEY=
BREVO_EMAIL_ADMIN=
BREVO_NAME_ADMIN=

# OAUTH
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# AI Integrating
OPENAI_API_KEY =
GOOGLE_API_KEY =
DATABASE_VECTOR_NAME=
NAMESPACE_VECTOR=
COLLECTION_VECTOR_NAME=

# Gateway 
FRONT_DEPLOY=

```
## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Support


## Stay in touch


## License

