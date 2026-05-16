// firebase-api.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyC92UNkrbU2KHUZzTtLQggOa1qpa2hvFbs",
  authDomain: "magic-shop-285c1.firebaseapp.com",
  projectId: "magic-shop-285c1",
  storageBucket: "magic-shop-285c1.firebasestorage.app",
  messagingSenderId: "189566179161",
  appId: "1:189566179161:web:10b28c648af33cfd459e48",
  measurementId: "G-HWVDNYGS88"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

// Регистрация
async function registerUser(name, email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const role = usersSnapshot.empty ? 'admin' : 'user';
    await setDoc(doc(db, 'users', user.uid), {
      name: name,
      email: email,
      role: role,
      registrationDate: new Date().toISOString()
    });
    return { id: user.uid, name: name, email: email, role: role };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Вход
async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();
    currentUser = {
      id: user.uid,
      name: userData.name,
      email: user.email,
      role: userData.role,
      registrationDate: userData.registrationDate
    };
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    return currentUser;
  } catch (error) {
    throw new Error('Неверный email или пароль');
  }
}

// Выход
function logout() {
  signOut(auth);
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('currentUser');
  currentUser = null;
  alert('Вы вышли из системы');
  window.location.href = 'index.html';
}

// Проверка авторизации
function checkAuthStatus() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const authLink = document.getElementById('auth-link');
  const profileLink = document.getElementById('profile-link');
  if (isLoggedIn === 'true') {
    if (authLink) authLink.style.display = 'none';
    if (profileLink) profileLink.style.display = 'inline';
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
  } else {
    if (authLink) authLink.style.display = 'inline';
    if (profileLink) profileLink.style.display = 'none';
  }
}

// Товары
async function getProducts(category = null) {
  try {
    let q = collection(db, 'products');
    if (category && category !== 'all') {
      q = query(collection(db, 'products'), where('category', '==', category));
    }
    const querySnapshot = await getDocs(q);
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    return products;
  } catch (error) {
    return [];
  }
}

// Заказы
async function createOrder(userId, items, total, address) {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      userId: userId,
      items: items,
      total: total,
      address: address,
      status: 'pending',
      date: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
}

async function getUserOrders(userId) {
  try {
    const q = query(collection(db, 'orders'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    return orders;
  } catch (error) {
    return [];
  }
}

async function getAllOrders() {
  try {
    const querySnapshot = await getDocs(collection(db, 'orders'));
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    return orders;
  } catch (error) {
    return [];
  }
}

async function updateOrderStatus(orderId, status) {
  try {
    await updateDoc(doc(db, 'orders', orderId), { status: status });
  } catch (error) {
    throw error;
  }
}

// Пользователи (админ)
async function getAllUsers() {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users;
  } catch (error) {
    return [];
  }
}

async function updateUserRole(userId, role) {
  try {
    await updateDoc(doc(db, 'users', userId), { role: role });
  } catch (error) {
    throw error;
  }
}

async function deleteUser(userId) {
  try {
    const ordersQuery = query(collection(db, 'orders'), where('userId', '==', userId));
    const ordersSnapshot = await getDocs(ordersQuery);
    ordersSnapshot.forEach(async (orderDoc) => {
      await deleteDoc(doc(db, 'orders', orderDoc.id));
    });
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    throw error;
  }
}

// Избранное
async function getFavorites(userId) {
  try {
    const q = query(collection(db, 'favorites'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const favorites = [];
    querySnapshot.forEach((doc) => {
      favorites.push({ id: doc.id, ...doc.data() });
    });
    return favorites;
  } catch (error) {
    return [];
  }
}

async function addToFavorites(userId, productName, productPrice, productImage) {
  try {
    await addDoc(collection(db, 'favorites'), {
      userId: userId,
      productName: productName,
      productPrice: productPrice,
      productImage: productImage,
      addedDate: new Date().toISOString()
    });
  } catch (error) {
    throw error;
  }
}

async function removeFromFavorites(userId, productName) {
  try {
    const q = query(collection(db, 'favorites'), where('userId', '==', userId), where('productName', '==', productName));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  } catch (error) {
    throw error;
  }
}

// Делаем функции глобальными
window.currentUser = currentUser;
window.registerUser = registerUser;
window.loginUser = loginUser;
window.logout = logout;
window.checkAuthStatus = checkAuthStatus;
window.getProducts = getProducts;
window.createOrder = createOrder;
window.getUserOrders = getUserOrders;
window.getAllOrders = getAllOrders;
window.updateOrderStatus = updateOrderStatus;
window.getAllUsers = getAllUsers;
window.updateUserRole = updateUserRole;
window.deleteUser = deleteUser;
window.getFavorites = getFavorites;
window.addToFavorites = addToFavorites;
window.removeFromFavorites = removeFromFavorites;