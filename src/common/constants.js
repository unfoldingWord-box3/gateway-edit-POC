import packagefile from '../../package.json'

export const APP_VERSION = packagefile.version
export const APP_NAME = 'gatewayEdit'
export const BASE_URL = 'https://git.door43.org'
export const TOKEN_ID = 'gatewayEdit'
export const FEEDBACK_PAGE = '/feedback'

export const SERVER_MAX_WAIT_TIME = 5000 // in milliseconds
export const SERVER_MAX_WAIT_TIME_RETRY = 10000 // in milliseconds
export const HTTP_GET_MAX_WAIT_TIME = 5000 // in milliseconds
export const RESOURCES_GET_MAX_WAIT_TIME = 10000 // in milliseconds

// UI text - may eventually need to localize
export const MANIFEST_NOT_FOUND_ERROR = 'This resource manifest failed to load. Please confirm that the correct manifest.yaml file exists in the resource at:\n'
export const MANIFEST_INVALID_ERROR = 'The manifest for this resource is invalid. Resource is at:\n'
export const NO_ORGS_ERROR = 'The application can not continue. The current username is not part of a DCS organization. Please contact your administrator.'
export const ORGS_NETWORK_ERROR = 'Network Error loading User Organizations'
export const LOADING_RESOURCE = 'Loading Resource...'
export const LOCAL_NETWORK_DISCONNECTED_ERROR = 'Please check your network connection. No network connection was detected.'
export const SERVER_UNREACHABLE_ERROR = 'Please check your internet connection. The application is unable to reach the server.'
// eslint-disable-next-line no-template-curly-in-string
export const SERVER_OTHER_ERROR = 'The server returned an ${http_code} error. Please try again or submit feedback.'
export const AUTHENTICATION_ERROR = 'The application is no longer logged in. Please login again.'
export const NETWORK_ERROR = `Network Error`
export const SEND_FEEDBACK = 'Send Feedback'
export const LOGIN = 'Login'
export const RETRY = 'Retry'
export const CANCEL = 'Cancel'
export const CLOSE = 'Close'
export const LOADING = 'Loading...'
