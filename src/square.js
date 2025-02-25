import { SquareClient, SquareEnvironment } from 'square'
import { config } from './config.js'

console.log(config.squareAccessToken)

export const square = new SquareClient({
  environment: config.squareEnvironment === 'sandbox' ? SquareEnvironment.Sandbox : SquareEnvironment.Production,
  token: config.squareAccessToken
})
