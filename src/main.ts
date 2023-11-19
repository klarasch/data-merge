import { once, showUI } from '@create-figma-plugin/utilities'

import { CloseHandler, GenerateFrames } from './types'

export default function () {
  once<GenerateFrames>('GENERATE_FRAMES', function (csvData: string, framesPerRow: number, gap: number) {
    console.log("GenerateFrames event received", { csvData, framesPerRow, gap });
    generateFrames(csvData, framesPerRow, gap)
      .catch(error => {
        console.error(error);
        figma.ui.postMessage({ type: 'error', message: 'An unexpected error occurred.' });
        figma.closePlugin();
      });
  });
  once<CloseHandler>('CLOSE', function () {
    figma.closePlugin()
  })
  showUI({ width: 260,
    height: 420})
}

async function generateFrames(csvData: string, framesPerRow: number, gap: number) {
  const nodes: Array<SceneNode> = []
  const selectedFrame = figma.currentPage.selection[0]
  // error handling

  if (!selectedFrame || (selectedFrame.type !== 'FRAME' && selectedFrame.type !== 'INSTANCE')) {
    figma.ui.postMessage({ type: 'error', message: 'Select a frame or instance to use as a template.' });
    console.log("Nothing selected");
    return;
  }

  if (!csvData.trim()) {
    figma.ui.postMessage({ type: 'error', message: 'No CSV data provided.' });
    console.log("No data");
    return;
  }

  let parsedData;
  try {
    parsedData = parseCSVData(csvData);
    if (!parsedData.length) {
      console.log("Empty CSV");
      throw new Error('Parsed CSV data is empty');
    }
  } catch (error) {
    console.error(error);
    figma.ui.postMessage({ type: 'error', message: 'Error parsing CSV data.' });
    return;
  }

  for (const [index, row] of parsedData.entries()) {
    const newFrame = selectedFrame.clone();
    newFrame.x = selectedFrame.x + (index % framesPerRow) * (selectedFrame.width + gap);
    newFrame.y = selectedFrame.y + (1 + Math.floor(index / framesPerRow)) * (selectedFrame.height + gap);
    figma.currentPage.appendChild(newFrame);

    for (const key of Object.keys(row)) {
      const value = row[key];
      const textLayer = newFrame.findOne(node => node.type === "TEXT" && node.name === key);
      if (textLayer) {
        const textNode = textLayer as TextNode;
        await figma.loadFontAsync(textNode.fontName as FontName);
        textNode.characters = value;
      }
    }

    figma.ui.postMessage({ type: 'progress', progress: (index + 1) / parsedData.length });
  }

  figma.currentPage.selection = nodes
  figma.viewport.scrollAndZoomIntoView(nodes)
  figma.closePlugin()
}

function parseCSVData(data: string, delimiter: string = '\t'): Array<{ [key: string]: string }> {
  const rows = data.split('\n');
  const header = rows[0].split(delimiter);
  const result: Array<{ [key: string]: string }> = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i].split(delimiter);
    const rowData: { [key: string]: string } = {};

    for (let j = 0; j < header.length; j++) {
      rowData[header[j]] = row[j];
    }

    result.push(rowData);
  }

  return result;
}
