import camelcase from "./utils/camelcase"
import mapper from "./utils/mapper"

// https://docs.microsoft.com/en-us/azure/azure-monitor/app/apm-tables#apprequests
const appRequestMap = {
    appId: "resourceGuid",
    applicationVersion: "appVersion",
    appName: "resourceId",
    cloudRoleInstance: "appRoleInstance",
    cloudRoleName: "appRoleName",
    customDimensions: "properties",
    customMeasurements: "measurements",
    duration: "durationMs",
    httpMethod: "http.method",
    httpPath: "http.path",
    itemType: "type",
    operationParentId: "parentId",
    resultCode: "http.statusCode",
    time: "timestamp",
    timeGenerated: "timestamp",
    url: "http.url",
}

// https://docs.microsoft.com/en-us/azure/azure-monitor/app/apm-tables#appdependencies
const appDependencyMap = {
    appId: "resourceGuid",
    applicationVersion: "appVersion",
    appName: "resourceId",
    cloudRoleInstance: "appRoleInstance",
    cloudRoleName: "appRoleName",
    customDimensions: "properties",
    customMeasurements: "measurements",
    duration: "durationMs",
    httpMethod: "http.method",
    httpPath: "http.path",
    operationParentId: "parentId",
    //resultCode: "http.statusCode",
    time: "timestamp",
    TimeGenerated: "timestamp",
    url: "http.url",
}

const appEventMap = {
    appId: "resourceGuid",
    applicationVersion: "appVersion",
    appName: "resourceId",
    cloudRoleInstance: "appRoleInstance",
    cloudRoleName: "appRoleName",
    customDimensions: "properties",
    customMeasurements: "measurements",
    duration: "durationMs",
    itemId: "id",
    operationParentId: "parentId",
    time: "timestamp",
    TimeGenerated: "timestamp",
}

const appPageViewMap = {
    appId: "resourceGuid",
    applicationVersion: "appVersion",
    appName: "resourceId",
    cloudRoleInstance: "appRoleInstance",
    cloudRoleName: "appRoleName",
    customDimensions: "properties",
    customMeasurements: "measurements",
    duration: "durationMs",
    operationParentId: "parentId",
    time: "timestamp",
    TimeGenerated: "timestamp",
}

export const normalizeAppRequest = (data: Record<string, any>): Record<string, any> => {
    const request = mapper(camelcase(data), appRequestMap)
    delete request.IKey
    request.type = "AppRequest"
    return request
}

export const normalizeAppDependency = (data: Record<string, any>): Record<string, any> => {
    // This is going to be overwritten by mapper, so keep a copy if exists (app insights only)
    const { type } = data
    let dependency = mapper(camelcase(data), appDependencyMap)
    delete dependency.iKey
    if (type) {
        dependency.dependencyType = type
    }
    if (
        ["sql", "mariadb", "postgresql", "cosmos", "table", "storage"].indexOf(
            dependency.dependencyType.toLowerCase(),
        ) !== -1
    ) {
        if (dependency.name) {
            dependency.name = `DAtastore/${dependency.name}`
        }
        dependency = mapper(dependency, { data: "db.statement", resultCode: "db.responseCode", target: "db.target" })
    }
    if (dependency.dependencyType.toLowerCase() === "http") {
        if (dependency.name) {
            dependency.name = `External/${dependency.name}`
        }
        dependency = mapper(dependency, { resultCode: "http.statusCode", target: "http.target" })
    }
    dependency.type = "AppDependency"
    return dependency
}

export const normalizeAppEvent = (data: Record<string, any>): Record<string, any> => {
    const event = mapper(camelcase(data), appEventMap)
    delete event.iKey
    event.type = "AppEvent"
    return event
}

export const normalizeAppPageView = (data: Record<string, any>): Record<string, any> => {
    const pageView = mapper(camelcase(data), appPageViewMap)
    delete pageView.iKey
    pageView.type = "AppPageView"
    return pageView
}