# ClaimsFlow

ClaimsFlow is an internal insurance claims operations workspace built with Java, Spring Boot, Angular, and PostgreSQL. The project is being delivered as a modular monolith so the complete workflow remains easy to run, test, and explain.

## Repository structure

- `backend/`: Spring Boot REST API
- `frontend/`: Angular standalone application
- `docs/`: product, architecture, and interview material
- `docker-compose.yml`: local PostgreSQL service

## Development

```bash
docker compose up -d db
cd backend && mvn spring-boot:run
cd frontend && npm install && npm start
```

## Verification

```bash
cd backend && mvn verify
cd frontend && npm run test:ci && npm run build
```

The implemented feature set and demo instructions will be documented as each vertical slice is completed.
