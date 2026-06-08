function toggleMenu() {
  const menu = document.getElementById("menu");
  if (menu) menu.classList.toggle("active");
}

window.rpgAuth = {
  ready: false,
  currentUser: null
};

function marcarPaginaAtiva() {
  const arquivo = (location.pathname.split("/").pop() || "index.html").replace(".html", "") || "index";
  document.querySelectorAll(".site-nav a[data-page]").forEach(link => {
    link.classList.toggle("active", link.dataset.page === arquivo || (arquivo === "" && link.dataset.page === "index"));
  });
}

function destinoAtual() {
  return location.pathname.split('/').pop() + location.search + location.hash;
}

function requireLogin() {
  if (window.rpgAuth && window.rpgAuth.currentUser) return true;

  localStorage.setItem('rpgNexusRedirectAfterLogin', destinoAtual() || 'campanhas.html');
  alert('Você precisa fazer login antes de criar, editar ou adicionar conteúdo.');
  location.href = 'login.html?redirect=' + encodeURIComponent(destinoAtual() || 'campanhas.html');
  return false;
}

function configurarCabecalhoAuth() {
  const loginLink = document.getElementById("loginLink");
  const logoutBtn = document.getElementById("logoutBtn");

  marcarPaginaAtiva();

  if (!window.firebase || !firebase.apps.length || !firebase.auth) {
    window.rpgAuth.ready = true;
    return;
  }

  const auth = firebase.auth();

  auth.onAuthStateChanged(user => {
    window.rpgAuth.ready = true;
    window.rpgAuth.currentUser = user || null;

    if (!loginLink || !logoutBtn) return;

    if (user) {
      const nome = user.displayName || user.email || "Usuário";
      loginLink.textContent = nome;
      loginLink.title = nome;
      loginLink.href = "login.html";
      loginLink.classList.add("user-pill");
      logoutBtn.hidden = false;
    } else {
      loginLink.textContent = "Login";
      loginLink.title = "Login";
      loginLink.href = "login.html";
      loginLink.classList.remove("user-pill");
      logoutBtn.hidden = true;
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await auth.signOut();
        if (location.pathname.endsWith("login.html")) location.reload();
      } catch (erro) {
        alert("Não foi possível sair da conta: " + erro.message);
      }
    });
  }

  document.addEventListener('click', event => {
    const alvoProtegido = event.target.closest('[data-auth-required="true"]');
    if (!alvoProtegido) return;
    if (!requireLogin()) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
}

document.addEventListener("DOMContentLoaded", configurarCabecalhoAuth);
