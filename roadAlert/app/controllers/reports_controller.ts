// app/controllers/reports_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import Report from '#models/report'
import ReportPhoto from '#models/report_photo'
import ReportStatusHistory from '#models/report_status_history'
import {
  listReportValidator,
  createReportValidator,
  updateReportStatusValidator,
  addReportPhotosValidator,
} from '#validators/report'

export default class ReportsController {
  /**
   * GET /reports
   * Liste les signalements avec filtres optionnels (statut, zone GPS)
   * et restriction automatique par rôle.
   */
  async index({ request, auth, response }: HttpContext) {
    // 1. Valider les paramètres de requête (query string)
    const { status, page = 1, perPage = 20, lat, lng, radius } = await request.validateUsing(
      listReportValidator
    )

    // 2. Requête de base avec préchargement des relations
    const query = Report.query().preload('photos').preload('user')

    // 3. Filtre par statut, seulement si fourni
    if (status) {
      query.where('status', status)
    }

    // 4. Filtre géographique par boîte englobante (approximation du rayon)
    if (lat !== undefined && lng !== undefined && radius !== undefined) {
      const latDelta = radius / 111
      const lngDelta = radius / (111 * Math.cos((lat * Math.PI) / 180))

      query
        .whereBetween('latitude', [lat - latDelta, lat + latDelta])
        .whereBetween('longitude', [lng - lngDelta, lng + lngDelta])
    }

    // 5. Un citoyen ne voit que ses propres signalements
    //    (sécurité appliquée côté serveur, jamais confiée au client)
    const user = auth.user!
    if (user.role === 'citoyen') {
      query.where('user_id', user.id)
    }

    // 6. Tri du plus récent au plus ancien + pagination
    const reports = await query.orderBy('created_at', 'desc').paginate(page, perPage)

    return response.ok(reports)
  }

  /**
   * POST /reports
   * Crée un nouveau signalement, avec photos optionnelles,
   * et initialise son historique de suivi.
   */
  async store({ request, auth, response }: HttpContext) {
    // 1. L'utilisateur connecté est toujours le propriétaire (jamais fourni par le client)
    const user = auth.user!

    // 2. Validation des données entrantes
    const payload = await request.validateUsing(createReportValidator)
    const photos = payload.photos

    // 3. Création du signalement, statut initial fixe
    const report = await Report.create({
      userId: user.id,
      title: payload.title,
      description: payload.description,
      latitude: payload.latitude,
      longitude: payload.longitude,
      status: 'nouveau',
    })

    // 4. Traitement des photos si présentes
    if (photos && photos.length > 0) {
      for (const photo of photos) {
        // Nom de fichier unique pour éviter toute collision
        const fileName = `${cuid()}.${photo.extname}`
        await photo.move(app.makePath('storage/uploads/reports'), { name: fileName })

        await ReportPhoto.create({
          reportId: report.id,
          filePath: `uploads/reports/${fileName}`,
        })
      }
    }

    // 5. Historique initial : trace la création du signalement
    await ReportStatusHistory.create({
      reportId: report.id,
      changedBy: user.id,
      oldStatus: null,
      newStatus: 'nouveau',
      comment: 'Signalement créé',
    })

    // 6. Réponse avec relations chargées
    await report.load('photos')
    await report.load('statusHistory')

    return response.created(report)
  }

  /**
   * GET /reports/:id
   * Affiche le détail d'un signalement (accès ouvert à tout utilisateur
   * authentifié, dans un esprit de transparence civique).
   */
  async show({ params, response }: HttpContext) {
    const report = await Report.query()
      .where('id', params.id)
      .preload('photos')
      .preload('user')
      .preload('statusHistory')
      .firstOrFail() // lève une 404 automatique si l'id n'existe pas

    return response.ok(report)
  }

  /**
   * PATCH /reports/:id/status
   * Change le statut d'un signalement (réservé agents/admin via middleware).
   * Utilise une transaction pour garantir que la mise à jour du statut
   * et la création de l'historique réussissent ou échouent ensemble.
   */
  async updateStatus({ params, request, auth, response }: HttpContext) {
    const user = auth.user! // rôle déjà vérifié en amont par le middleware

    // Validation du nouveau statut + commentaire optionnel
    const { status: newStatus, commentaire } = await request.validateUsing(
      updateReportStatusValidator
    )

    const report = await db.transaction(async (trx) => {
      // Récupération du signalement dans la transaction
      const report = await Report.findOrFail(params.id, { client: trx })
      const oldStatus = report.status // capturé AVANT modification

      // Mise à jour du statut
      report.status = newStatus
      await report.useTransaction(trx).save()

      // Création de la trace d'historique, dans la même transaction
      await ReportStatusHistory.create(
        {
          reportId: report.id,
          changedBy: user.id,
          oldStatus,
          newStatus,
          comment: commentaire ?? null,
        },
        { client: trx }
      )

      return report
    })

    return response.ok(report)
  }

  /**
   * DELETE /reports/:id
   * Supprime un signalement, uniquement si :
   * - c'est le propriétaire qui fait la demande
   * - le signalement est encore au statut "nouveau" (pas encore traité)
   * Les photos et l'historique liés sont supprimés en cascade (migration).
   */
  async destroy({ params, auth, response }: HttpContext) {
    const user = auth.user!
    const report = await Report.findOrFail(params.id)

    if (report.userId !== user.id) {
      return response.forbidden({ message: "Vous n'êtes pas l'auteur de ce signalement" })
    }

    if (report.status !== 'nouveau') {
      return response.badRequest({
        message: 'Impossible de supprimer un signalement déjà en cours de traitement',
      })
    }

    await report.delete()

    return response.noContent()
  }

  /**
   * POST /reports/:id/photos
   * Ajoute une ou plusieurs photos à un signalement existant.
   */
  async storePhoto({ params, request, auth, response }: HttpContext) {
    const user = auth.user!
    const report = await Report.findOrFail(params.id)

    // Seul le propriétaire peut compléter son signalement
    if (report.userId !== user.id) {
      return response.forbidden({ message: "Vous n'êtes pas l'auteur de ce signalement" })
    }

    // On bloque l'ajout de photo si le signalement est déjà clos
    if (report.status === 'resolu' || report.status === 'rejete') {
      return response.badRequest({
        message: 'Impossible d\'ajouter une photo à un signalement déjà clos',
      })
    }

    const { photos } = await request.validateUsing(addReportPhotosValidator)

    // Limite le nombre total de photos par signalement (ex : 5 max)
    const existingCount = await ReportPhoto.query().where('report_id', report.id).count('* as total')
    const currentTotal = Number(existingCount[0].$extras.total)

    if (currentTotal + photos.length > 5) {
      return response.badRequest({ message: 'Maximum 5 photos par signalement' })
    }

    const createdPhotos: ReportPhoto[] = []

    for (const photo of photos) {
      const fileName = `${cuid()}.${photo.extname}`
      await photo.move(app.makePath('storage/uploads/reports'), { name: fileName })

      const reportPhoto = await ReportPhoto.create({
        reportId: report.id,
        filePath: `uploads/reports/${fileName}`,
      })

      createdPhotos.push(reportPhoto)
    }

    return response.created(createdPhotos)
  }

  /**
   * DELETE /reports/:id/photos/:photoId
   * Supprime une photo précise d'un signalement.
   */
  async destroyPhoto({ params, auth, response }: HttpContext) {
    const user = auth.user!
    const report = await Report.findOrFail(params.id)

    if (report.userId !== user.id) {
      return response.forbidden({ message: "Vous n'êtes pas l'auteur de ce signalement" })
    }

    const photo = await ReportPhoto.query()
      .where('id', params.photoId)
      .where('report_id', report.id) // s'assure que la photo appartient bien à ce signalement
      .firstOrFail()

    await photo.delete()

    return response.noContent()
  }

  /**
   * GET /reports/:id/history
   * Retourne l'historique complet des changements de statut d'un signalement.
   */
  async history({ params, response }: HttpContext) {
    const report = await Report.findOrFail(params.id)
    await report.load('statusHistory', (query) => query.orderBy('created_at', 'asc'))

    return response.ok(report.statusHistory)
  }
}