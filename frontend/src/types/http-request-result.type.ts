export type HttpRequestResult<T = any> = {
    error: boolean;
    response?: T;
    redirect?: string;
}