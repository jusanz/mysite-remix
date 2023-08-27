# Website for JUSANZ

Website for our project, JUSANZ. As Example of website using Remix, Postgres, and Docker Compose.

## Database

### push

```:sh
docker compose exec client npx prisma db push
```

## Example of .env files

```.env
POSTGRES_DB="postgres"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="postgres"
```

```client/.env
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}?schema=public"
```
