import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    await this.db.rawQuery(`
      ALTER TABLE ${this.tableName}
      ALTER COLUMN email_verified_at TYPE timestamp
        USING NULLIF(email_verified_at, '')::timestamp
    `)
  }

  async down() {
    await this.db.rawQuery(`
      ALTER TABLE ${this.tableName}
      ALTER COLUMN email_verified_at TYPE varchar
        USING email_verified_at::varchar
    `)
  }
}
