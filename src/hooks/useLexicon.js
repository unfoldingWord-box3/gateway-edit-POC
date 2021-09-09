import { useEffect, useState } from 'react'
import { useRepository } from 'gitea-react-toolkit'
import { isNT } from '@common/BooksOfTheBible'
import { delay } from '@utils/resources'
import { initLexicon } from '@utils/lexiconHelpers'

/**
 * manage state for feedbackCard
 * @param {boolean} open - true when card is displayed
 * @return {{state: {setEmailError: (value: unknown) => void, submitting: boolean, showError: boolean, emailError: unknown, showEmailError: boolean, name: string, category: string, message: string, networkError: unknown, showSuccess: boolean, email: string}, actions: {setName: (value: (((prevState: string) => string) | string)) => void, setSubmitting: (value: (((prevState: boolean) => boolean) | boolean)) => void, doUpdateBounds: doUpdateBounds, setEmail: (value: (((prevState: string) => string) | string)) => void, setCategory: (value: (((prevState: string) => string) | string)) => void, setShowError: (value: (((prevState: boolean) => boolean) | boolean)) => void, setShowSuccess: (value: (((prevState: boolean) => boolean) | boolean)) => void, setShowEmailError: (value: (((prevState: boolean) => boolean) | boolean)) => void, setMessage: (value: (((prevState: string) => string) | string)) => void, setNetworkError: (value: unknown) => void}}}
 */
export default function useLexicon({
  bookId,
  languageId,
  server,
}) {
  const [repository, setRepository] = useState(null)
  const [fetchingLex, setFetchingLex] = useState(false)
  const [greekLexConfig, setGreekLexConfig] = useState(null)
  const [hebrewLexConfig, setHebrewLexConfig] = useState(null)

  const isNT_ = isNT(bookId)
  console.log(`StoreContext: useRepository isNT_`, isNT_)

  const origlangLexConfig = isNT_ ? greekLexConfig : hebrewLexConfig
  const lexRepoFullName = origlangLexConfig ?
    `${origlangLexConfig.owner}/${origlangLexConfig.languageId}_${origlangLexConfig.resourceId}`
    : null
  const lexRepoParams = {
    full_name: lexRepoFullName,
    branch: origlangLexConfig?.ref,
    config: origlangLexConfig,
    repository,
    onRepository: onRepository,
  }
  console.log(`StoreContext: useRepository parms`, lexRepoParams)
  const results = useRepository(lexRepoParams)
  console.log(`StoreContext: useRepository repository`, results)

  function onRepository(repo) {
    console.log(`useLexicon.onRepository():`, repo)

    if ( repo?.branch && (repo?.html_url !== repository?.html_url)) {
      setRepository(repo)
    }
  }

  async function fetchLexiconFile(filename) {
    const filePath = `${origlangLexConfig.lexiconPath}/${filename}`
    const file = await results?.actions?.fileFromZip(filePath)
    return file
  }

  async function getLexiconEntry(strongs) {
    const filename = `${strongs}.json`
    const file = await fetchLexiconFile(filename);
    return file
  }

  async function isLexiconCached() {
    const strongs = 1
    const file = await getLexiconEntry(strongs)
    return !!file
  }

  useEffect(() => {
    async function getLexicons() {
      if (languageId && server) {
        const LexOwner = 'test_org'
        const branch = 'master'
        await delay(2000) // wait for other resources to load
        await initLexicon(languageId, server, LexOwner, branch, setGreekLexConfig, true)
        await delay(1000) // wait for other resources to load
        await initLexicon(languageId, server, LexOwner, branch, setHebrewLexConfig, false)
      }
    }

    getLexicons()
  }, [languageId, server])

  useEffect(() => {
    const getLexZip = async () => {
      if (!fetchingLex && repository && results?.actions?.storeZip) {
        setFetchingLex(true)
        let repoReadable = await isLexiconCached()

        if (repoReadable) {
          console.log(`useLexicon: lexicon zip already loaded`)
        } else {
          // fetch repo zip file and store in index DB
          await results?.actions?.storeZip()
          // verify that zip file is loaded
          repoReadable = await isLexiconCached()

          if (!repoReadable) {
            console.warn(`useLexicon: could not load lexicon zip`)
          }
        }

        setFetchingLex(false)
      }
    }

    getLexZip()
  }, [repository])

  return {
    state: {
      repository,
      greekLexConfig,
      hebrewLexConfig,
      origlangLexConfig,
    },
    actions: {
      getLexiconEntry,
      setGreekLexConfig,
      setHebrewLexConfig,
    },
  }
}
