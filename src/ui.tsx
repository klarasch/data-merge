import {
  Button,
  Columns,
  Container,
  IconLayerFrame16,
  IconSpaceHorizontal16,
  Muted,
  render,
  Text,
  TextboxMultiline,
  TextboxNumeric,
  VerticalSpace
} from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { h } from 'preact'
import { useCallback, useState } from 'preact/hooks'

import { CloseHandler, GenerateFrames } from './types'

function Plugin() {
  const [csvData, setCsvData] = useState('')
  const [framesPerRow, setframesPerRow] = useState<number | null>(5)
  const [framesPerRowString, setframesPerRowString] = useState('5')
  const [gap, setGap] = useState<number | null>(40)
  const [gapString, setGapString] = useState('40')
  const handleGenerateFramesClick = useCallback(
    function () {
      if (csvData !== null && framesPerRow !== null && gap !== null) {
        emit<GenerateFrames>('GENERATE_FRAMES', csvData, framesPerRow, gap)
      }
    },
    [csvData, framesPerRow, gap]
  )
  // const handleCloseButtonClick = useCallback(function () {
  //   emit<CloseHandler>('CLOSE')
  // }, [])
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
      <TextboxNumeric
        integer
        onNumericValueInput={setframesPerRow}
        onValueInput={setframesPerRowString}
        value={framesPerRowString}
        variant="border"
        icon={<IconLayerFrame16 />}
      />
      <TextboxNumeric
        integer
        onNumericValueInput={setGap}
        onValueInput={setGapString}
        value={gapString}
        variant="border"
        icon={<IconSpaceHorizontal16 />}
      />
      <VerticalSpace space="extraLarge" />
      <Button fullWidth onClick={handleGenerateFramesClick}>
        Create
      </Button>
      <VerticalSpace space="small" />
    </Container>
  )
}

export default render(Plugin)
