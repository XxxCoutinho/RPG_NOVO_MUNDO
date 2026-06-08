// Configuração Firebase do projeto RPG Nexus.
// A autenticação por Google precisa estar habilitada no Console Firebase.
window.firebaseConfig = {
  apiKey: "AIzaSyBk0zsp2lxPaNZcbsbmvFYcopUXiJdhaHI",
  authDomain: "rpg-novomundo.firebaseapp.com",
  projectId: "rpg-novomundo",
  storageBucket: "rpg-novomundo.firebasestorage.app",
  messagingSenderId: "969625547513"
};

if (window.firebase && !firebase.apps.length) {
  firebase.initializeApp(window.firebaseConfig);
}
