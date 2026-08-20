/* eslint-disable */
// @ts-nocheck
// noinspection JSUnusedGlobalSymbols

// This file is generated from src/routes. It is kept in the project so local
// builds work even when the route generator has not run yet.

import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as AuthenticatedRouteRouteImport } from './routes/_authenticated/route'
import { Route as AuthRouteImport } from './routes/auth'
import { Route as AuthenticatedDashboardRouteImport } from './routes/_authenticated/dashboard'
import { Route as AuthenticatedChatRouteImport } from './routes/_authenticated/chat'
import { Route as AuthenticatedDevicesRouteImport } from './routes/_authenticated/devices'
import { Route as AuthenticatedSettingsRouteImport } from './routes/_authenticated/settings'
import { Route as AuthenticatedPlansRouteImport } from './routes/_authenticated/plans'
import { Route as AuthenticatedKeysRouteImport } from './routes/_authenticated/keys'

const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)

const AuthenticatedRouteRoute = AuthenticatedRouteRouteImport.update({
  id: '/_authenticated',
  getParentRoute: () => rootRouteImport,
} as any)

const AuthRoute = AuthRouteImport.update({
  id: '/auth',
  path: '/auth',
  getParentRoute: () => rootRouteImport,
} as any)

const AuthenticatedDashboardRoute = AuthenticatedDashboardRouteImport.update({
  id: '/dashboard',
  path: '/dashboard',
  getParentRoute: () => AuthenticatedRouteRoute,
} as any)

const AuthenticatedChatRoute = AuthenticatedChatRouteImport.update({
  id: '/chat',
  path: '/chat',
  getParentRoute: () => AuthenticatedRouteRoute,
} as any)

const AuthenticatedDevicesRoute = AuthenticatedDevicesRouteImport.update({
  id: '/devices',
  path: '/devices',
  getParentRoute: () => AuthenticatedRouteRoute,
} as any)

const AuthenticatedSettingsRoute = AuthenticatedSettingsRouteImport.update({
  id: '/settings',
  path: '/settings',
  getParentRoute: () => AuthenticatedRouteRoute,
} as any)

const AuthenticatedPlansRoute = AuthenticatedPlansRouteImport.update({
  id: '/plans',
  path: '/plans',
  getParentRoute: () => AuthenticatedRouteRoute,
} as any)

const AuthenticatedKeysRoute = AuthenticatedKeysRouteImport.update({
  id: '/keys',
  path: '/keys',
  getParentRoute: () => AuthenticatedRouteRoute,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/auth': typeof AuthRoute
  '/dashboard': typeof AuthenticatedDashboardRoute
  '/chat': typeof AuthenticatedChatRoute
  '/devices': typeof AuthenticatedDevicesRoute
  '/settings': typeof AuthenticatedSettingsRoute
  '/plans': typeof AuthenticatedPlansRoute
  '/keys': typeof AuthenticatedKeysRoute
}

export interface FileRoutesByTo extends FileRoutesByFullPath {}

export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/_authenticated': typeof AuthenticatedRouteRouteWithChildren
  '/auth': typeof AuthRoute
  '/_authenticated/dashboard': typeof AuthenticatedDashboardRoute
  '/_authenticated/chat': typeof AuthenticatedChatRoute
  '/_authenticated/devices': typeof AuthenticatedDevicesRoute
  '/_authenticated/settings': typeof AuthenticatedSettingsRoute
  '/_authenticated/plans': typeof AuthenticatedPlansRoute
  '/_authenticated/keys': typeof AuthenticatedKeysRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/auth' | '/dashboard' | '/chat' | '/devices' | '/settings' | '/plans' | '/keys'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/auth' | '/dashboard' | '/chat' | '/devices' | '/settings' | '/plans' | '/keys'
  id: '__root__' | '/' | '/_authenticated' | '/auth' | '/_authenticated/dashboard' | '/_authenticated/chat' | '/_authenticated/devices' | '/_authenticated/settings' | '/_authenticated/plans' | '/_authenticated/keys'
  fileRoutesById: FileRoutesById
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': { id: '/'; path: '/'; fullPath: '/'; preLoaderRoute: typeof IndexRouteImport; parentRoute: typeof rootRouteImport }
    '/_authenticated': { id: '/_authenticated'; path: ''; fullPath: '/'; preLoaderRoute: typeof AuthenticatedRouteRouteImport; parentRoute: typeof rootRouteImport }
    '/auth': { id: '/auth'; path: '/auth'; fullPath: '/auth'; preLoaderRoute: typeof AuthRouteImport; parentRoute: typeof rootRouteImport }
    '/_authenticated/dashboard': { id: '/_authenticated/dashboard'; path: '/dashboard'; fullPath: '/dashboard'; preLoaderRoute: typeof AuthenticatedDashboardRouteImport; parentRoute: typeof AuthenticatedRouteRoute }
    '/_authenticated/chat': { id: '/_authenticated/chat'; path: '/chat'; fullPath: '/chat'; preLoaderRoute: typeof AuthenticatedChatRouteImport; parentRoute: typeof AuthenticatedRouteRoute }
    '/_authenticated/devices': { id: '/_authenticated/devices'; path: '/devices'; fullPath: '/devices'; preLoaderRoute: typeof AuthenticatedDevicesRouteImport; parentRoute: typeof AuthenticatedRouteRoute }
    '/_authenticated/settings': { id: '/_authenticated/settings'; path: '/settings'; fullPath: '/settings'; preLoaderRoute: typeof AuthenticatedSettingsRouteImport; parentRoute: typeof AuthenticatedRouteRoute }
    '/_authenticated/plans': { id: '/_authenticated/plans'; path: '/plans'; fullPath: '/plans'; preLoaderRoute: typeof AuthenticatedPlansRouteImport; parentRoute: typeof AuthenticatedRouteRoute }
    '/_authenticated/keys': { id: '/_authenticated/keys'; path: '/keys'; fullPath: '/keys'; preLoaderRoute: typeof AuthenticatedKeysRouteImport; parentRoute: typeof AuthenticatedRouteRoute }
  }
}

interface AuthenticatedRouteRouteChildren {
  AuthenticatedDashboardRoute: typeof AuthenticatedDashboardRoute
  AuthenticatedChatRoute: typeof AuthenticatedChatRoute
  AuthenticatedDevicesRoute: typeof AuthenticatedDevicesRoute
  AuthenticatedSettingsRoute: typeof AuthenticatedSettingsRoute
  AuthenticatedPlansRoute: typeof AuthenticatedPlansRoute
  AuthenticatedKeysRoute: typeof AuthenticatedKeysRoute
}

const AuthenticatedRouteRouteChildren: AuthenticatedRouteRouteChildren = {
  AuthenticatedDashboardRoute,
  AuthenticatedChatRoute,
  AuthenticatedDevicesRoute,
  AuthenticatedSettingsRoute,
  AuthenticatedPlansRoute,
  AuthenticatedKeysRoute,
}

const AuthenticatedRouteRouteWithChildren = AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren)

const rootRouteChildren = {
  IndexRoute,
  AuthenticatedRouteRoute: AuthenticatedRouteRouteWithChildren,
  AuthRoute,
}

export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

import type { getRouter } from './router.tsx'
import type { startInstance } from './start.ts'
declare module '@tanstack/react-start' {
  interface Register {
    ssr: true
    router: Awaited<ReturnType<typeof getRouter>>
    config: Awaited<ReturnType<typeof startInstance.getOptions>>
  }
}
