import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Check Layouts
    const layouts = await prisma.layout.findMany({
      include: {
        rooms: true,
        move: true,
        moveStop: true
      },
      take: 5
    })

    console.log('\nLayouts:')
    layouts.forEach(layout => {
      console.log(`\nLayout: ${layout.name}`)
      console.log(`ID: ${layout.id}`)
      console.log(`Orientation: ${layout.orientation}`)
      console.log(`Room Count: ${layout.rooms.length}`)
      console.log(`Move ID: ${layout.moveId}`)
      console.log(`Move Stop ID: ${layout.moveStopId}`)
    })

    // Check Rooms
    const rooms = await prisma.room.findMany({
      include: {
        layout: true
      },
      take: 5
    })

    console.log('\nRooms:')
    rooms.forEach(room => {
      console.log(`\nRoom: ${room.name}`)
      console.log(`ID: ${room.id}`)
      console.log(`Layout: ${room.layout.name}`)
      console.log(`Description: ${room.description || 'None'}`)
    })
  } catch (error) {
    console.error('Error checking data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 