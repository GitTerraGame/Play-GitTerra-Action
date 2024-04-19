import GitHubLanguages from "./GitHubLanguages.js";

export function languageStringToCSSClass(language) {
  return language
    .replace(/\+/g, "p")
    .replace(/[^\w]+/g, "-")
    .toLowerCase();
}

export function languageStringToHexColor(language) {
  const languageInfo = GitHubLanguages[language];

  return languageInfo ? languageInfo.color : null;
}
