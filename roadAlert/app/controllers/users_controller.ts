import Report from '#models/report'
import User from '#models/user'
import { listUsersValidator, updateUserValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
    async index({ request, response }: HttpContext) {
        const payload = await request.validateUsing(listUsersValidator)
        const query = User.query()
        if (payload.role) {
            query.where('role', payload.role)
        }

        if (payload.active !== undefined) {
            query.where('is_active', payload.active)
        }

        if (payload.search) {
            query.where((builder)=> {
                builder.whereILike('full_name', `%${payload.search}%`)
                .orWhereILike('email', `%${payload.search}%`)
            })
        }

        const page = payload.page ?? 1
        const perPage = payload.perPage ?? 20

        const users = await query.orderBy('created_at', 'desc').paginate(page, perPage)
        return response.ok(users)
    }

    async show({ params, response }: HttpContext) {
        const user = await User.query().where('id', params.id).preload('reports').firstOrFail()
        return response.ok(user)
    }

    async updateRole({ params, request, response, auth }: HttpContext) {
        const { role : newRole} = await request.validateUsing(updateUserValidator)
        const targetUser = await User.findOrFail(params.id)

        if (targetUser.id === auth.user?.id && newRole !== 'admin') {
            return response.badRequest({ message: 'You cannot change your own role to a non-admin role.' })
        }

        if (targetUser.role === 'admin' && newRole !== 'admin') {
            const adminCount = await User.query().where('role', 'admin').count('* as total')
            const totalAdmins = Number(adminCount[0].$extras.total)
            
            if (totalAdmins <= 1) {
                return response.badRequest({ message: 'You cannot change the role of the last admin user.' })
            }
        }
        
        targetUser.role = newRole
        await targetUser.save()

        return response.ok(targetUser)
    }

    async disable({ params, response, auth }: HttpContext) {
        const targetUser = await User.findOrFail(params.id)

        if(targetUser.id === auth.user?.id) {
            return response.badRequest({ message: 'You cannot disable your own account.' })
        }

        targetUser.isActive = false
        await targetUser.save()

        return response.ok(targetUser)
    }

    async destroy({ params, response, auth }: HttpContext) {
        const targetUser = await User.findOrFail(params.id)

        if(targetUser.id === auth.user?.id) {
            return response.badRequest({ message: 'You cannot delete your own account.' })
        }

        const reportsCount = await Report.query().where('user_id', targetUser.id).count('* as total')
        const totalReports = Number(reportsCount[0].$extras.total)

        if(totalReports > 0) {
            return response.badRequest({ message: 'You cannot delete a user who has submitted reports.' })
        }

        await targetUser.delete()
        return response.noContent()
    }
            
}