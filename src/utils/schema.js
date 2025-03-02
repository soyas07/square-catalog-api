import Ajv from 'ajv'

const ajv = new Ajv()

const categoriesPutSchema = {
  type: 'object', // Define that the root object is an object
  properties: {
    idempotencyKey: { type: 'string' },
    objects: {
      type: 'array', // Define objects as an array
      items: { // Describe the schema of each item in the array
        type: 'object', // Each item is an object
        properties: {
          id: { type: 'string' },
          name: { type: 'string' }
        },
        required: ['id', 'name'] // Optionally, specify required properties
      }
    }
  },
  required: ['idempotencyKey', 'objects'] // Specify required properties for the root object
}

const categoriesDeleteSchema = {
  type: 'object',
  properties: {
    categoryIds: { // Renamed `type` to a proper property name
      type: 'array',
      items: { type: 'string' }
    }
  },
  required: ['categoryIds'], // Ensures `categoryIds` is mandatory
  additionalProperties: false // Prevents extra properties
}

const categoriesPatchSchema = {
  type: 'object',
  properties: {
    data: { // Renamed `type` to a proper property name
      type: 'object',
      properties: {
        name: { type: 'string' }
      },
      required: ['name']
    },
    idempotencyKey: { type: 'string' }
  },
  required: ['data'] // Ensures `categoryIds` is mandatory
}

export const validateCategoriesPutSchema = ajv.compile(categoriesPutSchema)
export const validateCategoriesDeleteSchema = ajv.compile(categoriesDeleteSchema)
export const validateCategoriesPatchSchema = ajv.compile(categoriesPatchSchema)

const itemsPutSchema = {
  type: 'object', // Define that the root object is an object
  properties: {
    idempotencyKey: { type: 'string' },
    objects: {
      type: 'array', // Define objects as an array
      items: { // Describe the schema of each item in the array
        type: 'object', // Each item is an object
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          categoryIds: {
            type: 'array',
            items: { type: 'string' }
          }
        },
        required: ['id', 'name'] // Optionally, specify required properties
      }
    }
  },
  required: ['idempotencyKey', 'objects'] // Specify required properties for the root object
}

export const validateItemsPutSchema = ajv.compile(itemsPutSchema)
