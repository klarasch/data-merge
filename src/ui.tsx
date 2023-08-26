import {
  Button,
  Columns,
  Container,
  IconLayerFrame16,
  IconSpaceHorizontal16,
  Muted,
  render,
  Stack,
  Text,
  TextboxMultiline,
  TextboxNumeric,
  VerticalSpace
} from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { h } from 'preact'
import { useCallback, useState } from 'preact/hooks'

import { GenerateFrames } from './types'

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
      <VerticalSpace space="extraLarge" />
      <Stack space="medium">
        <Stack space="small">
          <Text>
            <Muted>Data (tab-delimited CSV)</Muted><br />
            Just select cells in your table editor (e.g. Google Sheets) and paste it here.
          </Text>
          <TextboxMultiline
            onValueInput={setCsvData}
            value={csvData}
            variant="border"
            style="font-family: monospace;"
          />
        </Stack>

        <Columns space="medium">
          <Stack space='extraSmall'>
            <Text>
              <Muted>Frames per row</Muted>
            </Text>
            <TextboxNumeric
              integer
              onNumericValueInput={setframesPerRow}
              onValueInput={setframesPerRowString}
              value={framesPerRowString}
              variant="border"
              icon={<IconLayerFrame16 />}
            />
          </Stack>
          <Stack space='extraSmall'>
            <Text>
              <Muted>Gaps (px)</Muted>
            </Text>
            <TextboxNumeric
              integer
              onNumericValueInput={setGap}
              onValueInput={setGapString}
              value={gapString}
              variant="border"
              icon={<IconSpaceHorizontal16 />}
            />
          </Stack>
        </Columns>

        <Button fullWidth onClick={handleGenerateFramesClick}>
          Create frames
        </Button>
        <VerticalSpace space="small" />
      </Stack>
    </Container>
  )
}

export default render(Plugin)
