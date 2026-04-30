export type RouteType = {
    route: string,
    title?: string,
    filePathTemplate?: string,
    useLayout?: string | boolean,
    load(): void,
    scripts?: string[]
}