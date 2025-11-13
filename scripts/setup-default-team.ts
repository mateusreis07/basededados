const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setupDefaultTeam() {
  try {
    console.log('🚀 Configurando team padrão...')

    // Criar team padrão
    const defaultTeam = await prisma.team.upsert({
      where: { slug: 'default' },
      update: {},
      create: {
        name: 'Time Padrão',
        slug: 'default',
        description: 'Time padrão para dados existentes',
        settings: {}
      }
    })

    console.log('✅ Team padrão criado:', defaultTeam.name)

    // Migrar dados existentes para o team padrão
    const updates = []

    // Como o teamId agora é obrigatório, vamos apenas verificar se há dados para migrar
    // e atualizar caso já existam

    // Verificar se existem sections sem teamId (caso raro após migração)
    const sectionsCount = await prisma.section.count()
    const categoriesCount = await prisma.category.count()
    const itemsCount = await prisma.item.count()

    console.log(`📊 Dados existentes:`)
    console.log(`   Sections: ${sectionsCount}`)
    console.log(`   Categories: ${categoriesCount}`)
    console.log(`   Items: ${itemsCount}`)

    console.log('✅ Verificação de dados concluída')

    // Criar alguns teams de exemplo
    const exampleTeams = [
      {
        name: 'Marketing',
        slug: 'marketing',
        description: 'Time de Marketing e Comunicação'
      },
      {
        name: 'Desenvolvimento',
        slug: 'dev',
        description: 'Time de Desenvolvimento de Software'
      },
      {
        name: 'Suporte',
        slug: 'suporte',
        description: 'Time de Suporte ao Cliente'
      }
    ]

    for (const team of exampleTeams) {
      await prisma.team.upsert({
        where: { slug: team.slug },
        update: {},
        create: team
      })
      console.log(`✅ Team exemplo criado: ${team.name}`)
    }

    console.log('🎉 Setup concluído! Teams configurados:')
    const allTeams = await prisma.team.findMany()
    allTeams.forEach((team: any) => {
      console.log(`  - ${team.name} (/${team.slug})`)
    })

  } catch (error) {
    console.error('❌ Erro no setup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupDefaultTeam()