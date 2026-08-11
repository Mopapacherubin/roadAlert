import User from '#models/user'
import { confirmOtpValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class ConfirmOtpsController {
  async create({ view, response, session }: HttpContext) {
    if (!session.has('pendingVerificationEmail')) {
      return response.redirect().toRoute('new_account.create')
    }

    return view.render('pages/auth/confirm_otp')
  }

  async store({ request, response, auth, session }: HttpContext) {
    const { otp } = await request.validateUsing(confirmOtpValidator)
    const email = session.get('pendingVerificationEmail')

    if (typeof email !== 'string') {
      return response.redirect().toRoute('new_account.create')
    }

    const user = await User.query().where('email', email).where('otp', Number(otp)).first()

    if (!user) {
      session.flash('error', 'Le code de vérification est incorrect.')
      return response.redirect().back()
    }

    if (!user.otpExpiresAt || user.otpExpiresAt < DateTime.now()) {
      session.flash('error', 'Le code de vérification a expiré.')
      return response.redirect().back()
    }

    user.isVerified = true
    user.emailVerifiedAt = DateTime.now()
    user.otp = null
    user.otpExpiresAt = null
    await user.save()

    session.forget('pendingVerificationEmail')
    await auth.use('web').login(user)
    session.flash('success', 'Adresse e-mail vérifiée. Vous êtes maintenant connecté.')

    return response.redirect().toRoute('home')
  }
}
