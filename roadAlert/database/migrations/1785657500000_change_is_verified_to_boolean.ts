import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    await this.db.rawQuery(`
      ALTER TABLE ${this.tableName}
      ALTER COLUMN is_verified DROP DEFAULT,
      ALTER COLUMN is_verified TYPE boolean
        USING CASE WHEN email_verified_at IS NULL THEN false ELSE true END,
      ALTER COLUMN is_verified SET DEFAULT false
    `)
  }

  async down() {
    await this.db.rawQuery(`
      ALTER TABLE ${this.tableName}
      ALTER COLUMN is_verified DROP DEFAULT,
      ALTER COLUMN is_verified TYPE date
        USING CURRENT_DATE
    `)
  }
}
