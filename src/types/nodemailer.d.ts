declare module 'nodemailer' {
  interface TransportOptions {
    host?: string
    port?: number
    auth?: {
      user: string
      pass: string
    }
    secure?: boolean
    requireTLS?: boolean
  }

  interface MailOptions {
    from: string
    to: string
    subject: string
    text?: string
    html?: string
  }

  interface SendMailResult {
    messageId: string
    rejected: string[]
    pending: string[]
    accepted: string[]
  }

  interface Transporter {
    verify(): Promise<boolean>
    sendMail(options: MailOptions): Promise<SendMailResult>
  }

  function createTransport(options: TransportOptions): Transporter

  export { createTransport, TransportOptions, MailOptions, SendMailResult, Transporter }
  export default { createTransport }
}
