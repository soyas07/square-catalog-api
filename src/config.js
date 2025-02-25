import dotenv from 'dotenv'

dotenv.config()

console.log(process.env.NODE_ENV)
const env = process.env.NODE_ENV || 'development'

export const config = {
  port: process.env.PORT || 5000,
  databaseUrl: env === 'development' ? process.env.DATABASE_URL : process.env.PROD_DATABASE_URL,
  squareAccessToken: env === 'development' ? process.env.SQUARE_ACCESS_TOKEN : process.env.PROD_SQUARE_ACCESS_TOKEN,
  squareEnvironment: env === 'development' ? 'sandbox' : 'production'
}
