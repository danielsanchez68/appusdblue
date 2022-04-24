const dotenv = require('dotenv')

dotenv.config()

const URL_BASE = process.env.URL_BASE || 'mongodb://localhost:27017/mibase'
const VERSION = 'v0.3.9'
const TMS_GETDOLARAPI = 60100 /* 5000 */

module.exports = {
    URL_BASE,
    VERSION,
    TMS_GETDOLARAPI
}
