import mail from '@adonisjs/mail/services/main'

export default class EmailService {
  async sendOtp(email: string, otp: number) {
    await mail.send((message) => {
      message
        .to(email)
        .subject('Votre code de vérification RoadAlert')
        .text(
          `Votre code de vérification RoadAlert est : ${otp}. Il expire dans 10 minutes. Ne le partagez avec personne.`
        )
        .html(
          `<p>Votre code de vérification RoadAlert est :</p><p><strong style="font-size: 24px; letter-spacing: 4px;">${otp}</strong></p><p>Il expire dans 10 minutes. Ne le partagez avec personne.</p>`
        )
    })
  }
}
