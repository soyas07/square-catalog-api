export const validateSquareResponse = (result) => {
  return JSON.parse(
    JSON.stringify(result, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  )
}
