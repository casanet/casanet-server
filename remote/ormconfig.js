'use strict';

// typeorm run dotenv for us
const { DATABASE_URL } = process.env;

function isMigrationCommand() {
  const command = process.argv.join(' ');

  return command.includes('migration:');
}

module.exports = {
  type: 'postgres',
  url: DATABASE_URL,
  entities: ['dist/models/**/*.js'],
  synchronize: false,
  logging: false,
  migrations: isMigrationCommand() ? ['src/migrations/**/*.ts'] : [],
  cli: {
    entitiesDir: 'src/models',
    migrationsDir: 'src/migrations'
  }
};
