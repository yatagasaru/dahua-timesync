import { join, dirname } from "node:path"

const loadEnv = async () => {
  const envPath = join(dirname(process.execPath), ".env")
  const file = Bun.file(envPath)

  if (!(await file.exists())) return

  const content = await file.text()

  for (const line of content.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue

    const eqIndex = trimmed.indexOf("=")
    if (eqIndex === -1) continue

    const key = trimmed.slice(0, eqIndex).trim()
    const value = trimmed.slice(eqIndex + 1).trim()

    if (key && !(key in process.env)) {
      process.env[key] = value
    }
  }
}

const formatDate = (date: Date) => {
  const d = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
  const t = date.toTimeString().split(" ")[0]
  
  return `${d} ${t}`
}

const log = (...value: string[]) => {
  const logStr =  [`${formatDate(new Date())} - `]

  console.log(logStr.concat(value).join(""))
}

const encrypt = (username:string, password:string, realm:string, random:string) => {
  const phrase = `${username}:${realm}:${password}`
  const hash = new Bun.CryptoHasher("md5")
      .update(phrase).digest("hex").toUpperCase()

  const passPhrase = `${username}:${random}:${hash}`
  const passHash = new Bun.CryptoHasher("md5")
      .update(passPhrase).digest("hex").toUpperCase()

  return passHash
}

export { formatDate, log, encrypt, loadEnv }