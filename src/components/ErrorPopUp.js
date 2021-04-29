import React from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import SaveIcon from '@material-ui/icons/Save'
import { useRouter } from 'next/router'
import DraggableCard from 'translation-helps-rcl/dist/components/DraggableCard'

export default function ErrorPopup(
  {
    onClose,
    title,
    message,
    id,
  }) {
  const router = useRouter()

  const content =
    <>
      {message}
      <Button
        size='large'
        color='primary'
        className='my-3'
        variant='contained'
        onClick={() => router.push('/feedback')}
        startIcon={<SaveIcon />}
      >
        Submit Feedback
      </Button>
    </>

  return (
    <DraggableCard
      open={true}
      title={title}
      content={content}
      showRawContent={true}
      onClose={() => onClose && onClose()}
    />
  )
}

ErrorPopup.defaultProps = {
  id: `error_popup`,
}

ErrorPopup.propTypes = {
  /** On close event handler */
  onClose: PropTypes.func,
  /** title Content */
  title: PropTypes.oneOfType(PropTypes.string, PropTypes.object),
  /** message Content */
  message: PropTypes.oneOfType(PropTypes.string, PropTypes.object),
  /** optional identifier */
  id: PropTypes.string,
}
