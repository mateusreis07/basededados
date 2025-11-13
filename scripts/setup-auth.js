const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function setupAuth() {
  try {
    console.log('🔧 Configurando autenticação para teams...')

    // Buscar todos os teams existentes
    const teams = await prisma.team.findMany()

    for (const team of teams) {
      if (!team.email || !team.password) {
        // Criar credenciais padrão
        const email = `${team.slug}@exemplo.com`
        const password = await bcrypt.hash('123456', 10)

        await prisma.team.update({
          where: { id: team.id },
          data: {
            email,
            password,
            isActive: true
          }
        })

        console.log(`✅ Configurado: ${team.name}`)
        console.log(`   Email: ${email}`)
        console.log(`   Senha: 123456`)
        console.log('   ---')
      }
    }

    console.log('🎉 Autenticação configurada com sucesso!')
    console.log('\n📝 Credenciais criadas:')

    const teamsWithAuth = await prisma.team.findMany({
      where: {
        email: { not: null },
        password: { not: null }
      },
      select: {
        name: true,
        slug: true,
        email: true
      }
    })

    teamsWithAuth.forEach(team => {
      console.log(`\n🏢 ${team.name}`)
      console.log(`   Email: ${team.email}`)
      console.log(`   Senha: 123456`)
      console.log(`   URL: http://localhost:3000/team/${team.slug}`)
    })

  } catch (error) {
    console.error('❌ Erro ao configurar autenticação:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupAuth()