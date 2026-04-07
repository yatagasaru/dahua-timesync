declare module "bun" {
  interface Env {
    HOST: string;
    USER_NAME: string;
    PASSWORD: string;
  }
}

export enum RPC_GLOBAL {
  login = "global.login",
  logout = "global.logout",
  getCurrentTime = "global.getCurrentTime",
  setCurrentTime = "global.setCurrentTime"
}

export type RequestOptions = {
  params?: Record<string, unknown> | null;
  objectId?: string | null;
  url?: string;
}

export type RpcResponse<T> = {
  id: number
  result: boolean;
  session: string;
  params: T;
}

export type LoginStep1Response = RpcResponse<{
  authorization: string;
  encryption: string;
  random: string;
  realm: string;
}>

export type LoginStep2Response = RpcResponse<{
  keepAliveInterval: number
}>

export type GetCurrentTimeResponse = RpcResponse<{time: string}>

export type GenericSuccessResponse = RpcResponse<null>

export type DahuaRpcInstance = {
  login: () => Promise<LoginStep2Response>;
  logout: () => Promise<GenericSuccessResponse>;
  getCurrentTime: () => Promise<GetCurrentTimeResponse>;
  setCurrentTime: (tolerance?: number) => Promise<GenericSuccessResponse>;
}