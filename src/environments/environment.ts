// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  webservicebaseUrl: "http://localhost:3200",
  agbaseUrl: "http://localhost:4200/AG/",
  revenueUrl: "http://localsymfony.com/nodewsrevenue/get_revenue.php",
  revenueSyncUrl: "http://localsymfony.com/nodewsrevenue/set_sortorder.php",
  roasUrl: "http://localsymfony.com/nodewsrevenue/get_roas.php",
  roasCalUrl: "http://localsymfony.com/nodewsrevenue/debug_roas.php",
  nodebasePath: "http://agws.com",
  nodeServerUrl: "http://localhost:3200",
  agserverUrl: "http://localsymfony.com",
  roasAvgUrl: "http://localsymfony.com/nodewsrevenue/get_averages.php",
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
