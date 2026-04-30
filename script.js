document.addEventListener("DOMContentLoaded", () => {
  console.log(
    "%cJFCultura Pulse Master v3.0 Init",
    "color: #2BB7A3; font-weight: bold;",
  );

  // --- Scroll Effects ---
  const header = document.querySelector(".app-header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 30) {
      header.style.transform = "scale(0.98)";
    } else {
      header.style.transform = "scale(1)";
    }
  });

  // --- Logic Factory for Chips & Filtering ---
  const initFilter = (chipSelector, itemSelector, dataAttr) => {
    const chips = document.querySelectorAll(chipSelector);
    const items = document.querySelectorAll(itemSelector);

    if (chips.length === 0) return;

    chips.forEach((chip) => {
      chip.addEventListener("click", (e) => {
        e.preventDefault();

        // UI: Toggle Active
        const parent = chip.parentElement;
        const currentActive = parent.querySelector(".chip.active");
        if (currentActive) currentActive.classList.remove("active");
        chip.classList.add("active");

        const filterValue =
          chip.getAttribute("data-filter") ||
          chip.getAttribute("data-news-filter") ||
          "todos";

        items.forEach((item) => {
          const itemVal = item.getAttribute(dataAttr) || "";

          if (
            filterValue === "todos" ||
            filterValue === "tudo" ||
            itemVal.toLowerCase() === filterValue.toLowerCase()
          ) {
            item.style.display = "flex";
            setTimeout(() => {
              item.style.opacity = "1";
              item.style.transform = "translateY(0) scale(1)";
            }, 10);
          } else {
            item.style.opacity = "0";
            item.style.transform = "translateY(20px) scale(0.95)";
            setTimeout(() => {
              item.style.display = "none";
            }, 300);
          }
        });
      });
    });
  };

  // Init Filters
  initFilter(
    ".quick-filters .chip[data-filter]",
    "#events-grid .card",
    "data-category",
  );
  initFilter(
    ".quick-filters .chip[data-news-filter]",
    "#news-grid .card",
    "data-news-cat",
  );

  // --- Search Logic (Events Page Only) ---
  const eventInput = document.getElementById("event-search-input");
  if (eventInput) {
    eventInput.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase();
      const cards = document.querySelectorAll("#events-grid .card");

      cards.forEach((card) => {
        const title = card
          .querySelector(".card-title")
          .textContent.toLowerCase();
        const category = card.getAttribute("data-category") || "";

        if (title.includes(term) || category.toLowerCase().includes(term)) {
          card.style.display = "flex";
          card.style.opacity = "1";
        } else {
          card.style.display = "none";
          card.style.opacity = "0";
        }
      });
    });
  }

  // --- Entry Animations ---
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 },
  );

  document.querySelectorAll(".card, .hero-pulse").forEach((el) => {
    observer.observe(el);
  });

  // --- Prototype: Interactive Agenda & Notifications ---
  let myCalendar = JSON.parse(localStorage.getItem("jf-calendar")) || [];

  const updateBadge = () => {
    const badge = document.getElementById("notif-badge");
    if (!badge) return;
    if (myCalendar.length > 0) {
      badge.style.display = "flex";
      badge.innerText = myCalendar.length;
    } else {
      badge.style.display = "none";
    }
  };

  window.toggleCalendar = () => {
    const overlay = document.getElementById("calendar-modal");
    overlay.classList.toggle("active");
    renderCalendar();
  };

  window.addToCalendar = (title, date, loc) => {
    // Check if duplicate
    if (myCalendar.some(ev => ev.title === title)) {
       showToast("Este evento já está na sua agenda!");
       return;
    }

    const event = { id: Date.now(), title, date, loc };
    myCalendar.push(event);
    localStorage.setItem("jf-calendar", JSON.stringify(myCalendar));
    
    updateBadge();
    showToast(`"${title}" salvo na agenda! 🎉`);
    
    // Trigger mock push after 2s
    setTimeout(() => {
        triggerPush("Confirmação JFCultura", `Não se esqueça: ${title} rola às ${date.split(",")[1].trim()}!`);
    }, 2000);
  };

  window.removeFromCalendar = (id) => {
    myCalendar = myCalendar.filter(ev => ev.id !== id);
    localStorage.setItem("jf-calendar", JSON.stringify(myCalendar));
    updateBadge();
    renderCalendar();
    showToast("Evento removido da agenda.");
  };

  const renderCalendar = () => {
    const list = document.getElementById("user-calendar-list");
    const empty = document.getElementById("calendar-empty");
    if (!list) return;

    if (myCalendar.length === 0) {
      empty.style.display = "block";
      list.innerHTML = "";
    } else {
      empty.style.display = "none";
      list.innerHTML = myCalendar.map(ev => `
        <div class="calendar-item">
          <div>
            <h4 style="font-weight: 800; color: var(--pjf-purple-dark); margin-bottom: 4px;">${ev.title}</h4>
            <div style="display: flex; gap: 15px; font-size: 12px; color: var(--text-muted);">
              <span><i class="ph ph-calendar"></i> ${ev.date}</span>
              <span><i class="ph ph-map-pin"></i> ${ev.loc}</span>
            </div>
          </div>
          <button onclick="removeFromCalendar(${ev.id})" style="background: rgba(255, 69, 58, 0.1); border: none; width: 40px; height: 40px; border-radius: 12px; color: #ff3b30; cursor: pointer; transition: 0.3s;"><i class="ph ph-trash"></i></button>
        </div>
      `).join("");
    }
  };

  const showToast = (msg) => {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<i class="ph ph-check-circle" style="color: var(--pjf-green); font-size: 24px;"></i> <span style="font-weight: 700;">${msg}</span>`;
    
    container.appendChild(toast);
    setTimeout(() => toast.classList.add("active"), 100);
    
    setTimeout(() => {
      toast.classList.remove("active");
      setTimeout(() => toast.remove(), 600);
    }, 4000);
  };

  const triggerPush = (title, msg) => {
    const push = document.getElementById("push-notification");
    document.getElementById("push-title").innerText = title;
    document.getElementById("push-msg").innerText = msg;
    
    push.classList.add("active");
    setTimeout(() => push.classList.remove("active"), 6000);
  };

  // Initial Sync
  updateBadge();
});
