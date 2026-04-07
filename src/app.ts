import RPCClient from "./rpc-client"
import { formatDate, encrypt } from "./utils"
import { RPC_GLOBAL, type GetCurrentTimeResponse, 
  type GenericSuccessResponse,
  type RequestOptions, 
  type LoginStep1Response, 
  type LoginStep2Response, 
  type DahuaRpcInstance} from "./types"

const DahuaRpc = (host:string, username:string, password:string): DahuaRpcInstance => {
  const nvrURL = `http://${host}`

  const client = RPCClient(nvrURL)

  const login = async (): Promise<LoginStep2Response> => {
    const url = `${nvrURL}/RPC2_Login`

    //login step 1: get session, realm, random for real login
    const opt:RequestOptions = {
      url,
      params: {
        userName: username,
        password: "",
        clientType: "Web3.0"
      }
    }

    const login1res = await client.request<LoginStep1Response>(RPC_GLOBAL.login, opt)
    client.setSession(login1res.session)

    //login step 2: real login
    const loginOpt:RequestOptions = {
      url,
      params: {
        userName: username,
        password: encrypt(username, password, login1res.params.realm, login1res.params.random),
        clientType: "Web3.0",
        authorityType: "Default",
        passwordType: "Default",
      }
    }

    const login2res = await client.request<LoginStep2Response>(RPC_GLOBAL.login, loginOpt)

    if (login2res.result === false) {
      throw new Error("Login failed: NVR rejected credentials")
    }

    client.setSession(login2res.session)

    return login2res
  }

  const logout = async(): Promise<GenericSuccessResponse> => {
    const res = await client.request<GenericSuccessResponse>(RPC_GLOBAL.logout)

    if (res.result === false) {
      throw new Error("Logout failed")
    }

    return res
  }

  const getCurrentTime = async(): Promise<GetCurrentTimeResponse> => {
    const res = await client.request<GetCurrentTimeResponse>(RPC_GLOBAL.getCurrentTime)

    if (res.result === false) {
      throw new Error("getCurrentTime failed")
    }

    return res
  }

  const setCurrentTime = async(tolerance = 5): Promise<GenericSuccessResponse> => {
    const opt:RequestOptions = {
      params: {
        time: formatDate(new Date()),
        tolerance
      }
    }

    const res = await client.request<GenericSuccessResponse>(RPC_GLOBAL.setCurrentTime, opt)

    if (res.result === false) {
      throw new Error("setCurrentTime failed: NVR rejected the time update")
    }

    return res
  }

  return {
    login,
    logout,
    getCurrentTime,
    setCurrentTime
  }
}

export default DahuaRpc