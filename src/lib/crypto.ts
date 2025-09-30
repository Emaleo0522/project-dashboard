import CryptoJS from 'crypto-js'
import bcrypt from 'bcryptjs'

// Tipos para las credenciales
export interface Credential {
  id: string
  project_id: string
  credential_type: string
  credential_name: string
  encrypted_value: string
  iv: string
  description?: string
  created_at: string
  updated_at: string
}

export interface DecryptedCredential {
  id: string
  project_id: string
  credential_type: string
  credential_name: string
  value: string
  description?: string
  created_at: string
  updated_at: string
}

// Tipos de credenciales disponibles
export const CREDENTIAL_TYPES = {
  GITHUB_TOKEN: 'github_token',
  API_KEY: 'api_key',
  ANON_PUBLIC: 'anon_public',
  PRIVATE_KEY: 'private_key',
  DATABASE_URL: 'database_url',
  SECRET_KEY: 'secret_key',
  ACCESS_TOKEN: 'access_token',
  OTHER: 'other'
} as const

export type CredentialType = typeof CREDENTIAL_TYPES[keyof typeof CREDENTIAL_TYPES]

// Función para verificar la contraseña maestra
export async function verifyMasterPassword(inputPassword: string, storedHash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(inputPassword, storedHash)
  } catch (error) {
    console.error('Error verifying master password:', error)
    return false
  }
}

// Función para generar hash de la contraseña maestra
export async function hashMasterPassword(password: string): Promise<string> {
  try {
    const saltRounds = 12
    return await bcrypt.hash(password, saltRounds)
  } catch (error) {
    console.error('Error hashing master password:', error)
    throw error
  }
}


// Función para cifrar una credencial
export function encryptCredential(value: string, masterPassword: string): { encrypted: string; iv: string } {
  try {
    // Generar IV aleatorio
    const iv = CryptoJS.lib.WordArray.random(16)

    // Derivar clave de cifrado
    const salt = CryptoJS.lib.WordArray.random(16)
    const key = CryptoJS.PBKDF2(masterPassword, salt, {
      keySize: 256 / 32,
      iterations: 10000
    })

    // Cifrar el valor
    const encrypted = CryptoJS.AES.encrypt(value, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })

    // Combinar salt + iv + encrypted para almacenar
    const combined = salt.concat(iv).concat(encrypted.ciphertext)

    return {
      encrypted: CryptoJS.enc.Base64.stringify(combined),
      iv: CryptoJS.enc.Base64.stringify(iv)
    }
  } catch (error) {
    console.error('Error encrypting credential:', error)
    throw new Error('Failed to encrypt credential')
  }
}

// Función para descifrar una credencial
export function decryptCredential(encryptedValue: string, masterPassword: string): string {
  try {
    // Decodificar de Base64
    const combined = CryptoJS.enc.Base64.parse(encryptedValue)

    // Extraer salt (primeros 16 bytes)
    const salt = CryptoJS.lib.WordArray.create(combined.words.slice(0, 4))

    // Extraer IV (siguientes 16 bytes)
    const iv = CryptoJS.lib.WordArray.create(combined.words.slice(4, 8))

    // Extraer texto cifrado (resto)
    const ciphertext = CryptoJS.lib.WordArray.create(combined.words.slice(8))

    // Derivar la misma clave
    const key = CryptoJS.PBKDF2(masterPassword, salt, {
      keySize: 256 / 32,
      iterations: 10000
    })

    // Descifrar
    const decrypted = CryptoJS.AES.decrypt(
      CryptoJS.enc.Base64.stringify(ciphertext),
      key,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    )

    return decrypted.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    console.error('Error decrypting credential:', error)
    throw new Error('Failed to decrypt credential')
  }
}

// Función para validar si una cadena es una credencial válida
export function validateCredentialValue(type: CredentialType, value: string): { isValid: boolean; message?: string } {
  if (!value || value.trim().length === 0) {
    return { isValid: false, message: 'La credencial no puede estar vacía' }
  }

  switch (type) {
    case CREDENTIAL_TYPES.GITHUB_TOKEN:
      if (!value.startsWith('ghp_') && !value.startsWith('github_pat_')) {
        return { isValid: false, message: 'Token de GitHub debe empezar con "ghp_" o "github_pat_"' }
      }
      break

    case CREDENTIAL_TYPES.API_KEY:
      if (value.length < 10) {
        return { isValid: false, message: 'API Key debe tener al menos 10 caracteres' }
      }
      break

    case CREDENTIAL_TYPES.DATABASE_URL:
      try {
        new URL(value)
      } catch {
        return { isValid: false, message: 'Database URL debe ser una URL válida' }
      }
      break

    case CREDENTIAL_TYPES.PRIVATE_KEY:
      if (!value.includes('-----BEGIN') || !value.includes('-----END')) {
        return { isValid: false, message: 'Private Key debe incluir los marcadores BEGIN/END' }
      }
      break
  }

  return { isValid: true }
}

// Función para obtener el nombre amigable del tipo de credencial
export function getCredentialTypeName(type: CredentialType): string {
  const names: Record<CredentialType, string> = {
    [CREDENTIAL_TYPES.GITHUB_TOKEN]: 'Token de GitHub',
    [CREDENTIAL_TYPES.API_KEY]: 'API Key',
    [CREDENTIAL_TYPES.ANON_PUBLIC]: 'Clave Pública Anónima',
    [CREDENTIAL_TYPES.PRIVATE_KEY]: 'Clave Privada',
    [CREDENTIAL_TYPES.DATABASE_URL]: 'URL de Base de Datos',
    [CREDENTIAL_TYPES.SECRET_KEY]: 'Clave Secreta',
    [CREDENTIAL_TYPES.ACCESS_TOKEN]: 'Token de Acceso',
    [CREDENTIAL_TYPES.OTHER]: 'Otro'
  }

  return names[type] || type
}