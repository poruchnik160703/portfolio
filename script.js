/* =========================
   CURSOR GLOW
   Glow fluide / Плавное свечение
========================= */

const glow =
  document.querySelector(".cursor-glow");

let mouseX = 0;
let mouseY = 0;

let glowX = 0;
let glowY = 0;

document.addEventListener("mousemove", (e) => {

  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateGlow() {

  glowX += (mouseX - glowX) * 0.08;
  glowY += (mouseY - glowY) * 0.08;

  glow.style.left = `${glowX}px`;
  glow.style.top = `${glowY}px`;

  requestAnimationFrame(animateGlow);
}

animateGlow();

/* =========================
   SCROLL REVEAL
   Apparition progressive
========================= */

const reveals =
  document.querySelectorAll(
    ".section, .timeline__item, .skills-card"
  );

function revealElements() {

  const triggerBottom =
    window.innerHeight * 0.88;

  reveals.forEach((element) => {

    const top =
      element.getBoundingClientRect().top;

    if (top < triggerBottom) {

      element.classList.add("active");
    }
  });
}

window.addEventListener(
  "scroll",
  revealElements
);

revealElements();

/* =========================
   TYPEWRITER EFFECT
========================= */

const typingElement =
  document.querySelector(".typing-text");

const text =
  "<technicienne programmeuse />";

let index = 0;

function typeWriter() {

  if (!typingElement) return;

  if (index < text.length) {

    typingElement.innerHTML +=
      text.charAt(index);

    index++;

    setTimeout(typeWriter, 75);

  } else {

    typingElement.innerHTML +=
      '<span class="typing-cursor">|</span>';
  }
}

window.addEventListener(
  "DOMContentLoaded",
  typeWriter
);

/* =========================
   ACTIVE NAVIGATION
========================= */

const sections =
  document.querySelectorAll("section");

const navLinks =
  document.querySelectorAll(".nav__links a");

window.addEventListener("scroll", () => {

  let current = "";

  sections.forEach((section) => {

    const sectionTop =
      section.offsetTop - 140;

    if (scrollY >= sectionTop) {

      current =
        section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {

    link.classList.remove("active");
    if (
      link.getAttribute("href")
      === `#${current}`
    ) {

      link.classList.add("active");
    }
  });
});

/* =========================
   PROJECT CARD PARALLAX
========================= */

const cards =
  document.querySelectorAll(".project-card");

cards.forEach((card) => {

  card.addEventListener("mousemove", (e) => {

    const rect =
      card.getBoundingClientRect();

    const x =
      e.clientX - rect.left;

    const y =
      e.clientY - rect.top;

    const centerX =
      rect.width / 2;

    const centerY =
      rect.height / 2;

    const rotateX =
      ((y - centerY) / centerY) * -5;

    const rotateY =
      ((x - centerX) / centerX) * 5;

    card.style.transform =
      `
      perspective(1200px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateY(-5px)
      `;
  });

  card.addEventListener("mouseleave", () => {

    card.style.transform =
      `
      perspective(1200px)
      rotateX(0deg)
      rotateY(0deg)
      translateY(0px)
      `;
  });
});

/* =========================
   COPY EMAIL
========================= */

const copyBtn =
  document.getElementById("copyEmailBtn");

const copyMessage =
  document.getElementById("copyMessage");

copyBtn.addEventListener("click", () => {

  navigator.clipboard.writeText(
    "poruchnik160703@gmail.com"
  );

  copyMessage.classList.add("show");

  setTimeout(() => {

    copyMessage.classList.remove("show");

  }, 2200);

});
