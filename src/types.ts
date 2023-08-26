import { EventHandler } from '@create-figma-plugin/utilities'

export interface GenerateFrames extends EventHandler {
  name: 'GENERATE_FRAMES'
  handler: (csvData: string, framesPerRow: number, gap: number) => void
}

export interface CloseHandler extends EventHandler {
  name: 'CLOSE'
  handler: () => void
}
