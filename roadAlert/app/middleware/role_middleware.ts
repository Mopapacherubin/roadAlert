import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class RoleMiddleware {
  async handle(ctx: HttpContext, next: NextFn, allowedRoles: string[]) {
    /**
     * Middleware logic goes here (before the next call)
     */
    const{ auth, response } = ctx

    if(!auth.user) {
      return response.unauthorized({ message: 'Access denied. You must be authenticated to access this resource.' })
    }
    
    const user = auth.user

    if(!allowedRoles.includes(user.role)) {
      return response.forbidden({ message: 'Access denied. You do not have the required role to access this resource.' })
    }

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}