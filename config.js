import dotenv from 'dotenv'

dotenv.config()

const URL_BASE = process.env.URL_BASE || 'mongodb://localhost:27017/mibase'
const VERSION = 'v0.2.4'
const TMS_GETDOLARAPI = 60100/*  5000 */

export default {
    URL_BASE,
    VERSION,
    TMS_GETDOLARAPI
}
