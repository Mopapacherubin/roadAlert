const form = document.querySelector('[data-otp-form]')

if (form) {
  const digits = [...form.querySelectorAll('[data-otp-digit]')]
  const value = form.querySelector('[data-otp-value]')
  const sync = () => {
    value.value = digits.map((input) => input.value).join('')
  }

  digits.forEach((input, index) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '').slice(-1)
      sync()
      if (input.value && digits[index + 1]) digits[index + 1].focus()
    })
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Backspace' && !input.value && digits[index - 1]) digits[index - 1].focus()
    })
    input.addEventListener('paste', (event) => {
      event.preventDefault()
      const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
      pasted.split('').forEach((digit, digitIndex) => { if (digits[digitIndex]) digits[digitIndex].value = digit })
      sync()
      digits[Math.min(pasted.length, digits.length) - 1]?.focus()
    })
  })
}
