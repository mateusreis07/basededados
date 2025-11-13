-- Migração manual para suporte multi-tenant
-- Execute este SQL quando o banco estiver disponível

-- 1. Criar tabela de teams
CREATE TABLE IF NOT EXISTS "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "domain" TEXT,
    "settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- 2. Criar índices únicos para teams
CREATE UNIQUE INDEX IF NOT EXISTS "teams_name_key" ON "teams"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "teams_slug_key" ON "teams"("slug");

-- 3. Adicionar colunas team_id nas tabelas existentes
ALTER TABLE "sections" ADD COLUMN IF NOT EXISTS "team_id" TEXT;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "team_id" TEXT;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "team_id" TEXT;
ALTER TABLE "menu_items" ADD COLUMN IF NOT EXISTS "team_id" TEXT;
ALTER TABLE "section_type_groups" ADD COLUMN IF NOT EXISTS "team_id" TEXT;
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "team_id" TEXT;

-- 4. Criar team padrão
INSERT INTO "teams" ("id", "name", "slug", "description", "settings", "updated_at")
VALUES (
    gen_random_uuid()::text,
    'Time Padrão',
    'default',
    'Time padrão para dados existentes',
    '{}',
    CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

-- 5. Atualizar registros existentes com o team padrão
UPDATE "sections"
SET "team_id" = (SELECT "id" FROM "teams" WHERE "slug" = 'default')
WHERE "team_id" IS NULL;

UPDATE "categories"
SET "team_id" = (SELECT "id" FROM "teams" WHERE "slug" = 'default')
WHERE "team_id" IS NULL;

UPDATE "items"
SET "team_id" = (SELECT "id" FROM "teams" WHERE "slug" = 'default')
WHERE "team_id" IS NULL;

UPDATE "menu_items"
SET "team_id" = (SELECT "id" FROM "teams" WHERE "slug" = 'default')
WHERE "team_id" IS NULL;

UPDATE "section_type_groups"
SET "team_id" = (SELECT "id" FROM "teams" WHERE "slug" = 'default')
WHERE "team_id" IS NULL;

UPDATE "reports"
SET "team_id" = (SELECT "id" FROM "teams" WHERE "slug" = 'default')
WHERE "team_id" IS NULL;

-- 6. Tornar team_id obrigatório
ALTER TABLE "sections" ALTER COLUMN "team_id" SET NOT NULL;
ALTER TABLE "categories" ALTER COLUMN "team_id" SET NOT NULL;
ALTER TABLE "items" ALTER COLUMN "team_id" SET NOT NULL;
ALTER TABLE "menu_items" ALTER COLUMN "team_id" SET NOT NULL;
ALTER TABLE "section_type_groups" ALTER COLUMN "team_id" SET NOT NULL;
ALTER TABLE "reports" ALTER COLUMN "team_id" SET NOT NULL;

-- 7. Adicionar foreign keys
ALTER TABLE "sections" ADD CONSTRAINT "sections_team_id_fkey"
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "categories" ADD CONSTRAINT "categories_team_id_fkey"
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "items" ADD CONSTRAINT "items_team_id_fkey"
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_team_id_fkey"
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "section_type_groups" ADD CONSTRAINT "section_type_groups_team_id_fkey"
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reports" ADD CONSTRAINT "reports_team_id_fkey"
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 8. Criar índices para performance
CREATE INDEX IF NOT EXISTS "sections_team_id_idx" ON "sections"("team_id");
CREATE INDEX IF NOT EXISTS "categories_team_id_idx" ON "categories"("team_id");
CREATE INDEX IF NOT EXISTS "items_team_id_idx" ON "items"("team_id");
CREATE INDEX IF NOT EXISTS "menu_items_team_id_idx" ON "menu_items"("team_id");
CREATE INDEX IF NOT EXISTS "section_type_groups_team_id_idx" ON "section_type_groups"("team_id");
CREATE INDEX IF NOT EXISTS "reports_team_id_idx" ON "reports"("team_id");

-- 9. Ajustar constraints únicas (nome único por team)
-- Remover constraint única global de sections se existir
ALTER TABLE "sections" DROP CONSTRAINT IF EXISTS "sections_name_key";
-- Criar constraint única por team
CREATE UNIQUE INDEX IF NOT EXISTS "sections_name_team_id_key" ON "sections"("name", "team_id");

-- Fazer o mesmo para categories
ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_name_key";
CREATE UNIQUE INDEX IF NOT EXISTS "categories_name_team_id_key" ON "categories"("name", "team_id");

-- 10. Inserir teams de exemplo
INSERT INTO "teams" ("id", "name", "slug", "description", "settings", "updated_at") VALUES
(gen_random_uuid()::text, 'Marketing', 'marketing', 'Time de Marketing e Comunicação', '{}', CURRENT_TIMESTAMP),
(gen_random_uuid()::text, 'Desenvolvimento', 'dev', 'Time de Desenvolvimento de Software', '{}', CURRENT_TIMESTAMP),
(gen_random_uuid()::text, 'Suporte', 'suporte', 'Time de Suporte ao Cliente', '{}', CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

-- Verificar resultado
SELECT
    t.name as "Team",
    t.slug as "URL",
    COUNT(s.id) as "Seções",
    COUNT(DISTINCT i.id) as "Itens"
FROM "teams" t
LEFT JOIN "sections" s ON s.team_id = t.id
LEFT JOIN "items" i ON i.team_id = t.id
GROUP BY t.id, t.name, t.slug
ORDER BY t.name;