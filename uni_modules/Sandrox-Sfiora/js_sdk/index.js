import { invokeSfioraNative } from '@/uni_modules/Sandrox-Sfiora';
import { createSfiora } from './bridge.js';
export { SfioraError } from './bridge.js';

const api = createSfiora((method, args, callback) => {
  invokeSfioraNative(method, JSON.stringify(args), (json) => {
    try {
      callback(JSON.parse(json));
    } catch (error) {
      callback({ok: false, error: {
        code: 'INTERNAL_ERROR', message: 'The native NFC bridge returned invalid JSON', recoverable: false,
      }});
    }
  });
});

export const {
  acquireForegroundDispatch, releaseForegroundDispatch, getForegroundDispatchState,
  getPresentationState, waitForPresentationEnd,
  waitForIdle, getCapabilities, startScan, cancelScan, isScanning,
  writeNdef, initializeNdef, cancelWrite, isWriting,
} = api;
