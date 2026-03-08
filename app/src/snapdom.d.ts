declare module '@zumer/snapdom' {
  interface ToBlobOptions {
    type?: string
    scale?: number
  }
  interface SnapdomResult {
    toBlob(options?: ToBlobOptions): Promise<Blob>
    toPng(): Promise<HTMLImageElement>
  }
  export function snapdom(element: HTMLElement): Promise<SnapdomResult>
}
