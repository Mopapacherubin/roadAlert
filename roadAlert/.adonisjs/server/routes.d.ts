import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'verifyOtp': { paramsTuple?: []; params?: {} }
    'confirmOtp': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'reports.index': { paramsTuple?: []; params?: {} }
    'agent_dashboard.index': { paramsTuple?: []; params?: {} }
    'reports.store': { paramsTuple?: []; params?: {} }
    'reports.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.history': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.store_photo': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.destroy_photo': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'photoId': ParamValue} }
    'reports.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'user.index': { paramsTuple?: []; params?: {} }
    'user.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'user.update_role': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'user.disable': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'user.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'dashboard.stats': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'verifyOtp': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'reports.index': { paramsTuple?: []; params?: {} }
    'agent_dashboard.index': { paramsTuple?: []; params?: {} }
    'reports.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.history': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'user.index': { paramsTuple?: []; params?: {} }
    'user.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'dashboard.stats': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'verifyOtp': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'reports.index': { paramsTuple?: []; params?: {} }
    'agent_dashboard.index': { paramsTuple?: []; params?: {} }
    'reports.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.history': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'user.index': { paramsTuple?: []; params?: {} }
    'user.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'dashboard.stats': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'new_account.store': { paramsTuple?: []; params?: {} }
    'confirmOtp': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'reports.store': { paramsTuple?: []; params?: {} }
    'reports.store_photo': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'reports.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.destroy_photo': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'photoId': ParamValue} }
    'user.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'reports.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'user.update_role': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'user.disable': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}