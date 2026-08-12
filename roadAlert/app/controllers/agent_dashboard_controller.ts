import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Report from '#models/report'
import ReportStatusHistory from '#models/report_status_history'

export default class AgentDashboardController {
  public async index({ view, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.redirect().toRoute('session.create')
    }

    if (user.role !== 'agent' && user.role !== 'admin') {
      return response.redirect().toRoute('home')
    }

    // Reports by status
    const rows = await Report.query().select('status').count('* as count').groupBy('status')
    const reportsByStatus: Record<string, number> = {
      nouveau: 0,
      en_cours: 0,
      resolu: 0,
      rejete: 0,
    }
    for (const row of rows) {
      const status = row.status
      if (!status) continue
      reportsByStatus[status] = Number(row.$extras.count)
    }

    // Recent reports (7 days)
    const sevenDaysAgo = DateTime.now().minus({ days: 7 }).toSQL()
    const recentCount = await Report.query().where('created_at', '>=', sevenDaysAgo).count('* as total')
    const recentReports = Number(recentCount[0].$extras.total)

    // Average resolution time (hours)
    const resolvedEntries = await ReportStatusHistory.query().where('new_status', 'resolu').preload('report')
    let avgResolutionTime: number | null = null
    if (resolvedEntries.length > 0) {
      let totalHours = 0
      let countValid = 0
      for (const entry of resolvedEntries) {
        const createdAt = entry.report?.createdAt
        const resolvedAt = entry.createdAt
        if (!createdAt || !resolvedAt) continue
        const hoursDiff = resolvedAt.diff(createdAt, 'hours').hours
        if (hoursDiff >= 0) {
          totalHours += hoursDiff
          countValid++
        }
      }
      if (countValid > 0) avgResolutionTime = Math.round((totalHours / countValid) * 10) / 10
    }

    // Recent reports list
    const query = Report.query().preload('photos').preload('user').orderBy('created_at', 'desc')
    if (user.role === 'citoyen') {
      query.where('user_id', user.id)
    }
    const reports = await query.limit(20)

    return view.render('pages/dashboard', { reportsByStatus, recentReports, avgResolutionTime, reports })
  }
}
