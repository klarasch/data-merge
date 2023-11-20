import { on, once, showUI } from '@create-figma-plugin/utilities'
import { CloseHandler, GenerateFrames } from './types'

export default function () {
  console.log("Plugin main function started");
  on<GenerateFrames>('GENERATE_FRAMES', async function (csvData: string, framesPerRow: number, gap: number) {
    console.log("GenerateFrames event received", { csvData, framesPerRow, gap });
    try {
      await generateFrames(csvData, framesPerRow, gap);
    } catch (error) {
      console.error("Error in generateFrames:", error);
      figma.ui.postMessage({ type: 'error', message: 'An unexpected error occurred.' });
    }
    // figma.ui.postMessage({ type: 'generation-complete' });
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
  const nodes: Array<SceneNode> = [];
  const selectedFrame = figma.currentPage.selection[0];
  const uniqueFonts = new Set<FontName>();
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

  selectedFrame.findAll(node => node.type === "TEXT").forEach((node) => {
    const textNode = node as TextNode; // Explicit type assertion
    uniqueFonts.add(textNode.fontName as FontName);
  });

  const fontLoadPromises = Array.from(uniqueFonts).map(font => figma.loadFontAsync(font));
  await Promise.all(fontLoadPromises);

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

  for (const [index, row] of parsedData.entries()) {
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
    nodes.push(newFrame);

    const promises: Promise<void>[] = [];
    for (const [key, value] of Object.entries(row)) {
      console.log("Processing key-value pair:", { key, value });
      const textLayer = newFrame.findOne(node => node.type === "TEXT" && node.name === key);
      if (textLayer) {
        (textLayer as TextNode).characters = value;
      }
    };

    await Promise.all(promises);

  };

  figma.notify(`🥰 Rendered ${dataLength} frames`);
  figma.currentPage.selection = nodes;
  figma.viewport.scrollAndZoomIntoView(nodes);
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