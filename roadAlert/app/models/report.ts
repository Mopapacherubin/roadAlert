import { ReportSchema } from '#database/schema'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import ReportPhoto from '#models/report_photo'
import ReportStatusHistory from '#models/report_status_history'
import User from '#models/user'

export default class Report extends ReportSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => ReportPhoto)
  declare photos: HasMany<typeof ReportPhoto>

  @hasMany(() => ReportStatusHistory)
  declare statusHistories: HasMany<typeof ReportStatusHistory>
}
