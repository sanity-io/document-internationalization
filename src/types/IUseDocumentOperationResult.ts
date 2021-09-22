type ExecutablAction = {
  disabled?: string;
  execute: (...args: any[]) => void;
}

export interface IUseDocumentOperationResult {
  patch: ExecutablAction;
  publish: ExecutablAction;
  duplicate: ExecutablAction;
  delete: ExecutablAction;
}