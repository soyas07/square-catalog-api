import winston from 'winston'

// Create a custom log format with timestamp
const logFormat = winston.format.printf(({ timestamp, level, message }) => {
  return `${timestamp} [${level}]: ${message}`
})

const logger = winston.createLogger({
  level: 'info', // Set the default log level to 'info'
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Add timestamp with format
    logFormat // Apply the custom log format
  ),
  transports: [
    new winston.transports.Console(), // Log to console
    new winston.transports.File({ filename: 'logs/app.log' }) // Log to file
  ]
})

export default logger
