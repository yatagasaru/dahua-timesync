import DahuaRPC from "./src/app"
import { log, loadEnv } from "./src/utils"

(async() => {
  await loadEnv()
  const host = process.env.HOST
  const username = process.env.USER_NAME
  const password = process.env.PASSWORD

  if (!host || !username || !password) {
    log("Missing required environment variables: HOST, USER_NAME, PASSWORD")
    process.exit(1)
  }

  const rpc = DahuaRPC(host, username, password)
  let hasLoggedIn = false

  try {
    await rpc.login()
    hasLoggedIn = true

    log("Date time check running!")

    const rpcTime = (await rpc.getCurrentTime()).params.time
    const nvrDate = new Date(rpcTime.replace(' ', 'T'))

    if (Number.isNaN(nvrDate.getTime())) {
      throw new Error(`Unable to parse NVR time: ${rpcTime}`)
    }

    const minutesDiff = (Date.now() - nvrDate.getTime()) / (1000 * 60)

    if(Math.abs(minutesDiff) > 1){
      log(`NVR date time out of sync by ${minutesDiff.toFixed(2)} minutes`)

      await rpc.setCurrentTime()
      
      log("NVR date time successfully synced")
    }
    else {
      log("All good!")
    }
  }
  catch (err) {
    const errMessage = err instanceof Error ? err.message : String(err)
    log(`Date time sync failed: ${errMessage}`)
    process.exitCode = 1
  }
  finally {
    if (!hasLoggedIn) {
      return
    }

    try {
      await rpc.logout()
    }
    catch (err) {
      const errMessage = err instanceof Error ? err.message : String(err)
      log(`Logout failed: ${errMessage}`)
      process.exitCode = 1
    }
  }
})()