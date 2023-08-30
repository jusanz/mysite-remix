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

## Load .env file

```
source .env
```

## Generate SECRET_KEY

```:py
import secrets
secrets.token_urlsafe()
```

## Django

### Install

```
cd django
python3 -m venv venv
. venv/bin/activate
pip install -U pip wheel
pip install -r requirements.txt
pip freeze -> requirements_lock.txt
django-admin startproject main .
```

### Migration

```
docker compose exec django python manage.py migrate
```

### Collect static files

```
docker compose exec django python manage.py collectstatic
```

### Create superuser

```
docker compose exec django python manage.py createsuperuser
```
