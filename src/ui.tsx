import {
  Button,
  Columns,
  Container,
  Muted,
  render,
  Text,
  TextboxMultiline,
  VerticalSpace
} from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { h } from 'preact'
import { useCallback, useState } from 'preact/hooks'

import { CloseHandler, GenerateFrames } from './types'

function Plugin() {
  const [csvData, setCsvData] = useState('')
  const handleGenerateFramesClick = useCallback(
    function () {
      if (csvData !== null) {
        emit<GenerateFrames>('GENERATE_FRAMES', csvData)
      }
    },
    [csvData]
  )
  const handleCloseButtonClick = useCallback(function () {
    emit<CloseHandler>('CLOSE')
  }, [])
  return (
    <Container space="medium">
      <VerticalSpace space="large" />
      <Text>
        <Muted>Data</Muted>
      </Text>
      <VerticalSpace space="small" />
      <TextboxMultiline
        onValueInput={setCsvData}
        value={csvData}
        variant="border"
      />
      <VerticalSpace space="extraLarge" />
      <Columns space="extraSmall">
        <Button fullWidth onClick={handleGenerateFramesClick}>
          Create
        </Button>
        <Button fullWidth onClick={handleCloseButtonClick} secondary>
          Close
        </Button>
      </Columns>
      <VerticalSpace space="small" />
    </Container>
  )
}

export default render(Plugin)
