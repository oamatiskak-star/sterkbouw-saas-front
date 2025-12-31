mkdir -p utils
cat > utils/auditLogger.js << 'EOF'
// utils/auditLogger.js

const supabase = require('../lib/supabase')

class AuditLogger {
  static async log(action, userId, entityType, entityId, details = {}) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .insert([{
          action,
          user_id: userId,
          entity_type: entityType,
          entity_id: entityId,
          details: JSON.stringify(details),
          ip_address: '127.0.0.1', // In productie zou dit van de request komen
          user_agent: 'Next.js Server',
          created_at: new Date().toISOString()
        }])

      if (error) {
        console.error('Audit log error:', error)
      }

      return { success: !error, error }
    } catch (error) {
      console.error('Audit logger exception:', error)
      return { success: false, error }
    }
  }

  static async logProjectView(userId, projectId) {
    return this.log('VIEW', userId, 'project', projectId, {
      timestamp: new Date().toISOString()
    })
  }

  static async logDocumentDownload(userId, documentId) {
    return this.log('DOWNLOAD', userId, 'document', documentId)
  }

  static async logCalculationChange(userId, calculationId, changes) {
    return this.log('UPDATE', userId, 'calculation', calculationId, {
      changes,
      timestamp: new Date().toISOString()
    })
  }

  static async logLogin(userId) {
    return this.log('LOGIN', userId, 'user', userId)
  }

  static async logExport(userId, exportType, filters) {
    return this.log('EXPORT', userId, 'system', null, {
      export_type: exportType,
      filters,
      timestamp: new Date().toISOString()
    })
  }

  static async getLogs(filters = {}) {
    try {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          user:users(email, full_name)
        `)
        .order('created_at', { ascending: false })

      if (filters.userId) {
        query = query.eq('user_id', filters.userId)
      }

      if (filters.entityType) {
        query = query.eq('entity_type', filters.entityType)
      }

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate)
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate)
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      return { data, error }
    } catch (error) {
      console.error('Get logs error:', error)
      return { data: null, error }
    }
  }
}

module.exports = AuditLogger
EOF
