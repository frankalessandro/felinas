#!/bin/bash
# Aplica las migraciones reales de supabase/migrations (en orden) y luego el seed.
# Quita solo lo que necesita pg_cron, que esta imagen no trae.
set -euo pipefail

psql_run() {
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" "$@"
}

for file in /supabase/migrations/*.sql; do
  echo ">> migración: $(basename "$file")"
  sed -e '/create extension if not exists pg_cron/d' "$file" | psql_run -q
done

if [ -f /supabase/seed.sql ]; then
  echo ">> seed.sql"
  psql_run -q -f /supabase/seed.sql
fi
