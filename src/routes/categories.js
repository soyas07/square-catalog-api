import express from 'express'
import logger from '../middlewares/logger.js'
import { square } from '../square.js'
import { SquareError } from 'square'
import { validateSquareResponse } from '../utils/utils.js'
import prisma, { createOrUpdateRecordsInTable } from '../utils/db.js'
import { validateCategoriesDeleteSchema, validateCategoriesPatchSchema, validateCategoriesPutSchema } from '../utils/schema.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { name } = req.query
    console.log(req.query)

    let result

    if (name) {
      // If an id is provided, search for that specific category
      logger.info(`Getting category: ${name}`)

      // check database before calling the API
      const category = await prisma.categories.findFirst({
        where: {
          category_name: name
        }
      })

      if (category) { return res.send({ success: true, data: category }) }

      const response =
                    await square.catalog.search({
                      objectTypes: [
                        'CATEGORY'
                      ],
                      query: {
                        exactQuery: {
                          attributeName: 'name',
                          attributeValue: name
                        }
                      }
                    })

      result = response
    } else {
      // If no id is provided, get all categories
      logger.info('Getting all categories list')

      // check database before calling the API
      const category = await prisma.categories.findMany()

      if (category && category.length !== 0) { return res.send({ success: true, data: category }) }

      const response =
                    await square.catalog.search({
                      objectTypes: ['CATEGORY']
                    })
      result = response
    }

    // Convert BigInt values in the response to strings (if any)
    const response = validateSquareResponse(result)

    // Send the response with categories data
    res.send({
      success: true,
      data: response.objects || [] // Ensure response is in the correct format
    })
  } catch (ex) {
    if (ex instanceof SquareError) {
      logger.error(ex.errors)
      res.status(500).send({ error: 'Error from Square API' })
    } else {
      // General error handling
      logger.error(`Error getting categories from the store: ${ex}`)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
})

router.put('/', async (req, res) => {
  try {
    const payload = req.body
    logger.info('Payloads from client: ')
    logger.info(payload)

    if (!validateCategoriesPutSchema(payload)) { return res.status(400).send('Error Bad Request') }

    const requestBody = {
      idempotencyKey: payload.idempotencyKey,
      objects: payload.objects.map((category) => ({
        type: 'CATEGORY',
        id: category.id,
        categoryData: {
          name: category.name,
          onlineVisibility: true
        }
      }))
    }

    logger.info(`Request payload body: ${JSON.stringify(requestBody)}`)

    const response = await square.catalog.batchUpsert({
      idempotencyKey: requestBody.idempotencyKey,
      batches: [{ objects: requestBody.objects }]
    })

    const validateRespone = validateSquareResponse(response)

    res.send({
      success: true,
      data: validateRespone
    })
  } catch (ex) {
    if (ex instanceof SquareError) {
      logger.error(JSON.stringify(ex.errors))
      res.status(500).send({ error: 'Error from Square API' })
    } else {
      // General error handling
      logger.error(`Error creating categories in the store: ${ex}`)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
})

router.delete('/', async (req, res) => {
  try {
    const payload = req.body
    logger.info('Payloads from client: ')
    logger.info(payload)

    if (!validateCategoriesDeleteSchema) { return res.status(400).send('Error Bad Request') }

    const response = await square.catalog.batchDelete({
      objectIds: payload.catalogIds
    })

    res.send({
      success: true,
      data: response
    })
  } catch (ex) {
    if (ex instanceof SquareError) {
      logger.error(JSON.stringify(ex.errors))
      res.status(500).send({ error: 'Error from Square API' })
    } else {
      // General error handling
      logger.error(`Error deleting categories from the store: ${ex}`)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
})

router.patch('/', async (req, res) => {
  try {
    const { id } = req.query
    const payload = req.body
    logger.info('Payloads from client: ')
    logger.info(JSON.stringify(payload))

    if (!validateCategoriesPatchSchema(payload)) { return res.status(400).send('Error Bad Request') }

    if (!id) { return res.status(400).send('Category Id is not set on the params') }

    // Fetch the current version of the category object
    const objectDetails = await square.catalog.object.get({
      objectId: id
    })

    if (!objectDetails) { return res.status(500).send('Failed to fetch the current object:', objectDetails) }

    const currentVersion = objectDetails.object.version

    // Now upsert with the latest version
    const response = await square.catalog.object.upsert({
      object: {
        type: 'CATEGORY',
        id,
        version: currentVersion, // Add the current version here
        categoryData: {
          name: payload.data.name
        }
      },
      idempotencyKey: payload.idempotencyKey
    })

    // validate square response
    const validatedResponse = validateSquareResponse(response)

    res.send({
      success: true,
      data: validatedResponse
    })
  } catch (ex) {
    if (ex instanceof SquareError) {
      logger.error(JSON.stringify(ex.errors))
      res.status(500).send({ error: 'Error from Square API' })
    } else {
      // General error handling
      logger.error(`Error updating categories from the store: ${ex}`)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
})

// update the database table categories
router.post('/update', async (req, res) => {
  try {
    logger.info('Getting all categories list')
    const response =
                await square.catalog.search({
                  objectTypes: ['CATEGORY']
                })

    // validate square response
    const validatedResponse = validateSquareResponse(response)
    const data = validatedResponse.objects.map(category => ({
      category_id: category.id,
      category_name: category.categoryData.name
    }))

    logger.info('Truncating the table categories')
    await prisma.categories.deleteMany()

    logger.info('Categories Table truncated successfully')

    const result = await createOrUpdateRecordsInTable(data, 'categories', 'category_id')

    res.status(204).send({
      success: true,
      data: result
    })
  } catch (ex) {
    if (ex instanceof SquareError) {
      logger.error(JSON.stringify(ex.errors))
      res.status(500).send({ error: 'Error from Square API' })
    } else {
      // General error handling
      logger.error(`Error updating categories table in the DB: ${ex}`)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
})

export default router
