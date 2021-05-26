import { getResourceLink } from 'single-scripture-rcl'
import { core } from 'scripture-resources-rcl'
import {
  LOADING_RESOURCE,
  MANIFEST_INVALID_ERROR,
  MANIFEST_NOT_FOUND_ERROR,
  RESOURCES_GET_MAX_WAIT_TIME,
} from '@common/constants'

export async function getResource({
  bookId,
  chapter,
  verse,
  resourceId,
  owner,
  languageId,
  branch,
  server,
}) {
  const resourceLink = getResourceLink({
    owner,
    languageId,
    resourceId,
    branch,
  })

  let resource

  try {
    resource = await core.resourceFromResourceLink({
      resourceLink,
      reference: {
        projectId: bookId,
        chapter: chapter,
        verse: verse,
      },
      config: {
        server,
        cache: { maxAge: 60 * 1000 },
        timeout: RESOURCES_GET_MAX_WAIT_TIME,
      },
    })
  } catch (e) {
    console.log(`getResource(${resourceLink}) failed, exception: `, e)
  }

  resource = resource || {}
  resource.resourceLink = getRepoUrl(owner, languageId, resourceId, server)
  return resource
}

export async function getResourceManifest(resourceRef) {
  const resource = await getResource(resourceRef)

  if (!resource?.manifest) {
    console.log(`getResourceManifest(${ getResourceLink(resourceRef) }) failed`)
    return null
  }

  return resource?.manifest
}

export async function getResourceBibles(resourceRef) {
  let bibles = null
  let httpCode = null
  const resource = await getResource(resourceRef)

  if (resource?.manifest?.projects) {
    bibles = resource.manifest.projects.map((item) => (item.identifier))
  } else {
    console.log(`getResourceBibles() response`, resource?.manifestHttpResponse)
    httpCode = resource?.manifestHttpResponse?.status
  }

  const resourceLink = resource?.resourceLink
  return { bibles, httpCode, resourceLink }
}

/**
 * make url for repo
 * @param owner
 * @param languageId
 * @param resourceId
 * @param server
 * @return {string}
 */
export function getRepoUrl(owner, languageId, resourceId, server) {
  const repoUrl = `${owner}/${languageId}_${resourceId}`
  return `${server || ''}/${repoUrl}`
}

/**
 * Appends path to resource repo to error message
 * @param errorStr - base error message
 * @param owner
 * @param languageId
 * @param resourceId
 * @param server
 * @return {string} error string with resource path
 */
export function getErrorMessageForResourceLink(errorStr, owner, languageId, resourceId, server) {
  const repoUrl = getRepoUrl(owner, languageId, resourceId, server)
  const errorMsg = errorStr + repoUrl
  return errorMsg
}


/**
 * decode resource status into string.  Currently only English
 * @param resourceStatus - object that contains state and errors that are detected
 * @param owner
 * @param languageId
 * @param resourceId
 * @param server - contains the server being used
 * @return empty string if no error, else returns user error message
 */
export function getResourceMessage(resourceStatus, owner, languageId, resourceId, server) {
  let messageKey = ''

  if (resourceStatus['loading']) {
    messageKey = LOADING_RESOURCE
  } else {
    if (resourceStatus['manifestNotFoundError']) {
      messageKey = MANIFEST_NOT_FOUND_ERROR
    } else if (resourceStatus['invalidManifestError']) {
      messageKey = MANIFEST_INVALID_ERROR
    }

    if (messageKey) {
      messageKey = getErrorMessageForResourceLink(messageKey, owner, languageId, resourceId, server)
      console.log(`getResourceMessage() - Resource Error: ${messageKey}`)
    }
  }
  return messageKey
}
