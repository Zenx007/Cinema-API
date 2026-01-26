npx typeorm-ts-node-commonjs migration:generate src/Infrastructure/Migrations/initialMigration -d src/Infrastructure/Database/dataSource.migration.ts

'npx typeorm-ts-node-commonjs migration:run -d src/Infrastructure/Database/dataSource.migration.ts'