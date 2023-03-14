//Setting User
let userId = 'liegele@gmail.com';

//Array for MODE options [add, select, shop] available in application.
const mode = ['add', 'select', 'shop'];

//Categories
const category = [
  'Hortifruti',
  'Padaria',
  'Carnes e Aves',
  'Importados',
  'Bebidas',
  'Frios e Laticínios',
  'Mercearia',
  'Limpeza',
  'Congelados',
  'Higiene e Beleza',
  'Petshop',
  'Utensílios Domésticos',
];

//App will start on SELECT MODE.
let currentMode = mode[1];

//Setting DOM elements into variables to further manipulation
// const items = document.querySelectorAll('.list-item');
// console.log(items);
const addItemsButton = document.getElementById('add-items');
const selectItemsButton = document.getElementById('select-items');
const makeShopButton = document.getElementById('make-shop');
const saveButton = document.getElementById('save-button');
const clearButton = document.getElementById('clear-button');
const categorySelect = document.getElementById('category-select');
const itemInput = document.getElementById('item-input');
const snackbar = document.getElementById('snackbar');
let itemsHtml = document.getElementById('items');

//Wakelock checking

// Create a reference for the Wake Lock.
let wakeLock = null;

if ('wakeLock' in navigator) {
}

// create an async function to request a wake lock
const wakeLockScreen = async function () {
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    // console.log('wake lock active...');
  } catch (err) {
    // The Wake Lock request has failed - usually system related, such as battery.
    console.log(`${err.name}, ${err.message}`);
  }
};

wakeLockScreen();

//Reacquiring a wake lock after visibility change
document.addEventListener('visibilitychange', async () => {
  if (wakeLock !== null && document.visibilityState === 'visible') {
    wakeLock = await navigator.wakeLock.request('screen');
    // console.log(' ---> ', wakeLock);
    // console.log('wake lock active...');
  }
});

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
let items;
const getItems = function () {
  db.collection(userId)
    .orderBy('category', 'desc')
    .onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const data = { id: change.doc.id, ...change.doc.data() };
        console.log('===> ', data);

        if (change.type === 'added') {
          /* const data = snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          })); */

          // itemsHtml.innerHTML = '';
          // for (let i = 0; i < data.length; i++) {
          let html = `
            <div id="${data.id}" class="list-item" data-category="${
            data.category
          }">
              <button id="S${data.id}" name="settings-button" class="settings">
                <div class="list-icon">
                  <i class="bx bx-list-check bx-md"></i>
                </div>
              </button>
              <div class="list-content">
                <div name="left-icon" class="bx ${
                  data.selected === 'true'
                    ? 'bxs-checkbox-checked'
                    : 'bx-checkbox'
                } bx-lg list-category-0"></div>
                <div class="caption">
                  <h5 class="truncate">${data.name}</h5>
                  <p>${category[data.category]}</p>
                </div>
                <div name="right-icon" class="amount">
                  <i class="bx bx-plus-circle bx-sm"></i>
                  <i class="bx bx-minus-circle bx-sm"></i>
                </div>
              </div>
              <button id="D${data.id}" name="delete-button" class="delete">
                <div class="list-icon">
                  <i class="bx bxs-trash"></i>
                </div>
              </button>
            </div>`;
          // itemsHtml.innerHTML += html;
          itemsHtml.insertAdjacentHTML('afterbegin', html);
          // console.log(data.name);

          //Delete item list and Add event listener to DELETE button.
          document
            .getElementById(`D${data.id}`)
            .addEventListener('click', (e) => {
              db.collection(userId).doc(data.id).delete();
              console.log('delete item');
            });

          //Selecting item from list in order to able to put it in SHOPLIST
          document
            .getElementById(`S${data.id}`)
            .addEventListener('click', (e) => {
              db.collection(userId)
                .doc(data.id)
                .update({
                  selected: data.selected === 'true' ? 'false' : 'true',
                });
              console.log(
                'select item: ',
                data.selected === 'true' ? 'false' : 'true'
              );
            });

          // Add Swipe to items
          settingSwipe(data.id);
          // }
        }

        if (change.type === 'modified') {
          //maybe later select by MODE (select, select)...
          const itemModified = document.getElementById(data.id);
          console.log(data);
          itemModified.innerHTML = `
          <button id="S${data.id}" name="settings-button" class="settings">
            <div class="list-icon">
              <i class="bx bx-list-check bx-md"></i>
            </div>
          </button>
          <div class="list-content">
            <div name="left-icon" class="bx ${
              data.selected === 'true' ? 'bxs-checkbox-checked' : 'bx-checkbox'
            } bx-lg list-category-0"></div>
            <div class="caption">
              <h5 class="truncate">${data.name}</h5>
              <p>${category[data.category]}</p>
            </div>
            <div name="right-icon" class="amount">
              <i class="bx bx-plus-circle bx-sm"></i>
              <i class="bx bx-minus-circle bx-sm"></i>
            </div>
          </div>
          <button id="D${data.id}" name="delete-button" class="delete">
            <div class="list-icon">
              <i class="bx bxs-trash"></i>
            </div>
          </button>`;
          //Selecting item from list in order to able to put it in SHOPLIST
          document
            .getElementById(`S${data.id}`)
            .addEventListener('click', (e) => {
              /* document.querySelector('.list-content')[0].style.animationName =
                'blue-animation';
              console.log('----->', document.getElementById(data.id)); */
              db.collection(userId)
                .doc(data.id)
                .update({
                  selected: data.selected === 'true' ? 'false' : 'true',
                });
              console.log(
                'select item: ',
                data.selected === 'true' ? 'false' : 'true'
              );
              // blueAnimation.play();
            });

          // Add Swipe to items
          settingSwipe(data.id);
        }
        if (change.type === 'removed') {
          //Removing childNode from parentNode (items)
          const parentItemRemoved = document.getElementById('items');
          const itemRemoved = document.getElementById(data.id);
          const nodeRemoved = parentItemRemoved.removeChild(itemRemoved);
        }
      });

      //To querySelectorAll work and get all list-items in a NodeList()...
      // settingSwipe();

      switch (currentMode) {
        case 'add':
          addItems();
          break;
        case 'select':
          selectItems();
          break;
        case 'select':
          makeShop();
          break;
      }
      // currentMode === 'select' ? selectItems() : null;
    });
};

/* const getItems = function () {
  db.collection(userId)
    .orderBy('created', 'desc')
    .onSnapshot((snapshot) => {
      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));
      console.log(data);
      itemsHtml.innerHTML = '';
      for (let i = 0; i < data.length; i++) {
        let html = `
        <div class="list-item" data-category="${data[i].category}">
          <button id="S${data[i].id}" name="settings-button" class="settings">
            <div class="list-icon">
              <i class="bx bx-list-check bx-md"></i>
            </div>
          </button>
          <div class="list-content">
            <div name="left-icon" class="bx ${
              data[i].selected === 'true'
                ? 'bxs-checkbox-checked'
                : 'bx-checkbox'
            } bx-lg list-category-0"></div>
            <div class="caption">
              <h5 class="truncate">${data[i].name}</h5>
              <p>Quantidade: ${data[i].amount}</p>
            </div>
            <div name="right-icon" class="amount">
              <i class="bx bx-plus-circle bx-sm"></i>
              <i class="bx bx-minus-circle bx-sm"></i>
            </div>
          </div>
          <button id="D${data[i].id}" name="delete-button" class="delete">
            <div class="list-icon">
              <i class="bx bxs-trash"></i>
            </div>
          </button>
        </div>`;
        itemsHtml.insertAdjacentHTML('beforeend', html);
        console.log(data[i].name);

        //Delete item list and Add event listener to DELETE button.
        document
          .getElementById(`D${data[i].id}`)
          .addEventListener('click', (e) => {
            db.collection(userId).doc(data[i].id).delete();
            console.log('delete item');
          });

        //Selecting item from list in order to able to put it in SHOPLIST
        document
          .getElementById(`S${data[i].id}`)
          .addEventListener('click', (e) => {
            db.collection(userId)
              .doc(data[i].id)
              .update({
                selected: data[i].selected === 'true' ? 'false' : 'true',
              });
            console.log(
              'select item: ',
              data[i].selected === 'true' ? 'false' : 'true'
            );
          });
      }

      //To querySelectorAll work and get all list-items in a NodeList()...
      settingSwipe();

      currentMode === 'select' ? selectItems() : null;
    });
}; */

//------------------------------------------------------------
//ADD ITEMS MODE
//------------------------------------------------------------

//Add button actions
const addItems = function () {
  currentMode = mode[0];
  vibration();
  addItemsButton.classList.add('dark-color');
  toggleElements('settings-button', 'settings-invisible', 'settings');
  toggleElements('delete-button', 'delete', 'delete-invisible');
  toggleElements('left-icon', 'list-category-0-invisible', 'list-category-0');
  toggleElements('right-icon', 'amount-invisible', 'amount');
  toggleElements('add-items', 'navbar-item-blue', 'navbar-item');
  toggleElements('select-items', 'navbar-item', 'navbar-item-blue');
  toggleElements('make-shop', 'navbar-item', 'navbar-item-blue');
  window.scrollTo(0, 0);
  // scrollingToStart();
  slidedown.play();
  showSnackbar('Modo: Adicionando itens', true);
};

addItemsButton.addEventListener('click', addItems);

//Scrolling to start of page.
/* const scrollingToStart = function () {
  window.scroll({
    top: 0,
    left: 0,
    behavior: 'smooth',
  });
}; */

//Clear button actions
clearButton.addEventListener('click', () => {
  categorySelect.value = itemInput.value = '';
});

/* let blueAnimation = anime
  .timeline({
    endDelay: 1000,
    easing: 'easeInOutQuad',
    direction: 'alternate',
    loop: true,
  })
  .add({ targets: '.list-content', background: '#3096d1' }, 0); */

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

//Function to add item data to collection using SET()
const addListItem = function () {
  db.collection(userId).add(listItem);
  // getItems();
};

//Add item data to collection after click on save
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
  toggleElements('add-items', 'navbar-item', 'navbar-item-blue');
  toggleElements('select-items', 'navbar-item-blue', 'navbar-item');
  toggleElements('make-shop', 'navbar-item', 'navbar-item-blue');

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
  toggleElements('add-items', 'navbar-item', 'navbar-item-blue');
  toggleElements('select-items', 'navbar-item', 'navbar-item-blue');
  toggleElements('make-shop', 'navbar-item-blue', 'navbar-item');
  showSnackbar('Modo: Fazendo compras');
};

makeShopButton.addEventListener('click', makeShop);

//------------------------------------------------------------

//Setting SelectItems mode as main view at starting up.
window.document.addEventListener('DOMContentLoaded', getItems);
// window.addEventListener('load', selectItems);

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

//Function to Setting Swipe on List-Items
const settingSwipe = function (item) {
  // items = document.querySelectorAll('.list-item');

  //Getting item by ID
  item = document.getElementById(item);

  //Adding swipe to items of the list
  let mc = new Hammer(item);
  // listen to events...
  mc.on('swipeleft swiperight', function (ev) {
    // mc.on('swipe panleft panright tap press', function (ev) {
    // console.log(ev.type + ' gesture detected.' + ev.deltaX);
    // console.log(ev, currentMode);
    if (ev.deltaX <= -25) {
      // ev.target.style.transform = 'translateX(-100px)';
      anime({
        targets: ev.target,
        translateX: -100,
        duration: 300,
      });
    }

    /* items.forEach((item) => {
      let content = item.querySelector('.list-content');

      if (content === ev.target) {
        return null;
      }

      anime({
        targets: content,
        translateX: 0,
      });
    }); */

    if (ev.type === 'swiperight') {
      // ev.target.style.transform = 'translateX(0)';
      anime({
        targets: ev.target,
        translateX: 0,
        duration: 300,
      });
    }
  });
};

/* const settingSwipe = function () {
  items = document.querySelectorAll('.list-item');

  //Adding swipe to items of the list
  items.forEach((item) => {
    let mc = new Hammer(item);
    // listen to events...
    mc.on('swipeleft swiperight tap', function (ev) {
      // mc.on('swipe panleft panright tap press', function (ev) {
      // console.log(ev.type + ' gesture detected.' + ev.deltaX);
      // console.log(ev, currentMode);
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
};
 */

//Vibrating for 200ms.
const vibration = function () {
  if (navigator.vibration) {
    window.navigator.vibrate(200);
  }
};

//Snackbar
const showSnackbar = function (msg, show) {
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

/* if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register('/serviceWorker.js')
      .then((res) => console.log('service worker registered'))
      .catch((err) => console.log('service worker not registered', err));
  });
} */

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
