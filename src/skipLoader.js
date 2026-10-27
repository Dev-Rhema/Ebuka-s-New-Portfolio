// Returning home from a case study skips the loader: the visitor has already seen it.
const KEY = "skip-loader";
// Only a return made just now counts, so a note left by a back press that went
// elsewhere can't skip the loader on a later visit.
const FRESH_FOR = 10000;

export const skipNextLoader = () => {
  try {
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    return;
  }
};

// True once, straight after skipNextLoader; the note is cleared as it is read.
export const shouldSkipLoader = () => {
  try {
    const at = Number(sessionStorage.getItem(KEY));
    sessionStorage.removeItem(KEY);
    return Date.now() - at < FRESH_FOR;
  } catch {
    return false;
  }
};
