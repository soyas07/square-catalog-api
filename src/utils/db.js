// db.js
import { PrismaClient } from '@prisma/client'
import logger from '../middlewares/logger.js'

const prisma = new PrismaClient()

// Optional: If you want to log queries to the console
prisma.$on('query', (e) => {
  console.log('Query: ' + e.query)
  console.log('Params: ' + e.params)
  console.log('Duration: ' + e.duration + 'ms')
})

// Set up database connection
export async function connectDB () {
  try {
    await prisma.$connect()
    logger.info('✅ Connected to the database successfully!')
  } catch (error) {
    logger.error('❌ Error connecting to the database: ', error)
  }
}

// add data to db table
export async function createOrUpdateRecordsInTable (data, tableName, uniqueField = 'id') {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid or empty data array provided for insertion.')
    }

    const results = await Promise.all(
      data.map(async (record) => {
        return prisma[tableName].upsert({
          where: { [uniqueField]: record[uniqueField] }, // Match unique field
          update: record, // Update if exists
          create: record // Create if doesn't exist
        })
      })
    )

    logger.info(`${results.length} records inserted/updated in ${tableName}`)
  } catch (error) {
    logger.error(`Error inserting/updating ${tableName}:`, error)
  } finally {
    await prisma.$disconnect()
  }
}

// delete data to db table
export async function deleteRecordsInTable (data, tableName) {
  try {
    // Ensure data is in the correct format
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid or empty data array provided for deletion.')
    }

    const results = await prisma[tableName].deleteMany({
      where: {
        category_id: { in: data } // Assuming `data` is an array of IDs
      }
    })

    logger.info(`${results.count} records deleted from ${tableName}`)
  } catch (error) {
    logger.error(`Error deleting from ${tableName}: `, error)
  } finally {
    await prisma.$disconnect()
  }
}

export default prisma
