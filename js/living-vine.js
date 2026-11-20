
/* VINE — Living Vine Scroll Animation */

document.addEventListener("DOMContentLoaded", () => {
  const vine = document.querySelector(".living-vine");
  if (!vine) return;

  const stem = vine.querySelector(".living-vine-stem");
  const leaves = [...vine.querySelectorAll(".living-vine-leaf")];
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const stemLength = stem.getTotalLength();

  stem.style.strokeDasharray = stemLength;

  function updateVine() {
    const scrollableHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    const progress = scrollableHeight > 0
      ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight))
      : 1;

    const visibleProgress = reduceMotion.matches ? 1 : progress;

    stem.style.strokeDashoffset =
      stemLength * (1 - visibleProgress);

    leaves.forEach((leaf, index) => {
      const threshold = (index + 1) / (leaves.length + 1);

      leaf.classList.toggle(
        "is-visible",
        visibleProgress >= threshold
      );
    });
  }

  let ticking = false;

  function requestUpdate() {
    if (ticking) return;

    ticking = true;
    requestAnimationFrame(() => {
      updateVine();
      ticking = false;
    });
  }

  window.addEventListener("scroll", requestUpdate, {
    passive: true
  });

  window.addEventListener("resize", requestUpdate);
  reduceMotion.addEventListener("change", requestUpdate);

  updateVine();
});
