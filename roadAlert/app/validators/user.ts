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
    .minLength(10)
    .maxLength(30)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/),
  passwordConfirmation: vine.string().sameAs('password'),
})

export const confirmOtpValidator = vine.create({
  otp: vine
    .string()
    .trim()
    .regex(/^\d{6}$/),
})

export const listUsersValidator = vine.create(
  vine.object({
    active: vine.boolean().optional(),
    page: vine.number().optional(),
    perPage: vine.number().positive().max(100).optional(),
    role: vine.enum(['agent', 'citoyen', 'admin']).optional(),
    search: vine.string().optional(),
})
)

export const updateUserValidator = vine.create(
  vine.object({
    role: vine.enum(['agent', 'citoyen', 'admin']),
  })
)



