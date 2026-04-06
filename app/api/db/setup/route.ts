import { NextResponse } from 'next/server'
import { executeRawSQL } from '@/app/lib/prisma'
import fs from 'fs'
import path from 'path'

export async function POST() {
  try {
    const sqlScript = fs.readFileSync(
      path.join(process.cwd(), 'prisma/migrations/add_layout_tables.sql'),
      'utf-8'
    )

    await executeRawSQL(sqlScript)
    return NextResponse.json({ message: 'Database setup completed successfully' })
  } catch (error) {
    console.error('Database setup error:', error)
    return NextResponse.json(
      { error: 'Failed to setup database' },
      { status: 500 }
    )
  }
} 