// Création d'une fonction random pour générer OTP aleatoire
export default function generateOtp(){
    return Math.floor(100000 + Math.random() * 900000)
}