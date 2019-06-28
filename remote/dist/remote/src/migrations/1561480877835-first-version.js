"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
class FirstVersion1561480877835 {
    async up(queryRunner) {
        await this._createTables(queryRunner);
    }
    async down(queryRunner) {
        await queryRunner.dropTable('admins', true, true);
        await queryRunner.dropTable('servers_sessions', true, true);
        await queryRunner.dropTable('servers', true, true);
    }
    async _createTables(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
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
        }), true);
        await queryRunner.createTable(new typeorm_1.Table({
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
        }), true);
        await queryRunner.createTable(new typeorm_1.Table({
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
        }), true);
    }
}
exports.FirstVersion1561480877835 = FirstVersion1561480877835;
//# sourceMappingURL=1561480877835-first-version.js.map