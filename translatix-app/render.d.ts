// File này giúp TypeScript hiểu đối tượng 'ipc'
// mà chúng ta đã expose từ preload script.

export interface IpcApi {
  invoke: (channel: 'start-processing', ...args: any[]) => Promise<any>;
}

declare global {
  interface Window {
    ipc: IpcApi;
  }
}
