import {Column, MigrationInterface, QueryRunner, TableColumn, TableForeignKey} from "typeorm";

export default class AddCategoryIdToTransactions1604936962207 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.addColumn('transactions', new TableColumn({
        name: 'category_id',
        type: 'uuid',
        isNullable: true
      }));

      await queryRunner.createForeignKey('transactions', new TableForeignKey({
        referencedTableName: 'categories',
        columnNames: ['category_id'],
        referencedColumnNames: ['id'],
        name: 'category',
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

      await queryRunner.dropForeignKey('transactions', 'categories');
      await queryRunner.dropColumn('transactions', 'category_id');
    }

}
