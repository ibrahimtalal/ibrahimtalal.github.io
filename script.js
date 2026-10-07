"use strict";

(() => {
  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector("header");
  const cards = [...document.querySelectorAll(".project-card")];

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function pointerEffectsAllowed() {
    return finePointer.matches && !reducedMotion.matches;
  }

  // Keep section headings below the sticky header at every screen size.
  function updateHeaderOffset() {
    const height = header ? header.getBoundingClientRect().height : 0;
    const offset = `${Math.ceil(height) + 16}px`;
    root.style.setProperty("--header-offset", offset);
    root.style.scrollPaddingTop = offset;
  }

  if (header) {
    const headerObserver = new ResizeObserver(updateHeaderOffset);
    headerObserver.observe(header);
  }

  window.addEventListener("resize", updateHeaderOffset);
  updateHeaderOffset();

  // Project-card tilt.
  const cardStates = cards.map((element) => ({ element, bounds: null }));

  function resetCard(state) {
    state.bounds = null;
    state.element.style.removeProperty("transform");
  }

  function resetCards() {
    cardStates.forEach(resetCard);
  }

  cardStates.forEach((state) => {
    const card = state.element;

    card.addEventListener("pointerenter", (event) => {
      if (event.pointerType !== "mouse" || !pointerEffectsAllowed()) return;
      state.bounds = card.getBoundingClientRect();
    });

    card.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse" || !pointerEffectsAllowed()) return;
      if (!state.bounds) state.bounds = card.getBoundingClientRect();

      const { left, top, width, height } = state.bounds;
      if (!width || !height) return;

      const x = clamp((event.clientX - left) / width, 0, 1);
      const y = clamp((event.clientY - top) / height, 0, 1);
      const rotateX = (0.5 - y) * 8;
      const rotateY = (x - 0.5) * 8;

      card.style.transform =
        `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener("pointerleave", () => resetCard(state));
    card.addEventListener("pointercancel", () => resetCard(state));
  });

  window.addEventListener("scroll", resetCards, { passive: true });
  window.addEventListener("resize", resetCards);

  // Custom cursor and dot-background illumination.
  const cursor = document.createElement("div");
  cursor.className = "cursor-dot";
  cursor.setAttribute("aria-hidden", "true");
  body.append(cursor);

  let pointerX = 0;
  let pointerY = 0;
  let pointerScale = 1;
  let cursorFrame = 0;

  function hideCursor() {
    if (cursorFrame) {
      cancelAnimationFrame(cursorFrame);
      cursorFrame = 0;
    }
    root.classList.remove("cursor-enabled");
    body.classList.remove("is-lit");
  }

  function renderPointer() {
    cursorFrame = 0;
    if (!pointerEffectsAllowed()) {
      hideCursor();
      return;
    }

    cursor.style.transform =
      `translate3d(${pointerX - 4}px, ${pointerY - 4}px, 0) scale(${pointerScale})`;
    body.style.setProperty("--pointer-x", `${pointerX}px`);
    body.style.setProperty("--pointer-y", `${pointerY}px`);
    root.classList.add("cursor-enabled");
    body.classList.add("is-lit");
  }

  document.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" || !pointerEffectsAllowed()) {
      hideCursor();
      return;
    }

    pointerX = event.clientX;
    pointerY = event.clientY;
    const target = event.target instanceof Element ? event.target : null;
    const interactive = target?.closest("a, button, input, textarea, select, summary");
    pointerScale = interactive ? 2 : 1;

    if (!cursorFrame) cursorFrame = requestAnimationFrame(renderPointer);
  });

  root.addEventListener("pointerleave", hideCursor);
  document.addEventListener("pointercancel", hideCursor);

  function refreshPreferences() {
    hideCursor();
    resetCards();
  }

  window.addEventListener("blur", refreshPreferences);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) refreshPreferences();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Tab") refreshPreferences();
  });

  reducedMotion.addEventListener("change", refreshPreferences);
  finePointer.addEventListener("change", refreshPreferences);
})();
