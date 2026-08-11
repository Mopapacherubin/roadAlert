import vine from '@vinejs/vine'

/**
 * Shared rules for email and password.
 */
const email = () => vine.string().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(32)

/**
 * Validator to use when performing self-signup
 */
export const signupValidator = vine.create({
  fullName: vine.string().nullable(),
  email: email().trim().unique({ table: 'users', column: 'email' }),
  password: password()
    .minLength(12)
    .maxLength(30)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .confirmed({
      confirmationField: 'passwordConfirmation',
    }),
})

export const confirmOtpValidator = vine.create({
  otp: vine
    .string()
    .trim()
    .regex(/^\d{6}$/),
})
