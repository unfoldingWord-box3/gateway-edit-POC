import React,
{
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react'
import PropTypes from 'prop-types'
import useLocalStorage from '@hooks/useLocalStorage'
import { AuthenticationContext } from 'gitea-react-toolkit'
import { UserLocalStorage } from '@utils/UserLocalStorage'
import * as useULS from '@hooks/useUserLocalStorage'

export const StoreContext = createContext({})

export default function StoreContextProvider(props) {
  const { state: authentication } = useContext(AuthenticationContext)
  const username = authentication?.user?.username || ''

  /**
   * wrapper for useULS.useUserLocalStorage that applies current username
   * @param {string} key
   * @param {any} initialValue
   * @return {any[]}
   */
  function useUserLocalStorage(key, initialValue) {
    return useULS.useUserLocalStorage(username, key, initialValue)
  }

  const [owner, setOwner] = useUserLocalStorage('owner', '')
  const [languageId, setLanguageId] = useUserLocalStorage('languageId', '')
  const [showAccountSetup, setShowAccountSetup] = useLocalStorage(
    'showAccountSetup',
    true,
  )
  const userLocalStorage = useMemo(() => (new UserLocalStorage(username)), [username])
  const [taArticle, setTaArticle] = useState(null)
  const [selectedQuote, setQuote] = useLocalStorage('selectedQuote', null)
  // TODO blm: for now we use unfoldingWord for original language bibles
  const [scriptureOwner, setScriptureOwner] = useState('unfoldingWord')
  const [server, setServer] = useState('https://git.door43.org')
  const [branch, setBranch] = useState('master')
  const [bibleReference, setBibleReference] = useUserLocalStorage('bibleReference', {
    bookId: 'mat',
    chapter: '1',
    verse: '1',
  })

  const [supportedBibles, setSupportedBibles] = useLocalStorage('bibles', [])
  const [currentLayout, setCurrentLayout] = useUserLocalStorage('resourceLayout', null)

  function onReferenceChange(bookId, chapter, verse) {
    setQuote(null)
    setBibleReference(prevState => ({
      ...prevState,
      bookId,
      chapter,
      verse,
    }))
  }

  function updateTaDetails(supportReference) {
    if (supportReference) {
      const path = supportReference?.replace('rc://*/ta/man/', '')
      const split = path.split('/')

      setTaArticle({
        projectId: split[0],
        filePath: `${split[1]}/01.md`,
      })
    } else {
      setTaArticle(null)
    }
  }

  const value = {
    state: {
      showAccountSetup,
      scriptureOwner,
      bibleReference,
      selectedQuote,
      languageId,
      taArticle,
      server,
      branch,
      owner,
      supportedBibles,
      currentLayout,
      useUserLocalStorage,
      userLocalStorage,
    },
    actions: {
      setShowAccountSetup,
      setScriptureOwner,
      onReferenceChange,
      updateTaDetails,
      setLanguageId,
      setBranch,
      setServer,
      setQuote,
      setOwner,
      setSupportedBibles,
      setCurrentLayout,
    },
  }

  return (
    <StoreContext.Provider value={value}>
      {props.children}
    </StoreContext.Provider>
  )
}

StoreContextProvider.propTypes = { children: PropTypes.object }
