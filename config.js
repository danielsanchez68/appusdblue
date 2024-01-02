const dotenv = require('dotenv')

dotenv.config()

const URL_BASE = process.env.URL_BASE || 'mongodb://localhost:27017/mibase'
const VERSION = 'v0.6.5'
const TMS_GETDOLARAPI = 60100 /* 5000 */

module.exports = {
    URL_BASE,
    VERSION,
    TMS_GETDOLARAPI
}
