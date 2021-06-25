const menuOptions = document.querySelectorAll(
  ".c-main__chart-menu-date-range, .c-main__chart-menu-units"
);
const buttons = document.querySelectorAll(".c-main__chart-menu button");
const optionActiveClass = "c-main__chart-menu-option-active";

buttons.forEach(addListenerToMenu);

function addListenerToMenu(button, index) {
  button.addEventListener("click", () => {
    menuOptions[index].classList.toggle("open");
  });

  button.onblur = () => {
    setTimeout(() => {
      menuOptions[index].classList.remove("open");
    }, 100);
  };

  menuOptions[index].querySelectorAll("ul li").forEach((el, _, list) => {
    if (window.innerWidth <= 599) {
      const title = el.getAttribute("title");
      el.firstElementChild.textContent = title;
    }

    el.addEventListener("click", () => {
      list.forEach((item) =>
        item.firstElementChild.classList.remove(optionActiveClass)
      );

      el.firstElementChild.classList.add(optionActiveClass);
    });
  });
}
