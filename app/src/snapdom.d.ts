declare module '@zumer/snapdom' {
  interface SnapdomOptions {
    scale?: number
  }
  interface ToBlobOptions {
    type?: string
    scale?: number
  }
  interface SnapdomResult {
    toBlob(options?: ToBlobOptions): Promise<Blob>
    toCanvas(options?: { scale?: number }): Promise<HTMLCanvasElement>
    toPng(): Promise<HTMLImageElement>
  }
  export function snapdom(element: HTMLElement, options?: SnapdomOptions): Promise<SnapdomResult>
}
