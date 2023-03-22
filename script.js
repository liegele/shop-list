//Setting User
let userId = 'liegele@gmail.com';

//Flag for monitoring changes in data
let anyChangeInData = false;

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
  'Farmácia',
];

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
var itemsHtmlCopy = document.getElementById('items');

//Wakelock checking

// Create a reference for the Wake Lock.
let wakeLock = null;

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
  }
  /* if (document.visibilityState !== 'visible') {
    firebase.firestore().enableNetwork();
  } */
});

//Setting visibility of buttons according with chosen mode.
const toggleElements = (elementName, classIn, classOut) => {
  document.getElementsByName(elementName).forEach((el, key) => {
    document
      .getElementsByName(elementName)
      [key].classList.replace(classOut, classIn);
  });
};

//App will start on SELECT MODE.
let currentMode = mode[1];

//App will start with ALL categories selected
let itemId = '-1';

// toggleElements('select-items', 'navbar-item-blue', 'navbar-item');

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

//Filtering list item based on category seleted.

//Item list Component function
const itemListComponent = function (
  idData,
  selectedData,
  categoryData,
  nameData
) {
  let fullIcon, emptyIcon;
  switch (currentMode) {
    case 'add':
      fullIcon = 'bx-trash';
      emptyIcon = 'bx-trash';
      break;
    case 'shop':
      fullIcon = 'bxs-cart';
      emptyIcon = 'bx-cart';
      break;
    case 'select':
      fullIcon = 'bxs-shopping-bag';
      emptyIcon = 'bx-shopping-bag';
      break;
  }

  // console.log(`[${currentMode.toUpperCase()}]`);

  return `<button id="S${idData}" name="settings-button" class="settings">
            <div class="list-icon">
              <i class="bx bx-list-check bx-md"></i>
            </div>
          </button>
          <div class="list-content">
            <div name="left-icon" class="bx ${
              selectedData === 'true' ? fullIcon : emptyIcon
            } bx-md list-category-0"></div>
            <div class="caption">
              <h5 class="truncate">${nameData}</h5>
              <p>${category[categoryData]}</p>
            </div>
            <div name="right-icon" class="amount-invisible">
              <i class="bx bx-plus-circle bx-sm"></i>
              <i class="bx bx-minus-circle bx-sm"></i>
            </div>
          </div>
          <button id="D${idData}" name="delete-button" class="delete">
            <div class="list-icon">
              <i class="bx bxs-trash"></i>
            </div>
          </button>`;
};

let myItemData = new Map();
let j = 0;
const gettingDataFromServer = function (categoryID, condition, order) {
  itemsHtml.innerHTML = '';

  if (currentMode === 'shop') {
    value1 = 'true';
    value2 = 'true';
  } else {
    value1 = 'true';
    value2 = 'false';
  }
  const unsub = db
    .collection(userId)
    .orderBy('category', 'desc')
    // .orderBy(`${order}`, 'desc')
    .orderBy('name', 'desc')
    .where('category', `${condition}`, `${categoryID}`)
    .where('selected', 'in', [`${value1}`, `${value2}`])
    .onSnapshot((snapshot) => {
      //Keeping my items list in an array
      // myItemData.clear();
      snapshot.docChanges().forEach((change) => {
        // const data = { id: change.doc.id, ...change.doc.data() };
        // console.log(data);
        myItemData.set(change.doc.id, {
          id: change.doc.id,
          ...change.doc.data(),
        });
        // console.log(change.doc.id, change.doc.data());
        const data = myItemData.get(change.doc.id);
        // console.log('@>>>>>>>>>> ' + data.id);
        if (change.type === 'added') {
          console.log('>>>> ADDED');
          let html = `
            <div id="${data.id}" class="list-item" data-category="${
            data.category
          }">
              ${itemListComponent(
                data.id,
                data.selected,
                data.category,
                data.name
              )}
            </div>`;
          itemsHtml.insertAdjacentHTML('afterbegin', html);
          settingListItemEventListener(data.id, data.selected);
          // console.log('$$$$$', data.id, data.selected);
        }

        if (change.type === 'modified') {
          console.log('>>>> MODIFIED');
          //maybe later select by MODE (select, select)...
          const itemModified = document.getElementById(data.id);
          // console.log(data);

          if (currentMode === 'shop' && data.selected === 'false') {
            const parentItemRemoved = document.getElementById('items');
            const itemRemoved = document.getElementById(data.id);
            const nodeRemoved = parentItemRemoved.removeChild(itemRemoved);
          } else {
            itemModified.innerHTML = itemListComponent(
              data.id,
              data.selected,
              data.category,
              data.name
            );
            settingListItemEventListener(data.id, data.selected);
          }
        }

        if (change.type === 'removed') {
          console.log('>>>> REMOVED');
          //Removing childNode from parentNode (items)
          const parentItemRemoved = document.getElementById('items');
          const itemRemoved = document.getElementById(data.id);
          const nodeRemoved = parentItemRemoved.removeChild(itemRemoved);
          myItemData.delete(data.id);
        }
        j++;
      });

      let source = snapshot.metadata.fromCache ? 'local cache' : 'server';
      console.log('Data came from ' + source + ' || number of updates: ' + j);
      j = 0;

      //Data will be acessed from Local Cache
      // firebase.firestore().disableNetwork();
      console.log('myItemData.size: ', myItemData.size);
      // unsub();
      //Data will be acessed from Server
      // firebase.firestore().enableNetwork();

      //To querySelectorAll work and get all list-items in a NodeList()...
      // settingSwipe();

      switch (currentMode) {
        case 'add':
          toggleElements('settings-button', 'settings-invisible', 'settings');
          toggleElements('delete-button', 'delete', 'delete-invisible');
          // toggleElements(
          //   'left-icon',
          //   'list-category-0-invisible',
          //   'list-category-0'
          // );
          toggleElements('right-icon', 'amount-invisible', 'amount');
          toggleElements('add-items', 'navbar-item-blue', 'navbar-item');
          toggleElements('select-items', 'navbar-item', 'navbar-item-blue');
          toggleElements('make-shop', 'navbar-item', 'navbar-item-blue'); /*  */
          break;
        case 'select':
          toggleElements('settings-button', 'settings', 'settings-invisible');
          toggleElements('delete-button', 'delete-invisible', 'delete');
          toggleElements(
            'left-icon',
            'list-category-0',
            'list-category-0-invisible'
          );
          toggleElements('left-icon', 'bx-shopping-bag', 'bx-cart');
          toggleElements('left-icon', 'bxs-shopping-bag', 'bxs-cart');
          toggleElements('right-icon', 'amount-invisible', 'amount');
          toggleElements('add-items', 'navbar-item', 'navbar-item-blue');
          toggleElements('select-items', 'navbar-item-blue', 'navbar-item');
          toggleElements('make-shop', 'navbar-item', 'navbar-item-blue');
          break;
        case 'shop':
          toggleElements('settings-button', 'settings', 'settings-invisible');
          toggleElements('delete-button', 'delete-invisible', 'delete');
          toggleElements(
            'left-icon',
            'list-category-0',
            'list-category-0-invisible'
          );
          toggleElements('left-icon', 'bx-cart', 'bx-shopping-bag');
          toggleElements('left-icon', 'bxs-cart', 'bxs-shopping-bag');
          toggleElements('right-icon', 'amount-invisible', 'amount');
          toggleElements('add-items', 'navbar-item', 'navbar-item-blue');
          toggleElements('select-items', 'navbar-item', 'navbar-item-blue');
          toggleElements('make-shop', 'navbar-item-blue', 'navbar-item');
          break;
      }
    });
};

//Defining function to add eventlistener to list items.
const settingListItemEventListener = function (idData, selectedData) {
  //Ading event listener to DELETE button.
  document.getElementById(`D${idData}`).addEventListener('click', (e) => {
    db.collection(userId).doc(idData).delete();
    console.log('delete item');
  });

  //Selecting item from list in order to able to put it in SHOPLIST
  document.getElementById(`S${idData}`).addEventListener('click', (e) => {
    db.collection(userId)
      .doc(idData)
      .update({
        selected: selectedData === 'true' ? 'false' : 'true',
      });
    console.log('------------------------------');
    console.log('select item: ', selectedData === 'true' ? 'false' : 'true');
  });

  // Add Swipe to items
  settingSwipe(idData);
  // }
};

const gettingDataFromMap = function (categoryID) {
  itemsHtml.innerHTML = '';

  myItemData.forEach((value, key) => {
    if (
      (value.category === categoryID || categoryID === '-1') &&
      currentMode !== 'shop'
    ) {
      let html = `
      <div id="${value.id}" class="list-item" data-category="${value.category}">
        ${itemListComponent(
          value.id,
          value.selected,
          value.category,
          value.name
        )}
      </div>`;
      itemsHtml.insertAdjacentHTML('afterbegin', html);
      settingListItemEventListener(value.id, value.selected);
    } else if (
      currentMode === 'shop' &&
      value.selected === 'true' &&
      (value.category === categoryID || categoryID === '-1')
    ) {
      let html = `
      <div id="${value.id}" class="list-item" data-category="${value.category}">
        ${itemListComponent(
          value.id,
          value.selected,
          value.category,
          value.name
        )}
      </div>`;
      itemsHtml.insertAdjacentHTML('afterbegin', html);
      settingListItemEventListener(value.id, value.selected);
    }
  });

  switch (currentMode) {
    case 'add':
      toggleElements('settings-button', 'settings-invisible', 'settings');
      toggleElements('delete-button', 'delete', 'delete-invisible');
      // toggleElements(
      //   'left-icon',
      //   'list-category-0-invisible',
      //   'list-category-0'
      // );
      toggleElements('right-icon', 'amount-invisible', 'amount');
      toggleElements('add-items', 'navbar-item-blue', 'navbar-item');
      toggleElements('select-items', 'navbar-item', 'navbar-item-blue');
      toggleElements('make-shop', 'navbar-item', 'navbar-item-blue'); /*  */
      break;
    case 'select':
      toggleElements('settings-button', 'settings', 'settings-invisible');
      toggleElements('delete-button', 'delete-invisible', 'delete');
      toggleElements(
        'left-icon',
        'list-category-0',
        'list-category-0-invisible'
      );
      toggleElements('left-icon', 'bx-shopping-bag', 'bx-cart');
      toggleElements('left-icon', 'bxs-shopping-bag', 'bxs-cart');
      toggleElements('right-icon', 'amount-invisible', 'amount');
      toggleElements('add-items', 'navbar-item', 'navbar-item-blue');
      toggleElements('select-items', 'navbar-item-blue', 'navbar-item');
      toggleElements('make-shop', 'navbar-item', 'navbar-item-blue');
      break;
    case 'shop':
      toggleElements('settings-button', 'settings', 'settings-invisible');
      toggleElements('delete-button', 'delete-invisible', 'delete');
      toggleElements(
        'left-icon',
        'list-category-0',
        'list-category-0-invisible'
      );
      toggleElements('left-icon', 'bx-cart', 'bx-shopping-bag');
      toggleElements('left-icon', 'bxs-cart', 'bxs-shopping-bag');
      toggleElements('right-icon', 'amount-invisible', 'amount');
      toggleElements('add-items', 'navbar-item', 'navbar-item-blue');
      toggleElements('select-items', 'navbar-item', 'navbar-item-blue');
      toggleElements('make-shop', 'navbar-item-blue', 'navbar-item');
      break;
  }
};

//------------------------------------------------------------
//ADD ITEMS MODE
//------------------------------------------------------------

//Add button actions
const addItems = function () {
  currentMode = mode[0];
  // console.log(currentMode);
  addItemsButton.classList.add('dark-color');
  // vibration();
  /* toggleElements('settings-button', 'settings-invisible', 'settings');
  toggleElements('delete-button', 'delete', 'delete-invisible');
  toggleElements('left-icon', 'list-category-0-invisible', 'list-category-0');
  toggleElements('right-icon', 'amount-invisible', 'amount');
  toggleElements('add-items', 'navbar-item-blue', 'navbar-item');
  toggleElements('select-items', 'navbar-item', 'navbar-item-blue');
  toggleElements('make-shop', 'navbar-item', 'navbar-item-blue'); */
  // showSnackbar('Modo: Adicionando itens', true);
  // scrollingToStart();
  window.scrollTo(0, 0);
  slidedown.play();

  if (itemId === '-1') {
    // gettingDataFromServer(0, '>=', 'category');
    gettingDataFromMap(itemId);
  } else {
    // gettingDataFromServer(itemId, '==', 'name');
    gettingDataFromMap(itemId);
  }
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

//Function to add item data to collection
const addListItem = function () {
  db.collection(userId).add(listItem);
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
  // console.log(currentMode);
  slideup.play();
  // vibration();
  /* toggleElements('settings-button', 'settings', 'settings-invisible');
  toggleElements('delete-button', 'delete-invisible', 'delete');
  toggleElements('left-icon', 'list-category-0', 'list-category-0-invisible');
  toggleElements('left-icon', 'bx-shopping-bag', 'bx-cart');
  toggleElements('left-icon', 'bxs-shopping-bag', 'bxs-cart');
  toggleElements('right-icon', 'amount-invisible', 'amount');
  toggleElements('add-items', 'navbar-item', 'navbar-item-blue');
  toggleElements('select-items', 'navbar-item-blue', 'navbar-item');
  toggleElements('make-shop', 'navbar-item', 'navbar-item-blue'); */
  // showSnackbar('Modo: Selecionando itens');

  if (itemId === '-1') {
    // gettingDataFromServer(0, '>=', 'category');
    gettingDataFromMap(itemId);
  } else {
    // gettingDataFromServer(itemId, '==', 'name');
    gettingDataFromMap(itemId);
  }
};

selectItemsButton.addEventListener('click', selectItems);

//------------------------------------------------------------
//MAKE SHOP MODE
//------------------------------------------------------------

const makeShop = function () {
  currentMode = mode[2];
  // console.log(currentMode);
  slideup.play();
  // vibration();
  /* toggleElements('settings-button', 'settings', 'settings-invisible');
  toggleElements('delete-button', 'delete-invisible', 'delete');
  toggleElements('left-icon', 'list-category-0', 'list-category-0-invisible');
  toggleElements('left-icon', 'bx-cart', 'bx-shopping-bag');
  toggleElements('left-icon', 'bxs-cart', 'bxs-shopping-bag');
  toggleElements('right-icon', 'amount-invisible', 'amount');
  showSnackbar('Modo: Fazendo compras');
  toggleElements('add-items', 'navbar-item', 'navbar-item-blue');
  toggleElements('select-items', 'navbar-item', 'navbar-item-blue');
  toggleElements('make-shop', 'navbar-item-blue', 'navbar-item'); */

  if (itemId === '-1') {
    // gettingDataFromServer(0, '>=', 'category');
    gettingDataFromMap(itemId);
  } else {
    // gettingDataFromServer(itemId, '==', 'name');
    gettingDataFromMap(itemId);
  }
};

makeShopButton.addEventListener('click', makeShop);

//------------------------------------------------------------

//Setting SelectItems mode as main view at starting up.
window.document.addEventListener(
  'DOMContentLoaded',
  gettingDataFromServer(0, '>=', 'category')
);

//Defining function to filter list items according to category select.

const filteredListItems = function () {
  // document.getElementById('items').innerHTML = '';
  const filters = document.querySelectorAll('.scrollmenu > a');
  console.log(document.querySelector('#items').childElementCount);

  filters.forEach((item) => {
    // console.log(item);
    item.addEventListener('click', () => {
      document.querySelectorAll('a').forEach((menu) => {
        // console.log(menu.id, item.id);
        itemId = item.id;
        if (menu.id === item.id) {
          document
            .getElementById(menu.id)
            .classList.replace('dark-button', 'blue-button');
          categorySelect.value = menu.id;
        } else {
          document
            .getElementById(menu.id)
            .classList.replace('blue-button', 'dark-button');
        }
      });

      // console.log(document.getElementById(item.id));
      // console.log('Show category: ' + item.id);
      // const condition = item.id === '-1' ? '>=' : '==';
      itemsHtml.innerHTML = '';
      if (item.id === '-1') {
        // gettingDataFromServer(0, '>=', 'category');
        gettingDataFromMap(itemId);
      } else {
        // gettingDataFromServer(item.id, '==', 'name');
        gettingDataFromMap(itemId);
      }
    });
  });
};

filteredListItems();

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
        duration: 200,
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
        duration: 200,
      });
    }
  });
};

//Vibrating for 200ms.
const vibration = function () {
  if (navigator.vibration) {
    window.navigator.vibrate(200);
  }
};

//Snackbar
/* const showSnackbar = function (msg, show) {
  //Ad text message to div.
  snackbar.innerText = msg;
  // Add the "show" class to DIV
  snackbar.className = 'show';
  // After 3 seconds, remove the show class from DIV
  setTimeout(function () {
    snackbar.className = snackbar.className.replace('show', '');
  }, 3000);
}; */

//Registering serviveWorker.js.

/* if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register('/serviceWorker.js')
      .then((res) => console.log('service worker registered'))
      .catch((err) => console.log('service worker not registered', err));
  });
} */
