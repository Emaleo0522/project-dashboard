'use client'

import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase'
import {
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Copy,
  Shield,
  Key,
  Database,
  Code,
  Globe,
  AlertTriangle,
  Save,
  X
} from 'lucide-react'
import {
  encryptCredential,
  decryptCredential,
  verifyMasterPassword,
  validateCredentialValue,
  getCredentialTypeName,
  CREDENTIAL_TYPES,
  type DecryptedCredential,
  type CredentialType
} from '@/lib/crypto'
import { useAuth } from './AuthProvider'

interface CredentialsVaultProps {
  projectId: string
  onUpdate?: () => void
}

interface NewCredential {
  type: CredentialType
  name: string
  value: string
  description: string
}

export default function CredentialsVault({ projectId, onUpdate }: CredentialsVaultProps) {
  const { } = useAuth()
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [masterPassword, setMasterPassword] = useState('')
  const [credentials, setCredentials] = useState<DecryptedCredential[]>([])
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [revealedCredentials, setRevealedCredentials] = useState<Set<string>>(new Set())
  const [masterPasswordHash, setMasterPasswordHash] = useState('')
  const [hasUserVault, setHasUserVault] = useState(false)

  const [newCredential, setNewCredential] = useState<NewCredential>({
    type: CREDENTIAL_TYPES.API_KEY,
    name: '',
    value: '',
    description: ''
  })

  // Cargar hash de contraseña maestra al montar el componente
  useEffect(() => {
    fetchMasterPasswordHash()
  }, [])

  const fetchMasterPasswordHash = async () => {
    try {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('vault_master_password')
        .select('password_hash')

      if (error) {
        // Usuario no tiene vault configurado
        if (error.code === 'PGRST116') {
          setHasUserVault(false)
          return
        }
        throw error
      }

      if (data && data.length > 0) {
        setMasterPasswordHash(data[0].password_hash)
        setHasUserVault(true)
      } else {
        setHasUserVault(false)
      }
    } catch (error) {
      console.error('Error fetching master password hash:', error)
      setHasUserVault(false)
    }
  }

  const createUserVault = async (password: string) => {
    try {
      const supabase = getSupabase()
      const bcrypt = await import('bcryptjs')

      const saltRounds = 12
      const salt = await bcrypt.genSalt(saltRounds)
      const passwordHash = await bcrypt.hash(password, salt)

      const { error } = await supabase
        .from('vault_master_password')
        .insert([{
          password_hash: passwordHash,
          salt: salt
        }])

      if (error) throw error

      setMasterPasswordHash(passwordHash)
      setHasUserVault(true)
      return true
    } catch (error) {
      console.error('Error creating user vault:', error)
      return false
    }
  }

  const handleCreateVault = async () => {
    if (!masterPassword.trim() || masterPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    try {
      const success = await createUserVault(masterPassword)
      if (success) {
        setIsUnlocked(true)
        setCredentials([])
        alert('Vault creado exitosamente')
      } else {
        alert('Error al crear el vault')
      }
    } catch (error) {
      console.error('Error creating vault:', error)
      alert('Error al crear el vault')
    } finally {
      setLoading(false)
    }
  }

  const handleUnlock = async () => {
    if (!masterPassword.trim()) return

    setLoading(true)
    try {
      const isValid = await verifyMasterPassword(masterPassword, masterPasswordHash)

      if (isValid) {
        setIsUnlocked(true)
        await loadCredentials()
      } else {
        alert('Contraseña incorrecta')
        setMasterPassword('')
      }
    } catch (error) {
      console.error('Error unlocking vault:', error)
      alert('Error al verificar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  const handleLock = () => {
    setIsUnlocked(false)
    setMasterPassword('')
    setCredentials([])
    setRevealedCredentials(new Set())
    setShowAddForm(false)
  }

  const loadCredentials = async () => {
    try {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('project_credentials')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Descifrar todas las credenciales
      const decryptedCredentials: DecryptedCredential[] = []

      for (const cred of data || []) {
        try {
          const decryptedValue = decryptCredential(cred.encrypted_value, masterPassword)
          decryptedCredentials.push({
            ...cred,
            value: decryptedValue
          })
        } catch (error) {
          console.error(`Error decrypting credential ${cred.id}:`, error)
        }
      }

      setCredentials(decryptedCredentials)
    } catch (error) {
      console.error('Error loading credentials:', error)
    }
  }

  const addCredential = async () => {
    if (!newCredential.name.trim() || !newCredential.value.trim()) {
      alert('Nombre y valor son requeridos')
      return
    }

    // Validar credencial
    const validation = validateCredentialValue(newCredential.type, newCredential.value)
    if (!validation.isValid) {
      alert(validation.message)
      return
    }

    setLoading(true)
    try {
      // Cifrar la credencial
      const { encrypted, iv } = encryptCredential(newCredential.value, masterPassword)

      const supabase = getSupabase()
      const { error } = await supabase
        .from('project_credentials')
        .insert({
          project_id: projectId,
          credential_type: newCredential.type,
          credential_name: newCredential.name.trim(),
          encrypted_value: encrypted,
          iv: iv,
          description: newCredential.description.trim() || null
        })

      if (error) throw error

      // Limpiar formulario y recargar
      setNewCredential({
        type: CREDENTIAL_TYPES.API_KEY,
        name: '',
        value: '',
        description: ''
      })
      setShowAddForm(false)
      await loadCredentials()
      onUpdate?.()
    } catch (error) {
      console.error('Error adding credential:', error)
      alert('Error al agregar la credencial')
    } finally {
      setLoading(false)
    }
  }

  const deleteCredential = async (credentialId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta credencial?')) return

    try {
      const supabase = getSupabase()
      const { error } = await supabase
        .from('project_credentials')
        .delete()
        .eq('id', credentialId)

      if (error) throw error
      await loadCredentials()
      onUpdate?.()
    } catch (error) {
      console.error('Error deleting credential:', error)
      alert('Error al eliminar la credencial')
    }
  }

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value)
    // Mostrar feedback visual (podrías agregar un toast aquí)
  }

  const toggleRevealCredential = (credentialId: string) => {
    const newRevealed = new Set(revealedCredentials)
    if (newRevealed.has(credentialId)) {
      newRevealed.delete(credentialId)
    } else {
      newRevealed.add(credentialId)
    }
    setRevealedCredentials(newRevealed)
  }

  const getCredentialIcon = (type: CredentialType) => {
    const iconProps = { className: "w-4 h-4" }

    switch (type) {
      case CREDENTIAL_TYPES.GITHUB_TOKEN:
        return <Code {...iconProps} />
      case CREDENTIAL_TYPES.DATABASE_URL:
        return <Database {...iconProps} />
      case CREDENTIAL_TYPES.API_KEY:
        return <Key {...iconProps} />
      case CREDENTIAL_TYPES.ANON_PUBLIC:
        return <Globe {...iconProps} />
      case CREDENTIAL_TYPES.PRIVATE_KEY:
        return <Shield {...iconProps} />
      default:
        return <Key {...iconProps} />
    }
  }

  if (!isUnlocked) {
    return (
      <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">
            {hasUserVault ? 'Vault de Credenciales' : 'Crear Vault Personal'}
          </h3>
        </div>

        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Área Protegida
              </span>
            </div>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              {hasUserVault
                ? "Esta sección contiene credenciales sensibles como tokens de API, claves privadas y accesos a repositorios. Se requiere contraseña maestra para acceder."
                : "Crea tu vault personal para almacenar credenciales de forma segura. Define una contraseña maestra que solo tú conozcas."
              }
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">
              Contraseña Maestra
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (hasUserVault ? handleUnlock() : handleCreateVault())}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground pr-10"
                placeholder={hasUserVault ? "Ingresa la contraseña maestra" : "Define tu contraseña maestra (min 6 caracteres)"}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              onClick={hasUserVault ? handleUnlock : handleCreateVault}
              disabled={loading || !masterPassword.trim() || (!hasUserVault && masterPassword.length < 6)}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Unlock className="w-4 h-4" />
              )}
              {loading
                ? (hasUserVault ? 'Verificando...' : 'Creando vault...')
                : (hasUserVault ? 'Desbloquear Vault' : 'Crear Vault')
              }
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Unlock className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-foreground">Vault de Credenciales</h3>
          <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 text-xs rounded-full">
            Desbloqueado
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
          <button
            onClick={handleLock}
            className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-accent transition-colors flex items-center gap-2 text-sm"
          >
            <Lock className="w-4 h-4" />
            Bloquear
          </button>
        </div>
      </div>

      {/* Lista de credenciales */}
      <div className="space-y-3 mb-4">
        {credentials.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay credenciales almacenadas</p>
            <p className="text-sm">Agrega tokens, claves y credenciales para este proyecto</p>
          </div>
        ) : (
          credentials.map((credential) => (
            <div key={credential.id} className="bg-muted/30 rounded-lg p-4 border border-border">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {getCredentialIcon(credential.credential_type as CredentialType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground">{credential.credential_name}</h4>
                      <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded">
                        {getCredentialTypeName(credential.credential_type as CredentialType)}
                      </span>
                    </div>
                    {credential.description && (
                      <p className="text-sm text-muted-foreground mb-2">{credential.description}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-background border border-border rounded text-sm font-mono flex-1 min-w-0">
                        {revealedCredentials.has(credential.id)
                          ? credential.value
                          : '••••••••••••••••••••••••••••••••'
                        }
                      </code>
                      <button
                        onClick={() => toggleRevealCredential(credential.id)}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        title={revealedCredentials.has(credential.id) ? 'Ocultar' : 'Mostrar'}
                      >
                        {revealedCredentials.has(credential.id) ?
                          <EyeOff className="w-4 h-4" /> :
                          <Eye className="w-4 h-4" />
                        }
                      </button>
                      <button
                        onClick={() => copyToClipboard(credential.value)}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        title="Copiar al portapapeles"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteCredential(credential.id)}
                        className="p-2 text-muted-foreground hover:text-red-600 transition-colors"
                        title="Eliminar credencial"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Formulario para agregar credencial */}
      {showAddForm && (
        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-foreground">Nueva Credencial</h4>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tipo de Credencial
              </label>
              <select
                value={newCredential.type}
                onChange={(e) => setNewCredential(prev => ({ ...prev, type: e.target.value as CredentialType }))}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
              >
                {Object.entries(CREDENTIAL_TYPES).map(([key, value]) => (
                  <option key={key} value={value}>
                    {getCredentialTypeName(value)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nombre
              </label>
              <input
                type="text"
                value={newCredential.name}
                onChange={(e) => setNewCredential(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                placeholder="Ej: Production API Key"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Valor de la Credencial
            </label>
            <textarea
              value={newCredential.value}
              onChange={(e) => setNewCredential(prev => ({ ...prev, value: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground resize-none"
              placeholder="Ingresa el token, clave o credencial..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Descripción (opcional)
            </label>
            <input
              type="text"
              value={newCredential.description}
              onChange={(e) => setNewCredential(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
              placeholder="Descripción de para qué se usa esta credencial"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={addCredential}
              disabled={loading || !newCredential.name.trim() || !newCredential.value.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Guardando...' : 'Guardar Credencial'}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}