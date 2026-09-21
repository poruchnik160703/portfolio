/*
==========================================================================
  PORTFOLIO — js/script.js
==========================================================================

  RU: Единственный файл JavaScript сайта. Каждая функция отвечает за ОДИН элемент или эффект.
      Внизу файла, в разделе «Démarrage», есть список вызовов: чтобы ВЫКЛЮЧИТЬ эффект,
      поставьте // перед его строкой. Ctrl+F по номеру раздела, например «[3]».
  FR : Unique fichier JavaScript du site. Chaque fonction gère UN seul élément ou effet.
      En bas du fichier, dans « Démarrage », se trouve la liste des appels : pour DÉSACTIVER un effet,
      mettez // devant sa ligne. Ctrl+F sur le numéro de section, par exemple « [3] ».

  ОГЛАВЛЕНИЕ / SOMMAIRE
   [0] Réglages communs      — общие настройки / réglages communs
   [1] Mobile menu           — мобильное меню (бургер) / menu mobile (burger)
   [2] Cursor glow           — свечение за курсором / halo qui suit le curseur
   [3] Scroll reveal         — плавное появление секций / apparition progressive des sections
   [4] Typewriter            — «печатающийся» текст / texte tapé
   [5] Active navigation     — подсветка пункта меню / mise en évidence du menu
   [6] Card tilt             — наклон карточек под мышью / inclinaison des cartes
   [7] Tech slider           — бегущая лента технологий / bandeau des technologies
   [8] Copy email            — копирование e-mail / copie de l'e-mail
   [9] Démarrage             — запуск всех функций / lancement de toutes les fonctions
*/


/* ==========================================================================
   [0] RÉGLAGES COMMUNS / ОБЩИЕ НАСТРОЙКИ
   ========================================================================== */

/*
  RU: Эти значения можно менять. Скорость и время указаны в миллисекундах (1000 = 1 секунда).
  FR : Ces valeurs sont modifiables. Vitesses et durées en millisecondes (1000 = 1 seconde).
*/
const TYPING_SPEED_MS = 75;        // RU: пауза между буквами при печати / FR : pause entre les lettres
const GLOW_FOLLOW_SPEED = 0.08;    // RU: 0.01 = очень плавно, 1 = мгновенно / FR : 0.01 = très doux, 1 = instantané
const CARD_MAX_TILT_DEG = 5;       // RU: максимальный наклон карточки в градусах / FR : inclinaison maximale en degrés
const ACTIVE_NAV_OFFSET_PX = 140;  // RU: за сколько пикселей до секции подсвечивать пункт меню / FR : nb de pixels avant la section pour surligner le menu
const COPY_MESSAGE_MS = 2200;      // RU: сколько секунд виден «Email copié» / FR : durée d'affichage de « Email copié »

/*
  RU: Проверяем настройки устройства:
      • prefersReducedMotion — пользователь просил в системе «меньше анимации»;
      • canHover — есть мышь (на телефоне её нет, поэтому эффекты под мышь там не нужны).
  FR : On lit les réglages de l'appareil :
      • prefersReducedMotion — l'utilisateur a demandé « moins d'animations » dans son système ;
      • canHover — présence d'une souris (absente sur téléphone, les effets à la souris y sont inutiles).
*/
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = window.matchMedia("(hover: hover)").matches;


/* ==========================================================================
   [1] MOBILE MENU / МОБИЛЬНОЕ МЕНЮ
   ========================================================================== */

/*
  RU: Открытие и закрытие мобильного меню. Кнопка-бургер (#nav-toggle) показывает/прячет список ссылок (#nav-links).
      Меню закрывается: по клику на пункт меню и по клавише Escape.
      Стили открытого меню — в css/style.css, раздел [13], класс .is-open.
  FR : Ouverture et fermeture du menu mobile. Le bouton burger (#nav-toggle) affiche/masque la liste de liens (#nav-links).
      Le menu se ferme : au clic sur un lien et avec la touche Échap.
      Les styles du menu ouvert sont dans css/style.css, section [13], classe .is-open.
*/
function initMobileMenu() {
  const toggleButton = document.getElementById("nav-toggle");
  const menu = document.getElementById("nav-links");
  if (!toggleButton || !menu) return;

  // RU: Один раз меняем всё, что зависит от состояния меню. FR : Un seul endroit pour tout ce qui dépend de l'état du menu.
  function setMenuOpen(isOpen) {
    menu.classList.toggle("is-open", isOpen);
    toggleButton.setAttribute("aria-expanded", String(isOpen));
    toggleButton.setAttribute("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");
  }

  toggleButton.addEventListener("click", () => {
    const isOpen = toggleButton.getAttribute("aria-expanded") === "true";
    setMenuOpen(!isOpen);
  });

  // RU: Клик по любой ссылке внутри меню закрывает его. FR : Un clic sur un lien du menu le referme.
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenuOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("is-open")) {
      setMenuOpen(false);
      toggleButton.focus();
    }
  });
}


/* ==========================================================================
   [2] CURSOR GLOW / СВЕЧЕНИЕ ЗА КУРСОРОМ
   ========================================================================== */

/*
  RU: Мягкое свечение (.cursor-glow) плавно догоняет курсор мыши.
      Двигаем через transform (это быстрее, чем left/top), а цикл анимации работает
      только пока свечение «догоняет» курсор — когда мышь стоит, нагрузки нет.
      На телефонах и при «уменьшить движение» эффект отключён.
  FR : Le halo (.cursor-glow) rattrape doucement le curseur de la souris.
      On le déplace avec transform (plus rapide que left/top), et la boucle d'animation ne tourne
      que tant que le halo rattrape le curseur — souris immobile = aucun travail.
      Désactivé sur téléphone et avec « réduire les animations ».
*/
function initCursorGlow() {
  const glow = document.querySelector(".cursor-glow");
  if (!glow || !canHover || prefersReducedMotion) return;

  let mouseX = 0;  // RU: где курсор / FR : position du curseur
  let mouseY = 0;
  let glowX = 0;   // RU: где сейчас свечение / FR : position actuelle du halo
  let glowY = 0;
  let isRunning = false;
  let hasStarted = false;

  function animate() {
    glowX += (mouseX - glowX) * GLOW_FOLLOW_SPEED;
    glowY += (mouseY - glowY) * GLOW_FOLLOW_SPEED;
    glow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;

    const isCloseEnough = Math.abs(mouseX - glowX) < 0.5 && Math.abs(mouseY - glowY) < 0.5;
    if (isCloseEnough) {
      isRunning = false;       // RU: догнали — останавливаем цикл / FR : rattrapé — on arrête la boucle
    } else {
      requestAnimationFrame(animate);
    }
  }

  document.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;

    // RU: При первом движении сразу ставим свечение под курсор и показываем его.
    // FR : Au premier mouvement, on place le halo sous le curseur et on l'affiche.
    if (!hasStarted) {
      glowX = mouseX;
      glowY = mouseY;
      hasStarted = true;
      glow.classList.add("is-active");
    }

    if (!isRunning) {
      isRunning = true;
      requestAnimationFrame(animate);
    }
  }, { passive: true });
}


/* ==========================================================================
   [3] SCROLL REVEAL / ПЛАВНОЕ ПОЯВЛЕНИЕ СЕКЦИЙ
   ========================================================================== */

/*
  RU: Блоки с классом .reveal (в HTML) скрыты, пока не попадут на экран. Когда блок появляется в зоне видимости,
      ему добавляется класс .is-visible (стили — css/style.css, раздел [4]) и мы перестаём за ним следить.
      Используется IntersectionObserver — встроенный «наблюдатель», он легче, чем слушать прокрутку вручную.
  FR : Les blocs avec la classe .reveal (en HTML) sont cachés jusqu'à leur entrée à l'écran. Quand un bloc devient visible,
      on lui ajoute la classe .is-visible (styles : css/style.css, section [4]) et on cesse de le surveiller.
      On utilise IntersectionObserver — un « observateur » intégré, plus léger que d'écouter le défilement à la main.
*/
function initScrollReveal() {
  const revealItems = document.querySelectorAll(".reveal");

  // RU: Очень старый браузер без наблюдателя — просто показываем всё. FR : Très vieux navigateur sans observateur : on affiche tout.
  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: "0px 0px -12% 0px"  // RU: блок появляется, когда поднялся выше нижних 12% экрана / FR : le bloc apparaît une fois remonté au-dessus des 12 % du bas de l'écran
  });

  revealItems.forEach((item) => observer.observe(item));
}


/* ==========================================================================
   [4] TYPEWRITER / «ПЕЧАТАЮЩИЙСЯ» ТЕКСТ
   ========================================================================== */

/*
  RU: Текст из <p class="hero__code"> печатается по одной букве. Сам текст пишется в HTML (index.html → Hero),
      скрипт берёт его оттуда, очищает поле и печатает заново. Когда печать закончена, добавляется класс
      hero__code--done — CSS показывает мигающий курсор «|».
      Без JavaScript или при «уменьшить движение» текст просто показывается целиком.
  FR : Le texte de <p class="hero__code"> est tapé lettre par lettre. Le texte s'écrit dans le HTML (index.html → Hero) ;
      le script le lit, vide le champ puis le retape. Une fois fini, la classe hero__code--done est ajoutée —
      le CSS affiche alors le curseur clignotant « | ».
      Sans JavaScript ou avec « réduire les animations », le texte s'affiche en entier.
*/
function initTypewriter() {
  const element = document.querySelector(".hero__code");
  if (!element) return;

  const fullText = element.textContent.trim();

  if (prefersReducedMotion) {
    element.classList.add("hero__code--done");
    return;
  }

  element.textContent = "";
  let letterIndex = 0;

  function typeNextLetter() {
    if (letterIndex < fullText.length) {
      element.textContent += fullText.charAt(letterIndex);
      letterIndex++;
      setTimeout(typeNextLetter, TYPING_SPEED_MS);
    } else {
      element.classList.add("hero__code--done");
    }
  }

  typeNextLetter();
}


/* ==========================================================================
   [5] ACTIVE NAVIGATION / ПОДСВЕТКА ТЕКУЩЕГО ПУНКТА МЕНЮ
   ========================================================================== */

/*
  RU: При прокрутке находим секцию, в которой мы сейчас, и подсвечиваем её ссылку в меню (класс .is-active).
      Связь «ссылка ↔ секция» идёт через id: href="#projets" ↔ <section id="projets">.
      Проверяются только секции внутри <main> с атрибутом id.
  FR : Au défilement, on repère la section où l'on se trouve et on met son lien en évidence dans le menu (classe .is-active).
      Le lien entre « lien ↔ section » passe par l'id : href="#projets" ↔ <section id="projets">.
      Seules les sections de <main> ayant un attribut id sont vérifiées.
*/
function initActiveNavigation() {
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav__links a");
  if (sections.length === 0 || navLinks.length === 0) return;

  function updateActiveLink() {
    // RU: Текущая секция — последняя, верх которой уже поднялся выше «линии» ACTIVE_NAV_OFFSET_PX от верха экрана.
    // FR : La section courante est la dernière dont le haut a dépassé la « ligne » située à ACTIVE_NAV_OFFSET_PX du haut de l'écran.
    let currentId = "";
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= ACTIVE_NAV_OFFSET_PX) {
        currentId = section.id;
      }
    });

    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${currentId}`;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  window.addEventListener("scroll", updateActiveLink, { passive: true });
  updateActiveLink();
}


/* ==========================================================================
   [6] CARD TILT / НАКЛОН КАРТОЧЕК ПОД МЫШЬЮ
   ========================================================================== */

/*
  RU: Карточки (.card — проекты и интересы) слегка наклоняются в сторону курсора и чуть приподнимаются;
      когда мышь уходит — возвращаются на место. Только для устройств с мышью.
      Новые карточки, добавленные в HTML с class="card", подхватываются автоматически.
  FR : Les cartes (.card — projets et centres d'intérêt) s'inclinent légèrement vers le curseur et se soulèvent un peu ;
      quand la souris part, elles reviennent en place. Seulement pour les appareils avec souris.
      Les nouvelles cartes ajoutées en HTML avec class="card" sont prises en compte automatiquement.
*/
function initCardTilt() {
  if (!canHover || prefersReducedMotion) return;

  document.querySelectorAll(".card").forEach((card) => {

    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const halfWidth = rect.width / 2;
      const halfHeight = rect.height / 2;

      // RU: Расстояние курсора от центра карточки (от -1 до 1) × максимальный наклон.
      // FR : Distance du curseur au centre de la carte (de -1 à 1) × inclinaison maximale.
      const offsetX = (event.clientX - rect.left - halfWidth) / halfWidth;
      const offsetY = (event.clientY - rect.top - halfHeight) / halfHeight;
      const rotateX = offsetY * -CARD_MAX_TILT_DEG;
      const rotateY = offsetX * CARD_MAX_TILT_DEG;

      card.style.transform =
        `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";  // RU: убираем наклон / FR : on retire l'inclinaison
    });
  });
}


/* ==========================================================================
   [7] TECH SLIDER / БЕГУЩАЯ ЛЕНТА ТЕХНОЛОГИЙ
   ========================================================================== */

/*
  RU: Для бесконечной прокрутки ленте нужна вторая копия иконок. Чтобы не писать иконки в HTML дважды,
      копию создаёт скрипт. Иконки редактируются только в index.html → Hero → Tech slider.
      Копии помечены классом .tech-item--clone (CSS прячет их при «уменьшить движение»).
  FR : Pour un défilement infini, le bandeau a besoin d'une deuxième copie des icônes. Pour ne pas écrire les icônes
      deux fois en HTML, c'est le script qui crée la copie. Les icônes se modifient uniquement dans
      index.html → Hero → Tech slider.
      Les copies portent la classe .tech-item--clone (le CSS les masque avec « réduire les animations »).
*/
function initTechSlider() {
  const track = document.querySelector(".tech-slider__track");
  if (!track) return;

  Array.from(track.children).forEach((item) => {
    const copy = item.cloneNode(true);
    copy.classList.add("tech-item--clone");
    track.appendChild(copy);
  });
}


/* ==========================================================================
   [8] COPY EMAIL / КОПИРОВАНИЕ E-MAIL
   ========================================================================== */

/*
  RU: Кнопка «Copier» копирует e-mail в буфер обмена и показывает сообщение на 2 секунды.
      Адрес скрипт берёт из кнопки «Écrire» (её href="mailto:..."), поэтому его не нужно менять здесь.
      Тексты сообщений лежат в HTML: data-success (успех) и data-error (ошибка) у #copy-message.
      Копирование работает только на https:// и на localhost — иначе покажется сообщение об ошибке.
  FR : Le bouton « Copier » copie l'e-mail dans le presse-papiers et affiche un message pendant 2 secondes.
      Le script lit l'adresse dans le bouton « Écrire » (son href="mailto:..."), inutile de la changer ici.
      Les textes des messages sont dans le HTML : data-success (succès) et data-error (erreur) sur #copy-message.
      La copie ne fonctionne qu'en https:// et sur localhost — sinon le message d'erreur s'affiche.
*/
function initCopyEmail() {
  const copyButton = document.getElementById("copy-email-btn");
  const emailLink = document.getElementById("email-link");
  const message = document.getElementById("copy-message");
  if (!copyButton || !emailLink || !message) return;

  const email = emailLink.getAttribute("href").replace("mailto:", "");
  let hideTimer;
  let clearTimer;

  // RU: Показать сообщение, потом плавно скрыть и очистить текст (пустой текст не читают экранные дикторы).
  // FR : Afficher le message, puis le masquer en douceur et vider le texte (un texte vide n'est pas lu par les lecteurs d'écran).
  function showMessage(text) {
    clearTimeout(hideTimer);
    clearTimeout(clearTimer);

    message.textContent = text;
    message.classList.add("is-visible");

    hideTimer = setTimeout(() => {
      message.classList.remove("is-visible");
      clearTimer = setTimeout(() => { message.textContent = ""; }, 400);
    }, COPY_MESSAGE_MS);
  }

  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(email);
      showMessage(message.dataset.success);
    } catch (error) {
      showMessage(message.dataset.error);
    }
  });
}


/* ==========================================================================
   [9] DÉMARRAGE / ЗАПУСК
   ========================================================================== */

/*
  RU: Запускаем все функции. Хотите отключить эффект — поставьте // в начале его строки.
      Скрипт подключён в конце index.html, поэтому к этому моменту вся страница уже загружена.
  FR : On lance toutes les fonctions. Pour désactiver un effet, mettez // au début de sa ligne.
      Le script est chargé en fin d'index.html : la page est donc déjà entièrement chargée ici.
*/
initMobileMenu();
initCursorGlow();
initScrollReveal();
initTypewriter();
initActiveNavigation();
initCardTilt();
initTechSlider();
initCopyEmail();
