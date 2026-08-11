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

const ConfirmOtpsController = () => import('#controllers/confirm_otps_controller')
const ReportsController = () => import('#controllers/reports_controller')

router.on('/').render('pages/home').as('home')

router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('confirm-otp', [ConfirmOtpsController, 'create']).as('verifyOtp')
    router.post('confirm-otp', [ConfirmOtpsController, 'store']).as('confirmOtp')

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])
  })
  .use(middleware.guest())

router
  .group(() => {
    router.post('logout', [controllers.Session, 'destroy'])

    // Signalements
    router.get('reports', [ReportsController, 'index'])
    router.post('reports', [ReportsController, 'store'])
    router.get('reports/:id', [ReportsController, 'show'])
    router.delete('reports/:id', [ReportsController, 'destroy'])
    router.get('reports/:id/history', [ReportsController, 'history'])

    // Photos de signalements
    router.post('reports/:id/photos', [ReportsController, 'storePhoto'])
    router.delete('reports/:id/photos/:photoId', [ReportsController, 'destroyPhoto'])

    // Changement de statut d'un signalement
    router.patch('reports/:id/status', [ReportsController, 'updateStatus'])
    .use(middleware.role(['admin', 'agent']))
  })
  .use(middleware.auth())

  // Routes admin - accessible uniquement aux utilisateurs avec le rôle "admin"
  router
  .group(() => { 
    router.get('users', [controllers.Users, 'index'])