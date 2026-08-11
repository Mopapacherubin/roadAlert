import vine from '@vinejs/vine'

export const listReportValidator = vine.create(
    vine.object({
        status: vine.enum(['nouveau', 'en_cours', 'resolu', 'rejete']).optional(),
        page: vine.number().positive().optional(),
        perPage: vine.number().positive().max(100).optional(),
        lat: vine.number().range([-90, 90]).optional(),
        lng: vine.number().range([-90,90]).optional(),
        radius: vine.number().positive().max(50).optional(),
    })
)

export const createReportValidator = vine.create(
    vine.object({
        title: vine.string().trim().minLength(10).maxLength(30),
        description: vine.string().trim().minLength(10).maxLength(500),
        latitude: vine.number().range([-90, 90]),
        longitude: vine.number().range([-180, 180]),
        photos: vine
      .array(
        vine.file({
          size: '5mb',
          extnames: ['jpg', 'jpeg', 'png', 'webp'],
        })
      )
      .optional(),
  })
)

export const updateReportStatusValidator = vine.create(
    vine.object({
        status: vine.enum(['nouveau', 'en_cours', 'resolu', 'rejete']),
        commentaire: vine.string().trim().maxLength(300).optional(),
    })
)

export const addReportPhotosValidator = vine.create(
    vine.object({
        photos: vine.array(
            vine.file({
                size: '5mb',
                extnames: ['jpg', 'jpeg', 'png', 'webp'],
            })
        )
    })
)