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
import { useCallback, useState, useEffect } from 'preact/hooks'

import { GenerateFrames } from './types'

function Plugin() {
  const [csvData, setCsvData] = useState('')
  const [framesPerRow, setframesPerRow] = useState<number | null>(5)
  const [framesPerRowString, setframesPerRowString] = useState('5')
  const [gap, setGap] = useState<number | null>(40)
  const [gapString, setGapString] = useState('40')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, message, progress } = event.data.pluginMessage;
      if (type === 'error') {
        setIsLoading(false);
        console.log("set isLoading to false", isLoading);
        setErrorMessage(message);
        setProgressMessage('');
      } else if (type === 'progress') {
        const total = progress.total;
        const current = progress.current;
        setProgressMessage(`Generating frame ${current} out of ${total}...`);
      } else if (type === 'generation-complete') {
        console.log("set isLoading to false", isLoading);
        setIsLoading(false);
        setProgressMessage('');
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handlePaste = (event: ClipboardEvent) => {
    event.preventDefault(); // Prevent the default paste action
    const pastedData = event.clipboardData?.getData('text') || '';
    const trimmedData = pastedData
      .split('\n')
      .filter(line => line.trim() !== '') // Remove empty lines
      .join('\n');
    setCsvData(trimmedData); // Set the trimmed data to state
  };

  const handleGenerateFramesClick = useCallback(
    function () {
      // Clear any existing error message
      setErrorMessage('');
      setIsLoading(true);
      console.log("set isLoading to true", isLoading);

      console.log("Emitting GenerateFrames event", { csvData, framesPerRow, gap });
      emit<GenerateFrames>('GENERATE_FRAMES', csvData, framesPerRow ||  5, gap || 40);
    },
    [csvData, framesPerRow, gap, isLoading]
  );

  return (
    <Container space="small">
      <VerticalSpace space="extraLarge" />
      <Stack space="medium">
        <Text>
          1. Select template frame<br />
          <Muted>Make a frame with the template to be data merged. Make sure your text layers' names match column names of your data.</Muted>
        </Text>
        <Stack space="small">
          <Text>
            2. Paste data (tab-delimited CSV)<br />
            <Muted>Select cells in your table editor (e.g. Google Sheets) and paste it here (expected input is tab-delimited CSV).</Muted>
          </Text>
          <TextboxMultiline
            onValueInput={setCsvData}
            onPaste={handlePaste}
            value={csvData}
            variant="border"
            style="font-family: monospace;"
          />
        </Stack>
        <Text>
          3. Configure options
        </Text>
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

        {errorMessage && <Text>⚠️ {errorMessage}</Text>}
        <Button disabled={isLoading} loading={isLoading} fullWidth onClick={handleGenerateFramesClick}>
          Create frames
        </Button>
        {progressMessage && <Text>{progressMessage}</Text>}

      </Stack>
    </Container>
  )
}

export default render(Plugin)
