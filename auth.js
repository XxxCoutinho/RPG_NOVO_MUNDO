function toggleMenu() {
  const menu = document.getElementById("menu");
  if (menu) menu.classList.toggle("active");
}

function marcarPaginaAtiva() {
  const arquivo = (location.pathname.split("/").pop() || "index.html").replace(".html", "");
  document.querySelectorAll(".site-nav a[data-page]").forEach(link => {
    link.classList.toggle("active", link.dataset.page === arquivo || (arquivo === "" && link.dataset.page === "index"));
  });
}

function configurarCabecalhoAuth() {
  const loginLink = document.getElementById("loginLink");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!window.firebase || !firebase.apps.length || !firebase.auth) {
    marcarPaginaAtiva();
    return;
  }

  const auth = firebase.auth();

  auth.onAuthStateChanged(user => {
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

  marcarPaginaAtiva();
}

document.addEventListener("DOMContentLoaded", configurarCabecalhoAuth);
