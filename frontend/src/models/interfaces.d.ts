/**
 * History pice of routing
 */
declare interface RouteHistory {
    icon: string;
    title: string;
    routeUrl: string;
}

/**
 * Error object showeble generic message dialog
 */
declare interface ErrorView {
    title: string;
    message: string;
}

/**
 * The generic data viewer modes.
 */
declare type VisionMode = 'inspectElement' | 'withoutAdvOpsions' | 'fullOption';

/**
 * Rotation options
 */
declare type Rotation = 'landscape' | 'portrait';

/**
 * Data file options
 */
declare type DataFileKind = 'new' | 'backup';

/**
 * The inner SPA route object,
 * Contince the the view name to display 
 * and the route vale to rout to. 
 */
declare interface RouteLinkView {
    name: string;
    route: string;
}

/**
 * Option item, containce the view to show in select and the value for selection model.
 */
declare interface OptionItem {
    view: string;
    value: string;
}

