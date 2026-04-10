

[working-directory: "apps/web"]
run-web:
    npm run dev

[working-directory: "apps/api"]
run-api:
    uv run uvicorn app.main:app --reload --port 8000 &

run-db:
    docker compose up -d postgres

run: run-db run-api run-web



up:
    docker compose up -d

down:
    docker compose down

check:
    npm run format
    sh .husky/pre-commit
    uv run ruff check .
    uv run pre-commit

[working-directory: "apps/api"]
test-api:
    uv run pytest

[working-directory: "apps/web"]
test-web:
    npm run test



test: test-api test-web
