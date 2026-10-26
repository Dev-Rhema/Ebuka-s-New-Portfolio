const pageLoaded = new Promise((resolve) => {
  if (document.readyState === "complete") resolve();
  else window.addEventListener("load", resolve, { once: true });
});

/**
 * Calls `callback` once the page has finished loading and `element` is within a screen
 * of the viewport, so heavy work (WebGL, three.js) never competes with the first paint.
 * Returns a function that cancels the wait.
 */
export function whenNear(element, callback) {
  let observer;
  let cancelled = false;

  pageLoaded.then(() => {
    if (cancelled) return;
    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        callback();
      },
      { rootMargin: "100% 0px" },
    );
    observer.observe(element);
  });

  return () => {
    cancelled = true;
    observer?.disconnect();
  };
}
