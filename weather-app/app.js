const request = require('request')
const yargs = require('yargs')

const argv = yargs
  .options({
    address: {
      a: {
        demand: true,
        alias: 'address',
        describe: 'Address to fetch weather for',
        string: true
      }
    }
  })
  .help()
  .alias('help', 'h')
  .argv

const encodedAddress = encodeURIComponent(argv.address)

request({
  url: `https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyDauByJ55LYHOeq0MhQHOukvSetJkoWK0g&address=${encodedAddress}`,
  json: true
}, (error, response, body) => {
  global.console.log(`Address: ${body.result[0].formatted_address}`)
  global.console.log(`Latitude: ${body.result[0].geometry.location.lat}`)
  global.console.log(`Longitude: ${body.result[0].geometry.location.lng}`)
})
