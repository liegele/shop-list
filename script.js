//Setting User
let userId = 'liegele@gmail.com';

//Array for MODE options [add, select, shop] available in application.
const mode = ['add', 'select', 'shop'];

//App will start on SELECT MODE.
let currentMode = mode[1];

//Setting DOM elements into variables to further manipulation
const items = document.querySelectorAll('.list-item');
const addItemsButton = document.getElementById('add-items');
const selectItemsButton = document.getElementById('select-items');
const makeShopButton = document.getElementById('make-shop');
const saveButton = document.getElementById('save-button');
const clearButton = document.getElementById('clear-button');
const categorySelect = document.getElementById('category-select');
const itemInput = document.getElementById('item-input');
const snackbar = document.getElementById('snackbar');
const itemsHtml = document.getElementById('items');

//Setting visibility of buttons according with chosen mode.
const toggleElements = (elementName, classIn, classOut) => {
  document.getElementsByName(elementName).forEach((el, key) => {
    document
      .getElementsByName(elementName)
      [key].classList.replace(classOut, classIn);
  });
};

//Initialize Firebase FireStore
firebase.initializeApp({
  apiKey: 'AIzaSyAlF1p3i3vLKAYYx-356m3Wg6EI-xfIU98',
  authDomain: 'shoplist-ad73c.firebaseapp.com',
  projectId: 'shoplist-ad73c',
  storageBucket: 'shoplist-ad73c.appspot.com',
  messagingSenderId: '189870305867',
  appId: '1:189870305867:web:5f002b9eec5feacec1d3ce',
});

const db = firebase.firestore();

//Shoplist's JSON model
let listItem = {
  created: firebase.firestore.FieldValue.serverTimestamp(),
  category: '',
  name: '',
  amount: 0,
  selected: 'false',
};

//Getting items from collection in Firestore
const getItems = function () {
  db.collection(userId)
    .orderBy('created', 'desc')
    .onSnapshot((snapshot) => {
      const data = snapshot.docs.map((item) => ({
        ...item.data(),
      }));
      console.log(data);
      itemsHtml.innerHTML = '';
      for (let i = 0; i < data.length; i++) {
        let html = `
        <div class="list-item">
          <button name="settings-button" class="settings">
            <div class="list-icon">
              <i class="bx bx-list-check bx-md"></i>
            </div>
          </button>
          <div class="list-content">
            <div name="left-icon" class="bx bx-cart bx-lg list-category-0"></div>
            <div class="caption">
              <h5 class="truncate">${data[i].name}</h5>
              <p>Quantidade: ${data[i].amount}</p>
            </div>
            <div name="right-icon" class="amount">
              <i class="bx bx-plus-circle bx-sm"></i>
              <i class="bx bx-minus-circle bx-sm"></i>
            </div>
          </div>
          <button name="delete-button" class="delete">
            <div class="list-icon">
              <i class="bx bxs-trash"></i>
            </div>
          </button>
        </div>`;
        itemsHtml.insertAdjacentHTML('beforeend', html);
        console.log(data[i].name);
      }
    });
};

//------------------------------------------------------------
//ADD ITEMS MODE
//------------------------------------------------------------

//Add button actions
addItemsButton.addEventListener('click', () => {
  currentMode = mode[0];
  vibration();
  addItemsButton.classList.add('dark-color');
  toggleElements('settings-button', 'settings-invisible', 'settings');
  toggleElements('delete-button', 'delete', 'delete-invisible');
  toggleElements('left-icon', 'list-category-0-invisible', 'list-category-0');
  toggleElements('right-icon', 'amount-invisible', 'amount');

  slidedown.play();
  showSnackbar('Modo: Adicionando itens');
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

//Add user data to collection using SET()
const addListItem = function () {
  db.collection(userId).add(listItem);
  // getItems();
};

saveButton.addEventListener('click', (e) => {
  e.preventDefault();
  listItem.category = categorySelect.value;
  listItem.name = itemInput.value;
  console.log(categorySelect.value);
  addListItem();
  itemInput.value = '';
});

//------------------------------------------------------------
//SELECT ITEMS MODE
//------------------------------------------------------------

const selectItems = function () {
  currentMode = mode[1];
  slideup.play();
  vibration();
  toggleElements('settings-button', 'settings', 'settings-invisible');
  toggleElements('delete-button', 'delete-invisible', 'delete');
  toggleElements('left-icon', 'list-category-0', 'list-category-0-invisible');
  toggleElements('left-icon', 'bx-checkbox', 'bx-cart');
  toggleElements('right-icon', 'amount', 'amount-invisible');
  showSnackbar('Modo: Selecionando itens');
};

selectItemsButton.addEventListener('click', selectItems);

//------------------------------------------------------------
//MAKE SHOP MODE
//------------------------------------------------------------

const makeShop = function () {
  currentMode = mode[2];
  slideup.play();
  vibration();
  toggleElements('settings-button', 'settings', 'settings-invisible');
  toggleElements('delete-button', 'delete-invisible', 'delete');
  toggleElements('left-icon', 'list-category-0', 'list-category-0-invisible');
  toggleElements('left-icon', 'bx-cart', 'bx-checkbox');
  toggleElements('right-icon', 'amount-invisible', 'amount');
  showSnackbar('Modo: Fazendo compras');
};

makeShopButton.addEventListener('click', makeShop);

//------------------------------------------------------------

//Setting SelectItems mode as main view at starting up.
window.document.addEventListener('DOMContentLoaded', getItems);
window.addEventListener('load', selectItems);

/* When the user scrolls down, hide the navbar. When the user scrolls up, show the navbar */
let prevScrollpos = window.pageYOffset;
window.onscroll = function () {
  let currentScrollPos = window.pageYOffset;
  if (prevScrollpos > currentScrollPos) {
    document.getElementById('navbar-bottom').style.bottom = '0';
  } else {
    document.getElementById('navbar-bottom').style.bottom = '-110px';
  }
  prevScrollpos = currentScrollPos;
};

items.forEach((item) => {
  var mc = new Hammer(item);
  // listen to events...
  mc.on('swipeleft swiperight tap', function (ev) {
    // mc.on('swipe panleft panright tap press', function (ev) {
    console.log(ev.type + ' gesture detected.' + ev.deltaX);
    console.log(ev, currentMode);
    if (ev.deltaX <= -25) {
      // ev.target.style.transform = 'translateX(-100px)';
      anime({
        targets: ev.target,
        translateX: -100,
        duration: 300,
      });
    }

    items.forEach((item) => {
      let content = item.querySelector('.list-content');

      if (content === ev.target) {
        return null;
      }

      anime({
        targets: content,
        translateX: 0,
      });
    });

    if (ev.type === 'tap' || ev.type === 'swiperight') {
      // ev.target.style.transform = 'translateX(0)';
      anime({
        targets: ev.target,
        translateX: 0,
        duration: 300,
      });
    }
  });
});

//Vibrating for 200ms.
const vibration = function () {
  if (navigator.vibration) {
    window.navigator.vibrate(200);
  }
};

//Snackbar
const showSnackbar = function (msg) {
  //Ad text message to div.
  snackbar.innerText = msg;

  // Add the "show" class to DIV
  snackbar.className = 'show';

  // After 3 seconds, remove the show class from DIV
  setTimeout(function () {
    snackbar.className = snackbar.className.replace('show', '');
  }, 3000);
};

//Registering serviveWorker.js.

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register('/serviceWorker.js')
      .then((res) => console.log('service worker registered'))
      .catch((err) => console.log('service worker not registered', err));
  });
}

/* let list = {
  created: firebase.firestore.FieldValue.serverTimestamp(),
  modified: '',
  accessPermission: [
    {
      email: '',
      mode: '',
    },
  ],
  listItems: [
    {
      category: '',
      name: '',
      amount: '',
      price: '0.00',
      priceTimestamp: '',
      lastPrice: '0.00',
      lastPriceTimestamp: '',
      selected: 'false',
      search: '',
    },
  ],
}; */
