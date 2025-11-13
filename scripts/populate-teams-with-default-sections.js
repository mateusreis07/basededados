const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function populateTeamsWithDefaultSections() {
  try {
    console.log('🔄 Populando teams com estrutura padrão...')

    // 1. Buscar team default
    const defaultTeam = await prisma.team.findUnique({
      where: { slug: 'default' },
      include: {
        sections: true
      }
    })

    if (!defaultTeam) {
      console.log('❌ Team default não encontrado')
      return
    }

    console.log(`✅ Team default encontrado com ${defaultTeam.sections.length} seções`)

    // 2. Buscar todos os outros teams
    const otherTeams = await prisma.team.findMany({
      where: {
        slug: { not: 'default' }
      },
      include: {
        sections: true
      }
    })

    console.log(`📋 Encontrados ${otherTeams.length} teams para popular`)

    // 3. Definir seções padrão baseadas no default
    const defaultSections = [
      {
        name: 'Relatórios',
        description: 'Relatórios e análises do sistema',
        type: 'MENU',
        order: 1
      },
      {
        name: 'Informações Gerais',
        description: 'Informações importantes e documentação geral',
        type: 'MENU',
        order: 2
      },
      {
        name: 'Scripts PostgreSQL',
        description: 'Scripts SQL úteis e consultas prontas',
        type: 'MENU',
        order: 3
      },
      {
        name: 'Erros',
        description: 'Troubleshooting e soluções',
        type: 'MENU',
        order: 4
      }
    ]

    // 4. Para cada team, criar as seções padrão se não existirem
    for (const team of otherTeams) {
      console.log(`\n🔧 Processando team: ${team.name} (${team.slug})`)

      for (const sectionData of defaultSections) {
        // Verificar se a seção já existe (por nome)
        const existingSection = team.sections.find(s => s.name === sectionData.name)

        if (!existingSection) {
          try {
            // Função para normalizar o nome da seção para ID
            function normalizeForId(name) {
              return name
                .toLowerCase()
                .normalize('NFD')                    // Decompor caracteres acentuados
                .replace(/[\u0300-\u036f]/g, '')     // Remover acentos
                .replace(/[^a-z0-9\s-]/g, '')        // Manter apenas letras, números, espaços e hífens
                .replace(/\s+/g, '-')                // Substituir espaços por hífen
                .replace(/--+/g, '-')                // Remover hífens duplos
                .trim()
            }

            // Criar ID único para a seção baseado no team e nome da seção
            const sectionId = `${team.slug}-${normalizeForId(sectionData.name)}`

            const newSection = await prisma.section.create({
              data: {
                id: sectionId,
                name: sectionData.name,
                description: sectionData.description,
                type: sectionData.type,
                order: sectionData.order,
                teamId: team.id
              }
            })
            console.log(`  ✅ Criada seção: ${newSection.name}`)
          } catch (error) {
            console.log(`  ❌ Erro ao criar seção ${sectionData.name}:`, error.message)
          }
        } else {
          console.log(`  ⚠️  Seção já existe: ${sectionData.name}`)
        }
      }
    }

    // 5. Verificar resultado final
    console.log('\n📊 Resultado final:')
    const allTeams = await prisma.team.findMany({
      include: {
        sections: true
      }
    })

    for (const team of allTeams) {
      console.log(`  ${team.name} (${team.slug}): ${team.sections.length} seções`)
      team.sections.forEach(section => {
        console.log(`    - ${section.name}`)
      })
    }

    console.log('\n🎉 Processo concluído!')

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

populateTeamsWithDefaultSections()