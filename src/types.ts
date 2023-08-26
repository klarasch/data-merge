import { EventHandler } from '@create-figma-plugin/utilities'

export interface GenerateFrames extends EventHandler {
  name: 'GENERATE_FRAMES'
  handler: (csvData: string) => void
}

export interface CloseHandler extends EventHandler {
  name: 'CLOSE'
  handler: () => void
}
