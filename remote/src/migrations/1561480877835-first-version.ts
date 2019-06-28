import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class FirstVersion1561480877835 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await this._createTables(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable('admins', true, true);
    await queryRunner.dropTable('servers_sessions', true, true);
    await queryRunner.dropTable('servers', true, true);
  }

  private async _createTables(queryRunner: QueryRunner) {
    await queryRunner.createTable(
      new Table({
        name: 'servers',
        columns: [
          {
            isPrimary: true,
            name: 'physical_address',
            type: 'varchar',
            length: '12',
            isNullable: false,
          },
          {
            name: 'display_name',
            type: 'varchar',
            length: '30',
            isNullable: true,
          },
          {
            name: 'valid_users',
            type: 'varchar',
            isNullable: false,
            isArray: true,
          },
        ],
        uniques: [{ columnNames: ['physical_address'] }],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'servers_sessions',
        columns: [
          {
            name: 'server',
            type: 'varchar',
            length: '12',
            isNullable: false,
            isPrimary: true,
          },
          {
            name: 'hashed_key',
            type: 'varchar',
            length: '256',
            isNullable: false,
          },
        ],
        uniques: [{ columnNames: ['server'] }],
        foreignKeys: [
          {
            columnNames: ['server'],
            referencedColumnNames: ['physical_address'],
            referencedTableName: 'servers',
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'admins',
        columns: [
          {
            name: 'email',
            type: 'varchar',
            length: '100',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'display_name',
            type: 'varchar',
            length: '30',
            isNullable: false,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '256',
            isNullable: false,
          },
          {
            name: 'ignore_tfa',
            type: 'boolean',
            isNullable: false,
          },
        ],
        uniques: [{ columnNames: ['email'] }],
      }),
      true,
    );
  }
}
