const BARBERSHOP_WHATSAPP = "5562993669106";
const STORAGE_KEY = "barberprime_bookings_v1";

const SERVICES = [
  {
    id: "corte-classico",
    name: "Corte Degradê / Social",
    tag: "Cabelo",
    duration: 35,
    price: 45,
    desc: "Acabamento na navalha, lavagem refrescante e finalização modeladora."
  },
  {
    id: "barba-terapia",
    name: "Barba & Toalha Quente",
    tag: "Barba",
    duration: 30,
    price: 35,
    desc: "Modelagem completa com óleo essencial, vapor/toalha quente e pós-barba."
  },
  {
    id: "combo-prime",
    name: "Combo Prime (Cabelo + Barba)",
    tag: "Mais Pedido",
    duration: 60,
    price: 70,
    desc: "Corte completo + ritual de barba com economia especial no combo."
  },
  {
    id: "platinado-pigmentacao",
    name: "Acabamento & Pigmentação",
    tag: "Estilo",
    duration: 45,
    price: 60,
    desc: "Alinhamento de contornos, sobrancelha na navalha e correção de falhas."
  }
];

const PRODUCTS = [
  {
    id: "pomada-matte",
    name: "Pomada Modeladora Matte",
    tag: "Efeito Seco",
    price: 38,
    desc: "Fixação firme sem brilho excessivo, ideal para texturas e penteados naturais."
  },
  {
    id: "oleo-barba",
    name: "Óleo Nutritivo para Barba",
    tag: "Hidratação",
    price: 42,
    desc: "Maciez imediata, redução do frizz e aroma amadeirado elegante."
  },
  {
    id: "balm-pos-barba",
    name: "Balm Calmante Pós-Barba",
    tag: "Alívio",
    price: 36,
    desc: "Acalma a pele após o uso da lâmina e mantém a hidratação o dia todo."
  },
  {
    id: "shampoo-mentolado",
    name: "Shampoo 2 em 1 Mentolado",
    tag: "Frescor",
    price: 34,
    desc: "Limpeza profunda para cabelo e barba com sensação refrescante."
  }
];

const BARBERS = [
  { id: "rafael", name: "Rafael Mendes", role: "Master Barber • Degradê & Navalha" },
  { id: "lucas", name: "Lucas Ferreira", role: "Especialista em Barba & Visagismo" },
  { id: "diego", name: "Diego Rocha", role: "Cortes Clássicos & Estilo Moderno" }
];

const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00",
  "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00"
];

const PAYMENT_LABELS = {
  pix: "PIX Instantâneo",
  credit: "Cartão de Crédito",
  debit: "Cartão de Débito",
  local: "Pagar na Barbearia"
};

function getTodayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().split("T")[0];
}

function formatBRL(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function formatDateBR(isoDate) {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

const state = {
  selectedServiceIds: ["corte-classico"],
  selectedBarberId: BARBERS[0].id,
  selectedDate: getTodayISO(),
  selectedTime: "10:00",
  paymentMethod: "pix",
  cart: [],
  bookings: [],
  statusFilter: "all"
};

function loadBookings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        state.bookings = parsed;
        return;
      }
    }
  } catch {
    // Fallback para dados iniciais
  }

  state.bookings = [
    {
      id: "BP-1041",
      clientName: "Gustavo Oliveira",
      clientPhone: "62998112233",
      notes: "",
      services: ["Combo Prime (Cabelo + Barba)"],
      cartItems: [],
      barberName: "Rafael Mendes",
      date: getTodayISO(),
      time: "09:00",
      duration: 60,
      paymentMethod: "pix",
      paymentLabel: "PIX Instantâneo",
      installments: "1x",
      total: 70,
      status: "Confirmado"
    },
    {
      id: "BP-1042",
      clientName: "Matheus Costa",
      clientPhone: "62997445566",
      notes: "",
      services: ["Corte Degradê / Social"],
      cartItems: ["Pomada Modeladora Matte (x1)"],
      barberName: "Lucas Ferreira",
      date: getTodayISO(),
      time: "11:00",
      duration: 35,
      paymentMethod: "credit",
      paymentLabel: "Cartão de Crédito",
      installments: "1x",
      total: 83,
      status: "Concluído"
    }
  ];
  saveBookings();
}

function saveBookings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.bookings));
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2800);
}

function isSlotBooked(barberName, date, time) {
  return state.bookings.some(
    (b) =>
      b.barberName === barberName &&
      b.date === date &&
      b.time === time &&
      b.status !== "Cancelado"
  );
}

function getCartSubtotal() {
  return state.cart.reduce((sum, entry) => {
    const prod = PRODUCTS.find((p) => p.id === entry.productId);
    return sum + (prod ? prod.price * entry.qty : 0);
  }, 0);
}

function getServicesSubtotal() {
  return state.selectedServiceIds.reduce((sum, id) => {
    const srv = SERVICES.find((s) => s.id === id);
    return sum + (srv ? srv.price : 0);
  }, 0);
}

function getTotalDuration() {
  return state.selectedServiceIds.reduce((sum, id) => {
    const srv = SERVICES.find((s) => s.id === id);
    return sum + (srv ? srv.duration : 0);
  }, 0);
}

function getOrderTotal() {
  return getServicesSubtotal() + getCartSubtotal();
}

function renderServices() {
  const grid = document.getElementById("services-grid");
  grid.innerHTML = SERVICES.map((srv) => {
    const selected = state.selectedServiceIds.includes(srv.id);
    return `
      <article class="item-card ${selected ? "selected" : ""}">
        <div>
          <div class="item-top">
            <span class="item-tag">${srv.tag}</span>
            <span class="item-duration">${srv.duration} min</span>
          </div>
          <h3>${srv.name}</h3>
          <p>${srv.desc}</p>
        </div>
        <div class="item-bottom">
          <span class="price-tag">${formatBRL(srv.price)}</span>
          <button type="button" class="btn-secondary btn-xs toggle-service-btn" data-id="${srv.id}">
            ${selected ? "Selecionado ✓" : "Selecionar"}
          </button>
        </div>
      </article>
    `;
  }).join("");

  grid.querySelectorAll(".toggle-service-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      if (state.selectedServiceIds.includes(id)) {
        state.selectedServiceIds = state.selectedServiceIds.filter((item) => item !== id);
      } else {
        state.selectedServiceIds.push(id);
      }
      renderServices();
      updateSummary();
    });
  });
}

function renderProducts() {
  const grid = document.getElementById("products-grid");
  grid.innerHTML = PRODUCTS.map((prod) => `
    <article class="item-card">
      <div>
        <div class="item-top">
          <span class="item-tag">${prod.tag}</span>
          <span class="item-duration">Pronta entrega</span>
        </div>
        <h3>${prod.name}</h3>
        <p>${prod.desc}</p>
      </div>
      <div class="item-bottom">
        <span class="price-tag">${formatBRL(prod.price)}</span>
        <button type="button" class="btn-primary btn-xs add-product-btn" data-id="${prod.id}">
          + Adicionar
        </button>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll(".add-product-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      addToCart(btn.dataset.id);
      showToast("Produto adicionado ao pedido.");
    });
  });
}

function addToCart(productId) {
  const existing = state.cart.find((item) => item.productId === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({ productId, qty: 1 });
  }
  renderCart();
  updateSummary();
}

function changeCartQty(productId, delta) {
  const idx = state.cart.findIndex((item) => item.productId === productId);
  if (idx === -1) return;
  state.cart[idx].qty += delta;
  if (state.cart[idx].qty <= 0) {
    state.cart.splice(idx, 1);
  }
  renderCart();
  updateSummary();
}

function renderCart() {
  const totalQty = state.cart.reduce((acc, item) => acc + item.qty, 0);
  document.getElementById("cart-badge").textContent = totalQty;
  document.getElementById("cart-subtotal").textContent = formatBRL(getCartSubtotal());

  const list = document.getElementById("cart-items-list");
  if (state.cart.length === 0) {
    list.innerHTML = `<p class="muted">Seu carrinho está vazio. Adicione produtos da loja para incluir no seu pedido.</p>`;
    return;
  }

  list.innerHTML = state.cart.map((entry) => {
    const prod = PRODUCTS.find((p) => p.id === entry.productId);
    if (!prod) return "";
    return `
      <div class="cart-row">
        <div>
          <strong>${prod.name}</strong>
          <div class="muted">${formatBRL(prod.price * entry.qty)}</div>
        </div>
        <div class="qty-controls">
          <button type="button" class="qty-btn" data-action="dec" data-id="${prod.id}">-</button>
          <span class="mono">${entry.qty}</span>
          <button type="button" class="qty-btn" data-action="inc" data-id="${prod.id}">+</button>
        </div>
      </div>
    `;
  }).join("");

  list.querySelectorAll(".qty-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const delta = btn.dataset.action === "inc" ? 1 : -1;
      changeCartQty(btn.dataset.id, delta);
    });
  });
}

function renderBarbers() {
  const grid = document.getElementById("barbers-grid");
  grid.innerHTML = BARBERS.map((b) => `
    <button type="button" class="barber-btn ${state.selectedBarberId === b.id ? "active" : ""}" data-id="${b.id}">
      <strong>${b.name}</strong>
      <span>${b.role}</span>
    </button>
  `).join("");

  grid.querySelectorAll(".barber-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.selectedBarberId = btn.dataset.id;
      renderBarbers();
      renderTimeSlots();
      updateSummary();
    });
  });
}

function renderTimeSlots() {
  const barber = BARBERS.find((b) => b.id === state.selectedBarberId) || BARBERS[0];
  const grid = document.getElementById("times-grid");
  const quickGrid = document.getElementById("quick-slots");

  const availableSlots = TIME_SLOTS.filter((slot) => !isSlotBooked(barber.name, state.selectedDate, slot));
  if (availableSlots.length > 0 && !availableSlots.includes(state.selectedTime)) {
    state.selectedTime = availableSlots[0];
  }

  grid.innerHTML = TIME_SLOTS.map((slot) => {
    const booked = isSlotBooked(barber.name, state.selectedDate, slot);
    const active = state.selectedTime === slot && !booked;
    return `
      <button type="button" class="time-btn ${active ? "active" : ""}" data-time="${slot}" ${booked ? "disabled" : ""}>
        ${slot}
      </button>
    `;
  }).join("");

  grid.querySelectorAll(".time-btn:not(:disabled)").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.selectedTime = btn.dataset.time;
      renderTimeSlots();
      updateSummary();
    });
  });

  quickGrid.innerHTML = TIME_SLOTS.slice(0, 6).map((slot) => {
    const booked = isSlotBooked(barber.name, state.selectedDate, slot);
    return `
      <button type="button" class="quick-slot-btn" data-time="${slot}" ${booked ? "disabled" : ""}>
        ${slot}
      </button>
    `;
  }).join("");

  quickGrid.querySelectorAll(".quick-slot-btn:not(:disabled)").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.selectedTime = btn.dataset.time;
      renderTimeSlots();
      updateSummary();
      document.getElementById("agendar").scrollIntoView({ behavior: "smooth" });
    });
  });
}

function renderPixQr() {
  const svg = document.getElementById("pix-qr-svg");
  const totalText = getOrderTotal().toFixed(2);
  let seed = 0;
  for (let i = 0; i < totalText.length; i += 1) {
    seed += totalText.charCodeAt(i) * (i + 3);
  }

  const cells = 15;
  const size = 6;
  let rects = "";

  for (let r = 0; r < cells; r += 1) {
    for (let c = 0; c < cells; c += 1) {
      const inFinder =
        (r < 3 && c < 3) ||
        (r < 3 && c >= cells - 3) ||
        (r >= cells - 3 && c < 3);
      const val = ((r * 17 + c * 31 + seed) % 7) < 3;
      if (inFinder || val) {
        rects += `<rect x="${c * size + 15}" y="${r * size + 15}" width="${size}" height="${size}" fill="#05080f" />`;
      }
    }
  }

  svg.innerHTML = `
    <rect width="120" height="120" rx="8" fill="#ffffff" />
    ${rects}
  `;
}

function updateSummary() {
  const srvList = document.getElementById("summary-services");
  if (state.selectedServiceIds.length === 0) {
    srvList.innerHTML = `<li class="summary-item"><span>Nenhum serviço selecionado</span><span>R$ 0,00</span></li>`;
  } else {
    srvList.innerHTML = state.selectedServiceIds.map((id) => {
      const srv = SERVICES.find((s) => s.id === id);
      if (!srv) return "";
      return `<li class="summary-item"><span>${srv.name}</span><strong>${formatBRL(srv.price)}</strong></li>`;
    }).join("");
  }

  const cartList = document.getElementById("summary-cart");
  if (state.cart.length === 0) {
    cartList.innerHTML = `<li class="summary-item"><span>Nenhum produto no carrinho</span><span>R$ 0,00</span></li>`;
  } else {
    cartList.innerHTML = state.cart.map((entry) => {
      const prod = PRODUCTS.find((p) => p.id === entry.productId);
      if (!prod) return "";
      return `<li class="summary-item"><span>${prod.name} (x${entry.qty})</span><strong>${formatBRL(prod.price * entry.qty)}</strong></li>`;
    }).join("");
  }

  const barber = BARBERS.find((b) => b.id === state.selectedBarberId) || BARBERS[0];
  document.getElementById("summary-barber").textContent = barber.name;
  document.getElementById("summary-datetime").textContent = `${formatDateBR(state.selectedDate)} • ${state.selectedTime}`;
  document.getElementById("summary-duration").textContent = `${getTotalDuration()} min`;
  document.getElementById("summary-payment").textContent = PAYMENT_LABELS[state.paymentMethod];
  document.getElementById("summary-total").textContent = formatBRL(getOrderTotal());

  renderPixQr();
}

function setPaymentMethod(method) {
  state.paymentMethod = method;

  document.querySelectorAll(".pay-tab").forEach((tab) => {
    const active = tab.dataset.method === method;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });

  document.getElementById("pay-panel-pix").classList.toggle("active", method === "pix");
  document.getElementById("pay-panel-card").classList.toggle("active", method === "credit" || method === "debit");
  document.getElementById("pay-panel-local").classList.toggle("active", method === "local");

  const installmentsWrap = document.getElementById("installments-wrap");
  const brandLabel = document.getElementById("card-brand-label");

  if (method === "credit") {
    installmentsWrap.style.display = "flex";
    brandLabel.textContent = "CRÉDITO • PARCELAMENTO ATÉ 3X";
  } else if (method === "debit") {
    installmentsWrap.style.display = "none";
    brandLabel.textContent = "DÉBITO • À VISTA";
  }

  updateSummary();
}

function setupCardPreview() {
  const numInput = document.getElementById("card-number");
  const holderInput = document.getElementById("card-holder");
  const expiryInput = document.getElementById("card-expiry");
  const cvvInput = document.getElementById("card-cvv");
  const virtualCard = document.getElementById("virtual-card");

  numInput.addEventListener("input", () => {
    const digits = numInput.value.replace(/\D/g, "").slice(0, 16);
    const grouped = digits.replace(/(.{4})/g, "$1 ").trim();
    numInput.value = grouped;
    document.getElementById("card-number-display").textContent =
      grouped || "•••• •••• •••• ••••";
  });

  holderInput.addEventListener("input", () => {
    document.getElementById("card-holder-display").textContent =
      holderInput.value.trim() || "NOME DO CLIENTE";
  });

  expiryInput.addEventListener("input", () => {
    let digits = expiryInput.value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) {
      digits = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    expiryInput.value = digits;
    document.getElementById("card-expiry-display").textContent = digits || "MM/AA";
  });

  cvvInput.addEventListener("focus", () => {
    virtualCard.classList.add("flipped");
  });

  cvvInput.addEventListener("blur", () => {
    virtualCard.classList.remove("flipped");
  });

  cvvInput.addEventListener("input", () => {
    const digits = cvvInput.value.replace(/\D/g, "").slice(0, 4);
    cvvInput.value = digits;
    document.getElementById("card-cvv-display").textContent = digits || "•••";
  });
}

function buildWhatsappReceiptUrl(booking) {
  const itemsText = [
    ...booking.services.map((s) => `• ${s}`),
    ...booking.cartItems.map((c) => `• ${c}`)
  ].join("\n");

  const text =
    `Olá *BarberPrime*! Segue meu comprovante de agendamento:\n` +
    `Código: *${booking.id}*\n` +
    `Cliente: ${booking.clientName} (${booking.clientPhone})\n` +
    `Barbeiro: ${booking.barberName}\n` +
    `Data/Hora: ${formatDateBR(booking.date)} às ${booking.time}\n` +
    `Itens:\n${itemsText || "• Atendimento"}\n` +
    `Pagamento: ${booking.paymentLabel} (${booking.installments})\n` +
    `Total: *${formatBRL(booking.total)}*`;

  return `https://wa.me/${BARBERSHOP_WHATSAPP}?text=${encodeURIComponent(text)}`;
}

function renderReceipt(booking) {
  const box = document.getElementById("receipt-box");
  const waUrl = buildWhatsappReceiptUrl(booking);

  box.classList.remove("hidden");
  box.innerHTML = `
    <h4>Reserva Confirmada • ${booking.id}</h4>
    <p>
      <strong>${booking.clientName}</strong> com <strong>${booking.barberName}</strong> em
      <strong>${formatDateBR(booking.date)} às ${booking.time}</strong> (${booking.paymentLabel} — ${formatBRL(booking.total)}).
    </p>
    <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary btn-sm btn-block">
      Enviar Comprovante no WhatsApp
    </a>
  `;
}

function renderDashboard() {
  const activeBookings = state.bookings.filter((b) => b.status !== "Cancelado");
  const revenue = activeBookings.reduce((sum, b) => sum + b.total, 0);
  const ticket = activeBookings.length ? revenue / activeBookings.length : 0;
  const onlineCount = activeBookings.filter(
    (b) => b.paymentMethod === "pix" || b.paymentMethod === "credit" || b.paymentMethod === "debit"
  ).length;

  document.getElementById("kpi-revenue").textContent = formatBRL(revenue);
  document.getElementById("kpi-bookings").textContent = String(activeBookings.length);
  document.getElementById("kpi-ticket").textContent = formatBRL(ticket);
  document.getElementById("kpi-online").textContent = String(onlineCount);

  const filtered = state.bookings.filter((b) =>
    state.statusFilter === "all" ? true : b.status === state.statusFilter
  );

  const tbody = document.getElementById("bookings-tbody");
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="muted">Nenhum registro encontrado para este filtro.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((b) => {
    const combined = [...b.services, ...b.cartItems].join(", ") || "—";
    const waUrl = buildWhatsappReceiptUrl(b);
    return `
      <tr>
        <td class="mono"><strong>${b.id}</strong></td>
        <td>
          <div><strong>${b.clientName}</strong></div>
          <small class="muted">${b.clientPhone}</small>
        </td>
        <td>${combined}</td>
        <td>
          <div>${b.barberName}</div>
          <small class="muted mono">${formatDateBR(b.date)} • ${b.time}</small>
        </td>
        <td>
          <div>${b.paymentLabel}</div>
          <small class="muted">${b.installments}</small>
        </td>
        <td><strong class="price-tag">${formatBRL(b.total)}</strong></td>
        <td><span class="status-badge status-${b.status}">${b.status}</span></td>
        <td>
          <div class="action-btns">
            <button type="button" class="mini-action status-action" data-id="${b.id}" data-status="Concluído">Concluir</button>
            <button type="button" class="mini-action status-action" data-id="${b.id}" data-status="Cancelado">Cancelar</button>
            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="mini-action">WhatsApp</a>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  tbody.querySelectorAll(".status-action").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const newStatus = btn.dataset.status;
      const target = state.bookings.find((item) => item.id === id);
      if (target) {
        target.status = newStatus;
        saveBookings();
        renderTimeSlots();
        renderDashboard();
        showToast(`Pedido ${id} marcado como ${newStatus}.`);
      }
    });
  });
}

function setupEvents() {
  const dateInput = document.getElementById("booking-date");
  dateInput.min = getTodayISO();
  dateInput.value = state.selectedDate;
  dateInput.addEventListener("change", () => {
    if (dateInput.value) {
      state.selectedDate = dateInput.value;
      renderTimeSlots();
      updateSummary();
    }
  });

  document.querySelectorAll(".pay-tab").forEach((tab) => {
    tab.addEventListener("click", () => setPaymentMethod(tab.dataset.method));
  });

  document.getElementById("copy-pix-btn").addEventListener("click", async () => {
    const pixCode = document.getElementById("pix-code").textContent;
    try {
      await navigator.clipboard.writeText(pixCode);
    } catch {
      // Fallback silencioso
    }
    showToast("Código PIX copiado!");
  });

  document.getElementById("clear-cart-btn").addEventListener("click", () => {
    state.cart = [];
    renderCart();
    updateSummary();
    showToast("Carrinho limpo.");
  });

  const drawer = document.getElementById("cart-drawer");
  document.getElementById("open-cart-btn").addEventListener("click", () => drawer.classList.remove("hidden"));
  document.getElementById("close-cart-btn").addEventListener("click", () => drawer.classList.add("hidden"));
  document.getElementById("cart-backdrop").addEventListener("click", () => drawer.classList.add("hidden"));
  document.getElementById("go-to-checkout-btn").addEventListener("click", () => drawer.classList.add("hidden"));

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.statusFilter = btn.dataset.filter;
      renderDashboard();
    });
  });

  document.getElementById("booking-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const nameInput = document.getElementById("client-name");
    const phoneInput = document.getElementById("client-phone");
    const notesInput = document.getElementById("client-notes");

    const clientName = nameInput.value.trim();
    const clientPhone = phoneInput.value.trim();

    if (!clientName || !clientPhone) {
      showToast("Preencha seu nome e WhatsApp para confirmar.");
      return;
    }

    if (state.selectedServiceIds.length === 0 && state.cart.length === 0) {
      showToast("Selecione pelo menos um serviço ou produto.");
      return;
    }

    const barber = BARBERS.find((b) => b.id === state.selectedBarberId) || BARBERS[0];
    if (state.selectedServiceIds.length > 0 && isSlotBooked(barber.name, state.selectedDate, state.selectedTime)) {
      showToast("Esse horário acabou de ser reservado. Escolha outro.");
      renderTimeSlots();
      return;
    }

    if (state.paymentMethod === "credit" || state.paymentMethod === "debit") {
      const cardNum = document.getElementById("card-number").value.replace(/\D/g, "");
      const cardExp = document.getElementById("card-expiry").value.trim();
      const cardCvv = document.getElementById("card-cvv").value.trim();
      if (cardNum.length < 12 || cardExp.length < 4 || cardCvv.length < 3) {
        showToast("Preencha os dados do cartão para continuar.");
        return;
      }
    }

    const serviceNames = state.selectedServiceIds
      .map((id) => SERVICES.find((s) => s.id === id)?.name)
      .filter(Boolean);

    const cartLabels = state.cart
      .map((entry) => {
        const prod = PRODUCTS.find((p) => p.id === entry.productId);
        return prod ? `${prod.name} (x${entry.qty})` : null;
      })
      .filter(Boolean);

    const installments =
      state.paymentMethod === "credit"
        ? `${document.getElementById("card-installments").value}x`
        : "À vista";

    const newBooking = {
      id: `BP-${Math.floor(1050 + Math.random() * 8900)}`,
      clientName,
      clientPhone,
      notes: notesInput.value.trim(),
      services: serviceNames,
      cartItems: cartLabels,
      barberName: barber.name,
      date: state.selectedDate,
      time: state.selectedTime,
      duration: getTotalDuration(),
      paymentMethod: state.paymentMethod,
      paymentLabel: PAYMENT_LABELS[state.paymentMethod],
      installments,
      total: getOrderTotal(),
      status: "Confirmado"
    };

    state.bookings.unshift(newBooking);
    saveBookings();

    state.cart = [];
    renderCart();
    renderTimeSlots();
    updateSummary();
    renderDashboard();
    renderReceipt(newBooking);

    showToast(`Agendamento ${newBooking.id} confirmado!`);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadBookings();
  renderServices();
  renderProducts();
  renderCart();
  renderBarbers();
  renderTimeSlots();
  setupCardPreview();
  setupEvents();
  updateSummary();
  renderDashboard();
});