import User from '#models/user'
import EmailService from '#services/email_service'
import generateOtp from '#services/otp_service'
import { signupValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class NewAccountController {
  async create({ view }: HttpContext) {
    return view.render('pages/auth/signup')
  }

  async store({ request, response, session }: HttpContext) {
    const { passwordConfirmation: _passwordConfirmation, ...userPayload } =
      await request.validateUsing(signupValidator)
    const otp = generateOtp()
    const otpExpiresAt = DateTime.now().plus({ minutes: 10 })
    const user = await User.create({
      ...userPayload,
      isVerified: false,
      otp,
      otpExpiresAt,
    })

    session.put('pendingVerificationEmail', user.email)
    await new EmailService().sendOtp(user.email, otp)

    return response.redirect().toRoute('verifyOtp')
  }
}
