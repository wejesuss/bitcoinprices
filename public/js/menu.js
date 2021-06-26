const menuOptions = document.querySelectorAll(
  ".c-main__chart-menu-date-range, .c-main__chart-menu-units"
);
const buttons = document.querySelectorAll(".c-main__chart-menu button");
const optionActiveClass = "c-main__chart-menu-option-active";

const CHART_ACTIONS = {
  changeUnit: changeUnit,
  changeRange: changeRange,
};

let isChangingDateRange = false;

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
    const title = el.getAttribute("title");

    if (window.innerWidth <= 599) {
      el.firstElementChild.textContent = title;
    }

    el.addEventListener("click", () => {
      isChangingDateRange = true;
      const actionName = menuOptions[index].getAttribute("data-action");
      const action = CHART_ACTIONS[actionName];

      toggleActiveOption(list, el);

      if (action && typeof action === "function") {
        action(title);
        setTimeout(() => {
          isChangingDateRange = false;
        }, 200);
      }
    });
  });
}

function toggleActiveOption(list, el) {
  list.forEach((item) =>
    item.firstElementChild.classList.remove(optionActiveClass)
  );

  el.firstElementChild.classList.add(optionActiveClass);
}

function onVisibleTimeRangeChanged() {
  menuOptions.forEach((option) => {
    option.classList.remove("open");
    if (
      option.getAttribute("data-action") === "changeRange" &&
      !isChangingDateRange
    ) {
      option
        .querySelectorAll("ul li")
        .forEach((item) =>
          item.firstElementChild.classList.remove(optionActiveClass)
        );
    }
  });
}
