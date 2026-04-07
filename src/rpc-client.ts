import type { GenericSuccessResponse, RequestOptions } from "./types"

const DEFAULT_TIMEOUT_MS = 120000

const RPCClient =  (host: string) => {
  let sessionId = ""
  let requestId = 1

  const request = async <T = GenericSuccessResponse>(method: string, options?: RequestOptions):Promise<T> => {
    const currentRequestId = requestId
    requestId += 1
    const url = options?.url || `${host}/RPC2`
    const timeoutMs = Number(process.env.TIMEOUT) || DEFAULT_TIMEOUT_MS
    const controller = new AbortController()
    const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs)
    
    const data = {
      method,
      id: currentRequestId,
      params: options?.params || null,
      object: options?.objectId || null,
      session: sessionId || null
    }
    
    try{
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
        signal: controller.signal
      })

      const rawBody = await res.text()

      if(!rawBody){
        throw new Error(`HTTP ${res.status} ${res.statusText}: empty response body`)
      }

      let parsedBody: T

      try {
        parsedBody = JSON.parse(rawBody) as T
      }
      catch {
        throw new Error(`HTTP ${res.status} ${res.statusText}: invalid JSON response: ${rawBody}`)
      }

      if(!res.ok){
        throw new Error(`HTTP ${res.status} ${res.statusText}: ${rawBody}`)
      }

      return parsedBody
    }
    catch(err){
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error(`Method ${method} via ${url} timed out after ${timeoutMs}ms`)
      }

      const message = err instanceof Error ? err.message : String(err)
      throw new Error(`Method ${method} via ${url} failed: ${message}`)
    }
    finally{
      clearTimeout(timeoutHandle)
    }
  }

  const setSession = (ses: string) => {
    sessionId = ses
  }

  return {
    request,
    setSession
  }
}

export default RPCClient