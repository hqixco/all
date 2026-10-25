const header = document.querySelector(".site-header");
const toggle = document.querySelector(".header-burger");
const navigation = document.querySelector(".main-nav");

if (header && toggle && navigation) {
  const closeMenu = () => {
    toggle.classList.remove("is-open");
    navigation.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Открыть меню");
  };

  toggle.addEventListener("click", () => {
    const open = !navigation.classList.contains("is-open");
    toggle.classList.toggle("is-open", open);
    navigation.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  });

  navigation.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}
