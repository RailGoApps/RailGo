export type NfcPlatform = 'android' | 'ios';

export type NfcReadMode = 'automatic' | 'ndef' | 'discover';

export type AndroidScanPresentation = 'managed' | 'none';

export type NfcPollingTechnology = 'iso14443' | 'iso15693' | 'iso18092';

export interface NfcAndroidScanOptions {
  presentation?: AndroidScanPresentation;
  deepReadEnabled?: boolean;
  presenceCheckDelayMilliseconds?: number;
}

export interface NfcIosScanOptions {
  pollingTechnologies?: ReadonlyArray<NfcPollingTechnology>;
}

export interface NfcScanMessages {
  title: string;
  instruction: string;
  cancel: string;
  done: string;
  success: string;
  failureTitle: string;
  timeout: string;
  nfcDisabled: string;
  nfcUnsupported: string;
  multipleTags: string;
  reading: string;
  tagLost: string;
  unsupportedTag: string;
  readFailed: string;
}

export interface NfcScanOptions {
  mode?: NfcReadMode;
  timeoutMilliseconds?: number;
  android?: NfcAndroidScanOptions;
  ios?: NfcIosScanOptions;
  messages?: NfcScanMessages;
}

export type NfcNdefTextEncoding = 'UTF-8' | 'UTF-16';

export interface NfcNdefTextRecordInput {
  kind: 'text';
  text: string;
  languageCode: string;
  encoding?: NfcNdefTextEncoding;
  identifierBase64?: string;
}

export interface NfcNdefUriRecordInput {
  kind: 'uri';
  uri: string;
  identifierBase64?: string;
}

export interface NfcNdefMimeRecordInput {
  kind: 'mime';
  mediaType: string;
  payloadBase64: string;
  identifierBase64?: string;
}

export interface NfcNdefExternalRecordInput {
  kind: 'external';
  domain: string;
  type: string;
  payloadBase64: string;
  identifierBase64?: string;
}

export type NfcNdefRecordInput =
  | NfcNdefTextRecordInput
  | NfcNdefUriRecordInput
  | NfcNdefMimeRecordInput
  | NfcNdefExternalRecordInput;

export interface NfcNdefMessageInput {
  records: ReadonlyArray<NfcNdefRecordInput>;
}

export interface NfcNdefExternalTypeMarker {
  domain: string;
  type: string;
}

export interface NfcWriteOptions {
  timeoutMilliseconds?: number;
  messages?: NfcWriteMessages;
}

export interface NfcWriteMessages {
  title: string;
  instruction: string;
  cancel: string;
  done: string;
  success: string;
  failureTitle: string;
  timeout: string;
  nfcDisabled: string;
  nfcUnsupported: string;
  multipleTags: string;
  checking: string;
  writing: string;
  verifying: string;
  tagLost: string;
  tagReadOnly: string;
  capacityExceeded: string;
  unsupportedTag: string;
  writeFailed: string;
  verificationFailed: string;
}

export interface NfcCapabilities {
  platform: NfcPlatform;
  supported: boolean;
  enabled: boolean;
  readerModeSupported: boolean;
  features: ReadonlyArray<string>;
}

export type NfcErrorCode =
  | 'NFC_UNSUPPORTED'
  | 'NFC_DISABLED'
  | 'SCAN_BUSY'
  | 'USER_CANCELLED'
  | 'SCAN_TIMEOUT'
  | 'TAG_LOST'
  | 'UNSUPPORTED_TAG'
  | 'READ_FAILED'
  | 'WRITE_BUSY'
  | 'WRITE_TIMEOUT'
  | 'SESSION_CLOSE_TIMEOUT'
  | 'PRESENTATION_TIMEOUT'
  | 'TAG_READ_ONLY'
  | 'NDEF_CAPACITY_EXCEEDED'
  | 'WRITE_FAILED'
  | 'WRITE_VERIFICATION_FAILED'
  | 'INVALID_OPTIONS'
  | 'INTERNAL_ERROR';

export interface NfcNativeError {
  type: string;
  message: string;
  domain?: string;
  code?: number;
}

export interface NfcErrorPayload {
  code: NfcErrorCode;
  message: string;
  recoverable: boolean;
  nativeError?: NfcNativeError;
}

export type NfcJsonPrimitive = string | number | boolean | null;

export type NfcJsonValue =
  | NfcJsonPrimitive
  | NfcJsonObject
  | ReadonlyArray<NfcJsonValue>;

export interface NfcJsonObject {
  readonly [key: string]: NfcJsonValue;
}

export interface NfcByteValue {
  hex: string;
  base64: string;
  length: number;
}

export type NfcTechnology =
  | 'ndef'
  | 'ndefFormatable'
  | 'nfcA'
  | 'nfcB'
  | 'nfcF'
  | 'nfcV'
  | 'isoDep'
  | 'mifareClassic'
  | 'mifareUltralight'
  | 'mifareUnknown'
  | 'mifarePlus'
  | 'mifareDesfire'
  | 'iso7816'
  | 'iso15693'
  | 'felica'
  | 'nfcBarcode'
  | 'unknown';

export type NdefStatus =
  | 'writable'
  | 'readOnly'
  | 'read'
  | 'unsupported'
  | 'readError';

export interface NdefRecordSnapshot {
  index: number;
  tnf: number;
  tnfName: string;
  typeHex: string;
  typeBase64: string;
  idHex: string;
  idBase64: string;
  payloadHex: string;
  payloadBase64: string;
  typeAscii?: string;
  text?: string;
  languageCode?: string;
  textEncoding?: string;
  uri?: string;
  mimeType?: string;
  externalType?: string;
}

export interface NdefSnapshot {
  status: NdefStatus;
  accessStatus?: string;
  writable?: boolean;
  canMakeReadOnly?: boolean;
  maxSize?: number;
  type?: string;
  messageHex?: string;
  messageBase64?: string;
  recordCount: number;
  records: ReadonlyArray<NdefRecordSnapshot>;
  readError?: NfcNativeError;
}

export interface NfcPlatformDetails {
  android?: NfcJsonObject;
  ios?: NfcJsonObject;
}

export interface NfcTagSnapshot {
  schemaVersion: 1;
  platform: NfcPlatform;
  discoveredAtEpochMs: number;
  id: NfcByteValue;
  technologies: ReadonlyArray<NfcTechnology>;
  nativeTechnologies: ReadonlyArray<string>;
  platformDetails: NfcPlatformDetails;
  ndef?: NdefSnapshot;
  readOnlyProbes?: NfcJsonObject;
  warnings: ReadonlyArray<string>;
}

export interface NfcWriteResult {
  schemaVersion: 1;
  platform: NfcPlatform;
  operation: 'writeNdef';
  completedAtEpochMs: number;
  verified: true;
  bytesWritten: number;
  recordCount: number;
  messageHex: string;
  messageBase64: string;
  tag: NfcTagSnapshot;
}

export interface NfcNdefInitializationMarkerResult
  extends NfcNdefExternalTypeMarker {
  externalType: string;
}

interface NfcNdefInitializationResultBase {
  schemaVersion: 1;
  platform: NfcPlatform;
  operation: 'initializeNdef';
  completedAtEpochMs: number;
  marker: NfcNdefInitializationMarkerResult;
  tag: NfcTagSnapshot;
}

export interface NfcNdefPreservedResult
  extends NfcNdefInitializationResultBase {
  action: 'preserved';
}

export interface NfcNdefInitializedResult
  extends NfcNdefInitializationResultBase {
  action: 'initialized';
  verified: true;
  bytesWritten: number;
  recordCount: number;
  messageHex: string;
  messageBase64: string;
}

export type NfcNdefInitializationResult =
  | NfcNdefPreservedResult
  | NfcNdefInitializedResult;

export interface NfcForegroundDispatchState {
  platform: NfcPlatform;
  /** Monotonic within one native controller; changes when state or error changes. */
  revision: number;
  state: 'disabled' | 'active' | 'paused' | 'unavailable' | 'nfcDisabled' | 'failed';
  error: string | null;
}

export interface NfcPresentationState {
  platform: NfcPlatform;
  /** False on iOS; Core NFC presentation is controlled by the system. */
  supported: boolean;
  activePresentationIds: ReadonlyArray<string>;
}

export interface NfcWaitForPresentationEndOptions {
  /** Integer 1–60000; default 5000 milliseconds. No other options are accepted. */
  timeoutMilliseconds?: number;
}
