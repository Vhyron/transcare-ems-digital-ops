export function capitalizeString(str: string, separator: string = ' ') {
  const words = str.split(separator);
  const capitalizedWords = words.map((word) => {
    if (word.length === 0) {
      return '';
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  return capitalizedWords.join(' ');
}
