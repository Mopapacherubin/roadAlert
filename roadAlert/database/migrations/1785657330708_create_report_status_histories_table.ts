import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'report_status_histories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('report_id').unsigned().references('id').inTable('reports').onDelete('CASCADE')
      table.integer('changed_by').unsigned().references('id').inTable('users')
      table.string('old_status').nullable()
      table.string('new_status').notNullable()
      table.text('comment').nullable()
      table.timestamp('created_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}