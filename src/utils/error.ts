export function getErrorMessage(any: any) {
  return any?.message || String(any);
}
