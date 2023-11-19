import { on, once, showUI } from '@create-figma-plugin/utilities'
import { CloseHandler, GenerateFrames } from './types'

export default function () {
  console.log("Plugin main function started");
  on<GenerateFrames>('GENERATE_FRAMES', async function (csvData: string, framesPerRow: number, gap: number) {
    console.log("GenerateFrames event received", { csvData, framesPerRow, gap });
    try {
      await generateFrames(csvData, framesPerRow, gap);
      figma.ui.postMessage({ type: 'generation-complete' });
    } catch (error) {
      console.error("Error in generateFrames:", error);
      figma.ui.postMessage({ type: 'error', message: 'An unexpected error occurred.' });
    }
  });

  once<CloseHandler>('CLOSE', function () {
    console.log("Close event received");
    figma.closePlugin()
  })

  showUI({
    width: 260,
    height: 420
  })
}

async function generateFrames(csvData: string, framesPerRow: number, gap: number) {
  console.log("generateFrames called with", { csvData, framesPerRow, gap });
  // const nodes: Array<SceneNode> = []
  const selectedFrame = figma.currentPage.selection[0]
  console.log("Selected frame:", selectedFrame);

  if (!selectedFrame
    || (selectedFrame.type !== 'FRAME'
      && selectedFrame.type !== 'INSTANCE'
      && selectedFrame.type !== 'COMPONENT')) {
    console.log("Invalid selection");
    figma.ui.postMessage({ type: 'error', message: 'Select a frame, component or instance to use as a template.' });
    return;
  }

  if (!csvData.trim()) {
    console.log("CSV data is empty");
    figma.ui.postMessage({ type: 'error', message: 'No CSV data provided.' });
    return;
  }

  let parsedData;
  let dataLength;
  try {
    parsedData = parseCSVData(csvData);
    dataLength = parsedData.length;
    console.log("Parsed data:", parsedData);
    if (!parsedData.length) {
      console.log("Parsed CSV data is empty");
      throw new Error('Parsed CSV data is empty');
    }
  } catch (error) {
    console.error("Error parsing CSV data:", error);
    figma.ui.postMessage({ type: 'error', message: 'Error parsing CSV data.' });
    return;
  }

  parsedData.forEach((row, index) => {
    console.log(`Row ${index}:`, row);

    if (typeof row !== 'object' || row === null) {
      console.error(`Row ${index} is not an object or is null`, row);
      return; // Skip this iteration
    }

    const newFrame = selectedFrame.type === 'COMPONENT' ?
      (selectedFrame as ComponentNode).createInstance() :
      selectedFrame.clone();
    newFrame.x = selectedFrame.x + (index % framesPerRow) * (selectedFrame.width + gap);
    newFrame.y = selectedFrame.y + (1 + Math.floor(index / framesPerRow)) * (selectedFrame.height + gap);
    figma.currentPage.appendChild(newFrame);

    Object.entries(row).forEach(([key, value]) => {
      console.log("Processing key-value pair:", { key, value });
      const textLayer = newFrame.findOne(node => node.type === "TEXT" && node.name === key);
      if (textLayer) {
        const textNode = textLayer as TextNode;
        figma.loadFontAsync(textNode.fontName as FontName).then(() => {
          textNode.characters = value;
        }).catch(error => {
          console.error("Error loading font:", error);
        });
      }
    });
    
    console.log("Sending message:", { type: 'progress', progress: { current: index + 1, total: parsedData.length } });
  });

  figma.notify(`🥰 Rendered ${dataLength} rows`);
  // TODO: nodes are empty after this script hence the rows below won't do a thing
  // figma.currentPage.selection = nodes
  // figma.viewport.scrollAndZoomIntoView(nodes)
  // Note: Not closing the plugin here
}

function parseCSVData(data: string, delimiter: string = '\t'): Array<{ [key: string]: string }> {
  console.log("Parsing CSV data");
  const rows = data.split('\n');
  if (!rows[0]) {
    console.log("CSV header row is empty");
    return [];
  }

  const header = rows[0].split(delimiter);
  console.log("CSV header:", header);
  const result: Array<{ [key: string]: string }> = [];

  rows.slice(1).forEach((rowString, rowIndex) => {
    const row = rowString.split(delimiter);
    const rowData: { [key: string]: string } = {};
    header.forEach((headerItem, headerIndex) => {
      rowData[headerItem] = row[headerIndex];
    });
    console.log(`Row ${rowIndex} data:`, rowData);
    result.push(rowData);
  });

  return result;
}