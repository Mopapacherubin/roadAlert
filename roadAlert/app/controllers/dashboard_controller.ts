import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Report from '#models/report'
import User from '#models/user'
import ReportStatusHistory from '#models/report_status_history'

export default class DashboardController {
    async stats({ response }: HttpContext) {
        const [ reportsByStatus, usersByRole, recentReports, avgResolutionTime ] = await Promise.all([
            this.getReportsByStatus(),
            this.getUsersByRole(),
            this.getRecentReports(),
            this.getAverageResolutionTime()
        ])
        
        return response.ok({
            reportsByStatus,
            usersByRole,
            recentReports,
            avgResolutionTime
        })
    }

    private async getReportsByStatus() {
        const rows = await Report.query()
            .select('status')
            .count('* as count')
            .groupBy('status')

        const result: Record<string, number> = {
            nouveau: 0,
            en_cours: 0,
            resolu: 0,
            rejete: 0
        }

        for (const row of rows) {
            const status = row.status
            if (!status) continue
            result[status] = Number(row.$extras.count)
        }
        return result
    }

    private async getUsersByRole() {
        const rows = await User.query()
            .select('role')
            .count('* as count')
            .groupBy('role')

        const result: Record<string, number> = {
            agent: 0,
            citoyen: 0,
            admin: 0
        }
        for (const row of rows) {
            const role = row.role
            if (!role) continue
            result[role] = Number(row.$extras.count)
        }
        return result
    }

    private async getRecentReports() {
        const sevenDaysAgo = DateTime.now().minus({ days: 7 }).toSQL()
        const count = await Report.query()
            .where('created_at', '>=', sevenDaysAgo)
            .count('* as total')

        return Number(count[0].$extras.total)
    }

    private async getAverageResolutionTime() {
        const resolvedEntries = await ReportStatusHistory.query()
            .where('new_status', 'resolu')
            .preload('report')
        
        if (resolvedEntries.length === 0) {
            return null
        }

        let totalHours = 0
        let countValid = 0

        for (const entry of resolvedEntries) {
            const createdAt = entry.report?.createdAt
            const resolvedAt = entry.createdAt

            if (!createdAt || !resolvedAt) {
                continue
            }

            const hoursDiff = resolvedAt.diff(createdAt, 'hours').hours
            if (hoursDiff >= 0) {
                totalHours += hoursDiff
                countValid++
            }
        }

        if (countValid === 0) {
            return null
        }

        return Math.round((totalHours / countValid) * 10) / 10
    }
}