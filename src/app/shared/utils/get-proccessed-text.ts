export const getProcessedText = (text: string): string => {
  return decodeURIComponent(escape(text));
};
