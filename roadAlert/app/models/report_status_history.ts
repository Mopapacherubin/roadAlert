import { ReportStatusHistorySchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Report from '#models/report'
import User from '#models/user'

export default class ReportStatusHistory extends ReportStatusHistorySchema {
  @belongsTo(() => Report)
  declare report: BelongsTo<typeof Report>

  @belongsTo(() => User, { foreignKey: 'changedBy' })
  declare changedByUser: BelongsTo<typeof User>
}
