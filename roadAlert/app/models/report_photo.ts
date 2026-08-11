import { ReportPhotoSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Report from '#models/report'

export default class ReportPhoto extends ReportPhotoSchema {
  @belongsTo(() => Report)
  declare report: BelongsTo<typeof Report>
}
