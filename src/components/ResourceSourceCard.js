import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import {
  Card,
  useContent,
  TsvTranslate,
  ERROR_STATE,
  useCardState,
  useTsvMerger,
  useUserBranch,
  MANIFEST_NOT_LOADED_ERROR,
} from 'translation-helps-rcl'
import { useEdit } from 'gitea-react-toolkit'
import { getResourceErrorMessage } from 'single-scripture-rcl'
import { getResourceMessage } from '@utils/resources'
import { RESOURCE_HTTP_CONFIG, SERVER_MAX_WAIT_TIME_RETRY } from '@common/constants'
import generateEditFilePath from '@utils/generateEditFilePath'
import getSha from '@utils/getSha'
import { Grid } from '@material-ui/core'

export default function ResourceSourceCard({
  id,
  title,
  verse,
  owner,
  server,
  appRef,
  chapter,
  classes,
  filePath,
  setQuote,
  viewMode,
  projectId,
  languageId,
  resourceId,
  errorMessage,
  loggedInUser,
  selectedQuote,
  disableFilters,
  authentication,
  updateTaDetails,
  onResourceError,
  setSavedChanges,
  disableNavigation,
  hideMarkdownToggle,
  useUserLocalStorage,
  showSaveChangesPrompt,
}) {
  const [content, setContent] = useState('')
  const [saved, setSaved] = useState(true)
  const cardResourceId = (resourceId === 'twl') && (viewMode === 'markdown') ? 'tw' : resourceId

  function updateTempContent(c) {
    setContent(c)
    setSavedChanges(cardResourceId, false)
  }

  // If content changes then set whether it's saved or not.
  useEffect(() => {
    if (content) {
      setSaved(false)
    } else {
      setSaved(true)
    }
  }, [content])

  // Useful to clear content and saved state when chapter and verse changes.
  useEffect(() => {
    setContent('')
    setSaved(true)
  }, [chapter, verse, filePath])

  // Useful to clear content when selectedQuote.quote and selectedQuote.occurrence change, so that tw clears the content value on selection.
  useEffect(() => {
    if (cardResourceId == 'tw') {
      setContent('')
    }
  }, [cardResourceId, selectedQuote?.quote, selectedQuote?.occurrence])

  const {
    state: {
      listRef,
      contentRef,
      usingUserBranch,
      workingResourceBranch,
    },
    actions: { startEdit },
  } = useUserBranch({
    owner,
    server,
    appRef,
    languageId,
    cardId: id,
    loggedInUser,
    authentication,
    cardResourceId,
    onResourceError,
    useUserLocalStorage,
  })

  const { 
    markdown: sourceMarkdown, 
    items: sourceItems,
    tsvs: tsvs_source,
    resource: sourceResource,
    fetchResponse: sourceFetchResponse,
    resourceStatus: sourceResourceStatus,
    reloadResource: sourceReloadResource,
  } = useContent({
    verse,
    chapter,
    projectId,
    listRef: 'master',
    languageId: 'en',
    resourceId: 'tn',
    owner: 'unfoldingWord',
    server,
  })

  const {
    tsvs,
    items,
    markdown,
    resource,
    fetchResponse,
    resourceStatus,
    reloadResource,
  } = useContent({
    verse,
    owner,
    server,
    chapter,
    listRef,
    filePath,
    viewMode,
    projectId,
    contentRef,
    languageId,
    resourceId,
    loggedInUser,
    onResourceError,
    useUserLocalStorage,
    ref: workingResourceBranch,
    httpConfig: RESOURCE_HTTP_CONFIG,
  })

  const {
    state: {
      item, headers, filters, fontSize, itemIndex, markdownView,
    },
    actions: {
      setFilters, setFontSize, setItemIndex, setMarkdownView,
    },
  } = useCardState({
    id,
    items,
    verse,
    chapter,
    setQuote,
    projectId,
    selectedQuote,
    useUserLocalStorage,
    resourceId: cardResourceId,
  })

  let sourceItem = {};
  if(sourceItems && typeof itemIndex == 'number'){
    sourceItem = sourceItems[itemIndex];
  }

  const sha = getSha({
    item, fetchResponse, cardResourceId,
  })
  const editFilePath = generateEditFilePath({
    item,
    resource,
    filePath,
    projectId,
    cardResourceId,
  })

  const {
    isEditing,
    onSaveEdit,
  } = useEdit({
    sha,
    owner,
    content,
    config: {
      cache: { maxAge: 0 },
      ...authentication?.config,
      token: authentication?.token,
      timeout: SERVER_MAX_WAIT_TIME_RETRY,
    },
    author: loggedInUser,
    token: authentication?.token,
    branch: workingResourceBranch,
    filepath: editFilePath,
    repo: `${languageId}_${cardResourceId}`,
  })

  const { onTsvEdit } = useTsvMerger({
    tsvs,
    verse,
    chapter,
    itemIndex,
    setContent: updateTempContent,
  })

  useEffect(() => {
    if (updateTaDetails) {
      const {
        Quote, OrigQuote, Occurrence, SupportReference = null,
      } = item || {}
      updateTaDetails(SupportReference)
      setQuote({
        quote: Quote || OrigQuote,
        occurrence: Occurrence,
        SupportReference,
      })
    }
  }, [item])

  useEffect(() => {
    const error = resourceStatus?.[ERROR_STATE]

    if (error) { // if error was found do callback
      const message = getResourceErrorMessage(resourceStatus) + ` ${owner}/${languageId}/${projectId}/${workingResourceBranch}`
      const isAccessError = resourceStatus[MANIFEST_NOT_LOADED_ERROR]
      onResourceError && onResourceError(message, isAccessError, resourceStatus)
    }
  }, [resourceStatus?.[ERROR_STATE]])

  const message = getResourceMessage(resourceStatus, owner, languageId, resourceId, server, workingResourceBranch)

  async function handleSaveEdit() {
    // Save edit, if succesful trigger resource reload and set saved to true.
    const saveEdit = async (branch) => {
      await onSaveEdit(branch).then((success) => {
        if (success) {
          console.info('Reloading resource')
          reloadResource()
          setSaved(true)
          setSavedChanges(cardResourceId, true)
        } else {
          setSavedChanges(cardResourceId, false)
        }
      })
    }

    // If not using user branch create it then save the edit.
    if (!usingUserBranch) {
      await startEdit().then((branch) => saveEdit(branch))
    } else {// Else just save the edit.
      await saveEdit()
    }
  }

  // Add/Remove resources to/from the array to enable or disable edit mode.
  const editableResources = ['tw', 'ta', 'tn', 'tq', 'twl']
  const editable = editableResources.includes(cardResourceId)



  console.log('ssssssssssssssssssssssssssss',sourceItems);
  console.log('tttttttttttttttttttttttttttt', items)

  return (
    <Card
      id={id}
      title={title}
      items={items}
      classes={classes}
      headers={headers}
      filters={filters}
      editable={editable}
      fontSize={fontSize}
      itemIndex={itemIndex}
      setFilters={setFilters}
      setContent={setContent}
      setFontSize={setFontSize}
      saved={saved || isEditing}
      onSaveEdit={handleSaveEdit}
      setItemIndex={setItemIndex}
      markdownView={markdownView}
      disableFilters={disableFilters}
      cardResourceId={cardResourceId}
      setMarkdownView={setMarkdownView}
      disableNavigation={disableNavigation}
      hideMarkdownToggle={hideMarkdownToggle}
      showSaveChangesPrompt={showSaveChangesPrompt}
    >
      <Grid container spacing={2}>
        <Grid item xs={3} md={3} style={{fontWeight: 'bolder', textAlign: 'center'}}>Sub-head</Grid>
        <Grid item xs={4} md={4} style={{fontWeight: 'bolder', textAlign: 'center', paddingLeft:'10px'}}>Source</Grid>
        <Grid item xs={5} md={5} style={{fontWeight: 'bolder', textAlign: 'center'}}>Target</Grid>
      </Grid>

    { item &&
      <TsvTranslate
        id={`${id}_content`}
        item={item}
        // items={items}
        sourceItem={sourceItem}
        filters={filters}
        editable={editable}
        viewMode={viewMode}
        fontSize={fontSize}
        setQuote={setQuote}
        onTsvEdit={onTsvEdit}
        languageId={languageId}
        setContent={setContent}
        onEdit={updateTempContent}
        markdownView={markdownView}
        selectedQuote={selectedQuote}
        cardResourceId={cardResourceId}
        updateTaDetails={updateTaDetails}
        showSaveChangesPrompt={showSaveChangesPrompt}
        errorMessage={isEditing ? 'Saving Resource...' : message || errorMessage}
        markdown={(cardResourceId == 'ta' || cardResourceId == 'tw') && content.length > 0 ? content : markdown}// Adding content value to maintain edit changes even when switching between markdown and html views on tA.
      />
    }
    </Card>
  )
}

ResourceSourceCard.defaultProps = {
  errorMessage: null,
  title: '',
}

ResourceSourceCard.propTypes = {
  id: PropTypes.string,
  viewMode: PropTypes.string,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  chapter: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  verse: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  server: PropTypes.string.isRequired,
  owner: PropTypes.string.isRequired,
  ref: PropTypes.string.isRequired,
  languageId: PropTypes.string.isRequired,
  resourceId: PropTypes.string.isRequired,
  projectId: PropTypes.string.isRequired,
  updateTaDetails: PropTypes.func,
  setQuote: PropTypes.func,
  filePath: PropTypes.string,
  disableFilters: PropTypes.bool,
  disableNavigation: PropTypes.bool,
  hideMarkdownToggle: PropTypes.bool,
  classes: PropTypes.object,
  selectedQuote: PropTypes.object,
  errorMessage: PropTypes.string,
  useUserLocalStorage: PropTypes.func,
  /** optional callback if error loading resource, parameter returned are:
   *    ({string} errorMessage, {boolean} isAccessError, {object} resourceStatus)
   *    isAccessError - is true if this was an error trying to access file and could likely be due to network connection problem
   *    resourceStatus - is object containing details about problems fetching resource */
  onResourceError: PropTypes.func,
  /** default ref for app (e.g. master) */
  appRef: PropTypes.string,
  /** username of the logged in user */
  loggedInUser: PropTypes.string,
  /** user authentication object */
  authentication: PropTypes.object,
  /** Set whether changes are saved or not so that the saved changes prompts opens when necessary. */
  setSavedChanges: PropTypes.func,
  /** Shows a unsaved changes prompt if there's any. */
  showSaveChangesPrompt: PropTypes.func,
}
