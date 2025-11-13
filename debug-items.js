const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugItems() {
  try {
    console.log('🔍 Debug dos itens por seção...')

    // Verificar todas as seções com contagem de itens
    const sections = await prisma.section.findMany({
      include: {
        _count: {
          select: { items: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    console.log('\n📁 Seções e contagem de itens:')
    sections.forEach(section => {
      console.log(`  ID: ${section.id} | ${section.name} | Tipo: ${section.type} | Itens: ${section._count.items}`)
    })

    // Verificar itens específicos da seção Scripts PostgreSQL
    const scriptsSection = sections.find(s => s.name === 'Scripts PostgreSQL')
    if (scriptsSection) {
      console.log(`\n🔍 Investigando seção "${scriptsSection.name}" (ID: ${scriptsSection.id})...`)

      const items = await prisma.item.findMany({
        where: { sectionId: scriptsSection.id },
        orderBy: { createdAt: 'desc' }
      })

      console.log(`\n📝 Itens encontrados (${items.length}):`)
      items.forEach(item => {
        console.log(`  ID: ${item.id} | Título: "${item.title}" | SectionID: ${item.sectionId}`)
      })

      if (items.length === 0) {
        console.log('❌ Nenhum item encontrado para esta seção!')
      }
    }

    // Verificar se há itens órfãos (sem seção válida)
    const orphanItems = await prisma.item.findMany({
      where: {
        section: null
      }
    })

    if (orphanItems.length > 0) {
      console.log(`\n🚨 Itens órfãos encontrados (${orphanItems.length}):`)
      orphanItems.forEach(item => {
        console.log(`  ID: ${item.id} | Título: "${item.title}" | SectionID: ${item.sectionId}`)
      })
    }

    // Verificar todos os itens e suas seções
    console.log('\n📋 Todos os itens:')
    const allItems = await prisma.item.findMany({
      include: {
        section: true
      },
      orderBy: { createdAt: 'desc' }
    })

    allItems.forEach(item => {
      const sectionName = item.section ? item.section.name : `SEÇÃO INEXISTENTE (${item.sectionId})`
      console.log(`  "${item.title}" → ${sectionName}`)
    })

  } catch (error) {
    console.error('❌ Erro:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

debugItems()