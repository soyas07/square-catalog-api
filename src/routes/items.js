import express from 'express'
import logger from '../middlewares/logger.js'
import { square } from '../square.js'
import { SquareError } from 'square'
import { validateSquareResponse } from '../utils/utils.js'
import prisma, { createOrUpdateRecordsInTable } from '../utils/db.js'
import { fetchImageObjects } from '../utils/helper.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { name, location_id } = req.query
    console.log(req.query)

    let result
    if (location_id) {
      // if location id is provided then search for specific location
      const items = await prisma.items.findMany({
        where: {
          location_id
        }
      })

      if (items) { return res.send({ success: true, data: items }) }
    }

    if (name) {
      // If an id is provided, search for that specific category
      logger.info(`Getting Item: ${name}`)

      // check database before calling the API
      const items = await prisma.items.findFirst({
        where: {
          item_name: name
        }
      })

      if (items) { return res.send({ success: true, data: items }) }

      const response =
                    await square.catalog.search({
                      objectTypes: [
                        'ITEM'
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
      logger.info('Getting all items list')

      // check database before calling the API
      const item = await prisma.items.findMany()

      if (item && item.length !== 0) { return res.send({ success: true, data: item }) }

      const response =
                    await square.catalog.search({
                      objectTypes: ['ITEM']
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
      logger.error(`Error getting items from the store: ${ex}`)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
})

// router.put('/', async (req, res) => {
//   try {
//     const payload = req.body
//     logger.info('Payloads from client: ')
//     logger.info(JSON.stringify(payload))

//     // if (!validateItemsPutSchema(payload)) { return res.status(400).send('Error Bad Request') }

//     const requestBody = {
//       idempotencyKey: payload.idempotencyKey,
//       objects: payload.objects.map((item) => ({
//         type: 'ITEM',
//         id: item.id,
//         presentAtAllLocations: true,
//         itemData: {
//           descriptionHtml: item.description,
//           categories: item.categoryIds,
//           name: item.name,
//           variations: item.variations.map((varyItem) => ({
//             id: varyItem.id,
//             type: 'ITEM_VARIATION',
//             presentAtAllLocations: true,
//             itemVariationData: {
//               itemId: item.id,
//               pricingType: 'FIXED_PRICING',
//               name: varyItem.name,
//               priceMoney: {
//                 amount: BigInt(varyItem.price),
//                 currency: "AUD",
//               },
//             },
//           })),
//         },
//       })),
//     };

//     logger.info(`Request payload body: ${JSON.stringify(requestBody)}`)

//     const response = await square.catalog.object.upsert({
//       idempotencyKey: requestBody.idempotencyKey,
//       object: {
//         type: "ITEM",
//         id: "#momo",
//         presentAtAllLocations: true,
//         itemData: {
//             descriptionHtml: "<p>momo description</p>",
//             name: "Momo",
//             variations: [
//                 {
//                     type: "ITEM_VARIATION",
//                     id: "#chicken-momo",
//                     presentAtAllLocations: true,
//                     itemVariationData: {
//                         itemId: "#momo",
//                         priceMoney: ({
//                             amount: BigInt("150"),
//                             currency: "AUD",
//                         }),
//                     },
//                 },
//             ],
//         },
//     },
//       // batches: [{ objects: requestBody.objects }]
//     })

//     const validateRespone = validateSquareResponse(response)

//     res.send({
//       success: true,
//       data: validateRespone
//     })
//   } catch (ex) {
//     if (ex instanceof SquareError) {
//       logger.error(JSON.stringify(ex.errors))
//       res.status(500).send({ error: 'Error from Square API' })
//     } else {
//       // General error handling
//       logger.error(`Error creating items in the store: ${ex}`)
//       res.status(500).json({ error: 'Internal server error' })
//     }
//   }
// })

// router.delete('/', async (req, res) => {
//   try {
//     const payload = req.body
//     logger.info('Payloads from client: ')
//     logger.info(payload)

//     if (!validateCategoriesDeleteSchema) { return res.status(400).send('Error Bad Request') }

//     const response = await square.catalog.batchDelete({
//       objectIds: payload.catalogIds
//     })

//     res.send({
//       success: true,
//       data: response
//     })
//   } catch (ex) {
//     if (ex instanceof SquareError) {
//       logger.error(JSON.stringify(ex.errors))
//       res.status(500).send({ error: 'Error from Square API' })
//     } else {
//       // General error handling
//       logger.error(`Error getting categories from the store: ${ex}`)
//       res.status(500).json({ error: 'Internal server error' })
//     }
//   }
// })

// router.patch('/', async (req, res) => {
//   try {
//     const { id } = req.query
//     const payload = req.body
//     logger.info('Payloads from client: ')
//     logger.info(JSON.stringify(payload))

//     if (!validateCategoriesPatchSchema(payload)) { return res.status(400).send('Error Bad Request') }

//     if (!id) { return res.status(400).send('Category Id is not set on the params') }

//     // Fetch the current version of the category object
//     const objectDetails = await square.catalog.object.get({
//       objectId: id
//     })

//     if (!objectDetails) { return res.status(500).send('Failed to fetch the current object:', objectDetails) }

//     const currentVersion = objectDetails.object.version

//     // Now upsert with the latest version
//     const response = await square.catalog.object.upsert({
//       object: {
//         type: 'CATEGORY',
//         id,
//         version: currentVersion, // Add the current version here
//         categoryData: {
//           name: payload.data.name
//         }
//       },
//       idempotencyKey: payload.idempotencyKey
//     })

//     // validate square response
//     const validatedResponse = validateSquareResponse(response)

//     res.send({
//       success: true,
//       data: validatedResponse
//     })
//   } catch (ex) {
//     if (ex instanceof SquareError) {
//       logger.error(JSON.stringify(ex.errors))
//       res.status(500).send({ error: 'Error from Square API' })
//     } else {
//       // General error handling
//       logger.error(`Error getting categories from the store: ${ex}`)
//       res.status(500).json({ error: 'Internal server error' })
//     }
//   }
// })

// update the database table categories
router.post('/update', async (req, res) => {
  try {
    logger.info('Getting all items list')
    const response =
                await square.catalog.search({
                  objectTypes: ['ITEM']
                })

    // validate square response
    const validatedResponse = validateSquareResponse(response)

    const data = []
    const variationData = []

    for (const item of validatedResponse.objects) {
      let itemImages = []

      if (item.itemData.imageIds) {
        logger.info(`Getting list of item images: ${item.itemData.imageIds}`)

        // Fetch image URLs
        itemImages = await fetchImageObjects(item.itemData.imageIds)
      }

      // Store item details
      data.push({
        item_id: item.id,
        item_name: item.itemData.name,
        item_image: (Array.isArray(itemImages) && itemImages.length === 0) ? null : JSON.stringify(itemImages),
        item_description: item.itemData.descriptionHtml,
        location_id: item.presentAtLocationIds ? item.presentAtLocationIds[0] : null,
        category_id: item.itemData.categories ? item.itemData.categories[0].id : null
      })

      for (const variation of item.itemData.variations) {
        let images = []
        if (variation.itemVariationData.imageIds) {
          logger.info(`Getting list of item variation images: ${variation.itemVariationData.imageIds}`)

          // Fetch image URLs
          images = await fetchImageObjects(variation.itemVariationData.imageIds)
        }

        variationData.push({
          variation_id: variation.id,
          item_id: variation.itemVariationData.itemId,
          variation_name: variation.itemVariationData.name,
          variation_price: variation.itemVariationData.priceMoney.amount,
          variation_image: JSON.stringify(images) // Store array of {id, url} objects
        })
      }
    }

    logger.info('Truncating the table items')
    await prisma.items.deleteMany()
    logger.info('Truncating the table items_variations')
    await prisma.item_variations.deleteMany()

    logger.info('Item Table truncated successfully')
    logger.info('Item_Variations Table truncated successfully')

    await createOrUpdateRecordsInTable(data, 'items', 'item_id')
    await createOrUpdateRecordsInTable(variationData, 'item_variations', 'variation_id')

    res.status(204).send({
      success: true
    })
  } catch (ex) {
    if (ex instanceof SquareError) {
      logger.error(JSON.stringify(ex.errors))
      res.status(500).send({ error: 'Error from Square API' })
    } else {
      // General error handling
      logger.error(`Error updating items in the DB ${ex}`)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
})

export default router
