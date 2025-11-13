const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

// Carregar variáveis de ambiente
require('dotenv').config()

async function runMigration() {
  console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL ? 'Found' : 'Not found')

  // Usar as mesmas variáveis do .env
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  })

  try {
    console.log('🔗 Conectando ao banco de dados...')
    await client.connect()

    console.log('📖 Lendo arquivo SQL de migração...')
    const sqlPath = path.join(__dirname, '..', 'migration-manual.sql')
    const sql = fs.readFileSync(sqlPath, 'utf-8')

    console.log('⚡ Executando migração...')
    await client.query(sql)

    console.log('✅ Migração executada com sucesso!')

  } catch (error) {
    console.error('❌ Erro na migração:', error)
  } finally {
    await client.end()
  }
}

runMigration()