(function () {
  const MONTHS = [
    "Ianuarie",
    "Februarie",
    "Martie",
    "Aprilie",
    "Mai",
    "Iunie",
    "Iulie",
    "August",
    "Septembrie",
    "Octombrie",
    "Noiembrie",
    "Decembrie"
  ];

  const categoryIcons = {
    Altele: "📌"
  };

  const iconRules = [
    ["munca", "💼"],
    ["munc", "💼"],
    ["chirie", "🏠"],
    ["vanzare", "📦"],
    ["vânzare", "📦"],
    ["econom", "💰"],
    ["cadou", "🎁"],
    ["invest", "📈"],
    ["buzunar", "👛"],
    ["premiu", "🏆"],
    ["mancare", "🍔"],
    ["mâncare", "🍔"],
    ["transport", "🚗"],
    ["utilit", "💡"],
    ["haine", "👕"],
    ["divert", "🎮"],
    ["joc", "🎮"],
    ["sanatate", "🏥"],
    ["sănătate", "🏥"],
    ["educ", "📚"],
    ["restaurant", "🍽️"],
    ["dulci", "🍭"],
    ["cart", "📚"],
    ["juc", "🧸"]
  ];

  const CAT_ICONS = new Proxy(categoryIcons, {
    get(target, prop) {
      if (typeof prop !== "string") return target[prop];
      if (prop in target) return target[prop];
      const normalized = prop
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const match = iconRules.find(([word]) => normalized.includes(word));
      return match ? match[1] : "📌";
    }
  });

  let toastTimer = null;

  function initFirebase() {
    if (window.auth && window.db) return;
    if (!window.firebase) {
      throw new Error("Firebase SDK nu este incarcat.");
    }
    if (!window.firebaseConfig) {
      throw new Error("Configuratia Firebase lipseste.");
    }
    if (!firebase.apps.length) {
      firebase.initializeApp(window.firebaseConfig);
    }
    window.auth = firebase.auth();
    window.db = firebase.firestore();
  }

  function requireAuth(allowedTypes, onReady) {
    initFirebase();
    showLoading("Se incarca...");
    auth.onAuthStateChanged(async (user) => {
      if (!user) {
        window.location.href = "index.html";
        return;
      }

      try {
        const snap = await db.collection("users").doc(user.uid).get();
        if (!snap.exists) {
          await auth.signOut();
          window.location.href = "index.html";
          return;
        }

        const data = snap.data();
        if (Array.isArray(allowedTypes) && allowedTypes.length && !allowedTypes.includes(data.type)) {
          const pages = { parinte: "parinte.html", copil: "copil.html", normal: "normal.html" };
          window.location.href = pages[data.type] || "index.html";
          return;
        }

        onReady(user, data);
      } catch (error) {
        console.error(error);
        hideLoading();
        showToast("Nu am putut incarca datele contului.");
      }
    });
  }

  function signOut() {
    initFirebase();
    auth.signOut().finally(() => {
      window.location.href = "index.html";
    });
  }

  function showLoading(message) {
    const overlay = document.getElementById("loadingOverlay");
    if (!overlay) return;
    const text = overlay.querySelector("p");
    if (text && message) text.textContent = message;
    overlay.classList.add("show");
  }

  function hideLoading() {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) overlay.classList.remove("show");
  }

  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) {
      alert(message);
      return;
    }
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
  }

  function fmt(value) {
    const amount = Number(value) || 0;
    return `${amount.toLocaleString("ro-RO", {
      minimumFractionDigits: amount % 1 ? 2 : 0,
      maximumFractionDigits: 2
    })} lei`;
  }

  function generateCode(length) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    const size = length || 6;
    for (let i = 0; i < size; i += 1) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  function spawnConfetti() {
    const colors = ["#4F46E5", "#7C3AED", "#F59E0B", "#10B981", "#EF4444"];
    const count = 28;

    for (let i = 0; i < count; i += 1) {
      const piece = document.createElement("span");
      piece.style.position = "fixed";
      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.top = "-12px";
      piece.style.width = "8px";
      piece.style.height = "12px";
      piece.style.borderRadius = "2px";
      piece.style.background = colors[i % colors.length];
      piece.style.pointerEvents = "none";
      piece.style.zIndex = "10000";
      piece.style.opacity = "0.95";
      piece.style.transform = `rotate(${Math.random() * 180}deg)`;
      piece.style.transition = "transform 1.2s ease-out, top 1.2s ease-in, opacity 1.2s";
      document.body.appendChild(piece);

      requestAnimationFrame(() => {
        piece.style.top = `${70 + Math.random() * 25}vh`;
        piece.style.opacity = "0";
        piece.style.transform = `translateX(${Math.random() * 120 - 60}px) rotate(${360 + Math.random() * 360}deg)`;
      });

      setTimeout(() => piece.remove(), 1300);
    }
  }

  window.MONTHS = MONTHS;
  window.CAT_ICONS = CAT_ICONS;
  window.initFirebase = initFirebase;
  window.requireAuth = requireAuth;
  window.signOut = signOut;
  window.showLoading = showLoading;
  window.hideLoading = hideLoading;
  window.showToast = showToast;
  window.fmt = fmt;
  window.generateCode = generateCode;
  window.spawnConfetti = spawnConfetti;
})();
