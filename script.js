"use strict";

(() => {

  const root =
    document.documentElement;

  const body =
    document.body;

  const cards = [
    ...document.querySelectorAll(
      ".project-card"
    )
  ];


  const reducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

  const finePointer =
    window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    );


  const clamp = (
    value,
    min,
    max
  ) =>
    Math.min(
      max,
      Math.max(min, value)
    );


  function pointerEffectsAllowed() {

    return (
      finePointer.matches &&
      !reducedMotion.matches
    );

  }


  /* =========================
     ميلان البطاقات
  ========================= */

  cards.forEach((card) => {

    let bounds = null;


    card.addEventListener(
      "pointerenter",
      (event) => {

        if (
          event.pointerType !== "mouse"
        ) {
          return;
        }

        bounds =
          card.getBoundingClientRect();

      }
    );


    card.addEventListener(
      "pointermove",
      (event) => {

        if (
          event.pointerType !== "mouse" ||
          !pointerEffectsAllowed()
        ) {

          return;

        }


        if (!bounds) {

          bounds =
            card.getBoundingClientRect();

        }


        const x = clamp(

          (
            event.clientX -
            bounds.left
          ) / bounds.width,

          0,
          1
        );


        const y = clamp(

          (
            event.clientY -
            bounds.top
          ) / bounds.height,

          0,
          1
        );


        const rotateX =
          (0.5 - y) * 8;


        const rotateY =
          (x - 0.5) * 8;


        card.style.transform =
          `perspective(900px)
           rotateX(${rotateX}deg)
           rotateY(${rotateY}deg)`;

      }
    );


    function resetCard() {

      bounds = null;

      card.style.removeProperty(
        "transform"
      );

    }


    card.addEventListener(
      "pointerleave",
      resetCard
    );

    card.addEventListener(
      "pointercancel",
      resetCard
    );

    window.addEventListener(
      "scroll",
      resetCard,
      {
        passive: true
      }
    );

  });


  /* =========================
     Cursor
  ========================= */

  const cursor =
    document.createElement(
      "div"
    );

  cursor.className =
    "cursor-dot";

  cursor.setAttribute(
    "aria-hidden",
    "true"
  );

  body.append(cursor);


  let pointerX = 0;
  let pointerY = 0;

  let pointerScale = 1;

  let cursorFrame = 0;


  function hideCursor() {

    root.classList.remove(
      "cursor-enabled"
    );

    body.classList.remove(
      "is-lit"
    );

  }


  /* =========================
     حركة الماوس + إضاءة النقاط
  ========================= */

  document.addEventListener(
    "pointermove",
    (event) => {

      if (
        event.pointerType !== "mouse" ||
        !pointerEffectsAllowed()
      ) {

        hideCursor();

        return;

      }


      pointerX =
        event.clientX;

      pointerY =
        event.clientY;


      /* موقع الإضاءة */

      body.style.setProperty(
        "--pointer-x",
        `${pointerX}px`
      );

      body.style.setProperty(
        "--pointer-y",
        `${pointerY}px`
      );


      body.classList.add(
        "is-lit"
      );


      /* تكبير المؤشر على الروابط */

      const interactive =
        event.target.closest(
          "a, button, input, textarea, select, summary"
        );


      pointerScale =
        interactive
          ? 2
          : 1;


      if (!cursorFrame) {

        cursorFrame =
          requestAnimationFrame(
            () => {

              cursorFrame = 0;


              cursor.style.transform =
                `translate3d(
                  ${pointerX - 4}px,
                  ${pointerY - 4}px,
                  0
                )
                scale(${pointerScale})`;


              root.classList.add(
                "cursor-enabled"
              );

            }
          );

      }

    }
  );


  document.addEventListener(
    "pointerleave",
    hideCursor
  );


  window.addEventListener(
    "blur",
    hideCursor
  );


  document.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Tab"
      ) {

        hideCursor();

      }

    }
  );


  function refreshPreferences() {

    hideCursor();

    cards.forEach(
      (card) => {

        card.style.removeProperty(
          "transform"
        );

      }
    );

  }


  reducedMotion.addEventListener(
    "change",
    refreshPreferences
  );

  finePointer.addEventListener(
    "change",
    refreshPreferences
  );

})();
