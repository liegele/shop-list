//Setting DOM elements into variables to further manipulation
const items = document.querySelectorAll('.list-item');
const addItemsButton = document.getElementById('add-items');
const selectItemsButton = document.getElementById('select-items');
const makeShopButton = document.getElementById('make-shop');
const saveButton = document.getElementById('save-button');
const clearButton = document.getElementById('clear-button');
const categorySelect = document.getElementById('category-select');
const itemInput = document.getElementById('item-input');

//Array for MODE options [add, select, shop] available in application.
const mode = ['add', 'select', 'shop'];

//App will start on SHOP MODE.
let currentMode = mode[2];

//Setting visibility of buttons according with chosen mode.
const toggleElements = (elementName, classIn, classOut) => {
  document.getElementsByName(elementName).forEach((el, key) => {
    document
      .getElementsByName(elementName)
      [key].classList.replace(classOut, classIn);
  });
};

//------------------------------------------------------------
//ADD ITEMS MODE
//------------------------------------------------------------

//Add button actions
addItemsButton.addEventListener('click', () => {
  currentMode = mode[0];
  addItemsButton.classList.add('dark-color');
  toggleElements('settings-button', 'settings-invisible', 'settings');
  toggleElements('delete-button', 'delete', 'delete-invisible');
  toggleElements('left-icon', 'list-category-0-invisible', 'list-category-0');
  toggleElements('right-icon', 'amount-invisible', 'amount');

  slidedown.play();
});

//Clear button actions
clearButton.addEventListener('click', () => {
  categorySelect.value = itemInput.value = '';
});

let slidedown = anime({
  targets: '.list-add-item',
  translateY: ['-150px', '0px'],
  duration: 1000,
  autoplay: false,
  begin: function () {
    document.querySelector('.list-add-item').classList.remove('invisible');
  },
});

let slideup = anime({
  targets: '.list-add-item',
  translateY: ['0px', '-150px'],
  duration: 1000,
  autoplay: false,
  begin: function () {
    document.querySelector('.list-add-item').classList.add('invisible');
  },
});

//------------------------------------------------------------
//SELECT ITEMS MODE
//------------------------------------------------------------

selectItemsButton.addEventListener('click', () => {
  currentMode = mode[1];
  slideup.play();
  toggleElements('settings-button', 'settings', 'settings-invisible');
  toggleElements('delete-button', 'delete-invisible', 'delete');
  toggleElements('left-icon', 'list-category-0', 'list-category-0-invisible');
  toggleElements('left-icon', 'bx-checkbox', 'bx-cart');
  toggleElements('right-icon', 'amount', 'amount-invisible');
});

//------------------------------------------------------------
//MAKE SHOP MODE
//------------------------------------------------------------

makeShopButton.addEventListener('click', () => {
  currentMode = mode[2];
  slideup.play();
  toggleElements('settings-button', 'settings', 'settings-invisible');
  toggleElements('delete-button', 'delete-invisible', 'delete');
  toggleElements('left-icon', 'list-category-0', 'list-category-0-invisible');
  toggleElements('left-icon', 'bx-cart', 'bx-checkbox');
  toggleElements('right-icon', 'amount-invisible', 'amount');
});

//------------------------------------------------------------

/* When the user scrolls down, hide the navbar. When the user scrolls up, show the navbar */
let prevScrollpos = window.pageYOffset;
window.onscroll = function () {
  let currentScrollPos = window.pageYOffset;
  if (prevScrollpos > currentScrollPos) {
    document.getElementById('navbar-bottom').style.bottom = '0';
  } else {
    document.getElementById('navbar-bottom').style.bottom = '-200px';
  }
  prevScrollpos = currentScrollPos;
};

//Swipe items for execute actions
items.forEach((item) => {
  item.addEventListener('touchstart', (e) => {
    e.target.dataset.x =
      Number(e.touches[0].pageX) + Number(e.target.dataset.move) || 0;
  });

  item.addEventListener('touchmove', (e) => {
    let moveX = Number(e.target.dataset.x) - e.touches[0].pageX;

    moveX > 130 ? (moveX = 130) : null;
    moveX < -130 ? (moveX = -130) : null;

    e.target.dataset.move = moveX;

    anime({
      targets: e.target,
      translateX: -Number(e.target.dataset.move),
      duration: 300,
    });
  });

  item.addEventListener('touchend', (e) => {
    let elementMove = e.target.dataset.move;

    if (elementMove > 100) elementMove = 100;
    else if (elementMove < -100) elementMove = -100;
    else elementMove = 0;

    items.forEach((item) => {
      let content = item.querySelector('.list-content');

      if (content === e.target) {
        return null;
      }

      content.dataset.x = 0;
      content.dataset.move = 0;

      anime({
        targets: content,
        translateX: 0,
      });
    });

    setTimeout(() => {
      anime({
        targets: e.target,
        translateX: -Number(elementMove),
      });
    }, 1);
  });
});

//Registering serviveWorker.js

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register('/serviceWorker.js')
      .then((res) => console.log('service worker registered'))
      .catch((err) => console.log('service worker not registered', err));
  });
}
