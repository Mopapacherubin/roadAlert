/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'

const UserController = () => import('#controllers/users_controller')
const DashboardController = () => import('#controllers/dashboard_controller')
const AgentDashboardController = () => import('#controllers/agent_dashboard_controller')
const ReportsController = () => import('#controllers/reports_controller')

router.on('/').render('pages/home').as('home')

router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('confirmOtp', [controllers.NewAccount, 'create']).as('verifyOtp')
    router.post('confirmOtp', [controllers.NewAccount, 'store']).as('confirmOtp')

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])
  })
  .use(middleware.guest())

router
  .group(() => {
    router.post('logout', [controllers.Session, 'destroy'])

    // Signalements routes
    router.get('reports', [ReportsController, 'index'])
    router.get('dashboard', [AgentDashboardController, 'index'])
    router.post('reports', [ReportsController, 'store'])
    router.get('reports/:id', [ReportsController, 'show'])
    router.delete('reports/:id', [ReportsController, 'destroy'])
    router.get('reports/:id/history', [ReportsController, 'history'])

    // Photos d'un signalement
    router.post('reports/:id/photos', [ReportsController, 'storePhoto'])
    router.delete('reports/:id/photos/:photoId', [ReportsController, 'destroyPhoto'])

    // Changement de statut d'un signalement
    router.patch('reports/:id/status', [ReportsController, 'updateStatus'])
    .use(middleware.role(['agent', 'admin']))
  })
  .use(middleware.auth())

router
  .group(() => {
    // Gestion des utilisateurs (admin uniquement)
    router.get('users', [UserController, 'index'])
    router.get('users/:id', [UserController, 'show'])
    router.patch('users/:id/role', [UserController, 'updateRole'])
    router.patch('users/:id/disable', [UserController, 'disable'])
    router.delete('users/:id', [UserController, 'destroy'])

    // Dashboard stats
    router.get('dashboard/stats', [DashboardController, 'stats'])
  })
  .prefix('/admin')
  .use([middleware.auth(), middleware.role(['admin'])])


