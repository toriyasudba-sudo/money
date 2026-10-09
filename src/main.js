import "./style.css";

const KEY = "mimi-money-data-v1";
const today = () => new Date().toISOString().slice(0, 10);
const defaultData = {
  rate: 300,
  balanceVnd: 0,
  balanceRub: 0,
  transactions: [],
  products: [],
  lastTab: "home"
};
let data;
try { data = { ...defaultData, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; }
catch { data = { ...defaultData }; }

const categories = {
  "Продукты": "🥑", "Дом": "🏡", "Транспорт": "🛵", "Grab": "🚕",
  "Кафе и фо": "🍜", "Здоровье": "🩹", "Спорт": "🧘", "Дети": "🧸",
  "Развлечения": "🎡", "Покупки": "🛍️", "Связь": "📱", "Путешествия": "🌴",
  "Доход": "💖", "Другое": "🌷"
};
const money = n => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Math.round(Number(n) || 0));
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
const persist = () => localStorage.setItem(KEY, JSON.stringify(data));
const vnd = n => `${money(n)} ₫`;
const rub = n => `${money(n)} ₽`;
const fmtDate = d => new Date(`${d}T12:00:00`).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
const spent = () => data.transactions.filter(t => t.kind === "expense" && t.currency === "VND").reduce((s,t)=>s+t.amount,0);
const income = () => data.transactions.filter(t => t.kind === "income" && t.currency === "VND").reduce((s,t)=>s+t.amount,0);
const expenseRub = () => data.transactions.filter(t => t.kind === "expense" && t.currency === "RUB").reduce((s,t)=>s+t.amount,0);
const incomeRub = () => data.transactions.filter(t => t.kind === "income" && t.currency === "RUB").reduce((s,t)=>s+t.amount,0);
const currentVnd = () => data.balanceVnd + income() - spent();
const currentRub = () => data.balanceRub + incomeRub() - expenseRub();
const totalVnd = () => currentVnd() + currentRub()*Number(data.rate || 0);

function saveAndRender() { persist(); render(); }
function toast(message) {
  let el = document.querySelector(".toast");
  if (!el) { el = document.createElement("div"); el.className = "toast"; document.body.append(el); }
  el.textContent = message; el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2200);
}
function addTransaction({kind, title, category, amount, currency, date, note}) {
  data.transactions.unshift({ id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), kind, title, category, amount:Number(amount), currency, date, note:note||"" });
  saveAndRender();
}
function nav(tab) { data.lastTab = tab; saveAndRender(); }
function header() {
  return `<header class="topbar"><div class="brand"><div class="mascot">🐰</div><div><div class="brand-name">мими money <span>♡</span></div><div class="brand-sub">твой денежный дневничок</div></div></div><button class="icon-btn" data-action="manifest" aria-label="Манифестация">✨</button></header>`;
}
function bottomNav(active) {
  return `<nav class="bottom-nav">
    <button class="${active==="home"?"active":""}" data-tab="home"><span>🏠</span>Главная</button>
    <button class="${active==="add"?"active":""}" data-tab="add"><span>➕</span>Запись</button>
    <button class="${active==="history"?"active":""}" data-tab="history"><span>📒</span>История</button>
    <button class="${active==="settings"?"active":""}" data-tab="settings"><span>⚙️</span>Настройки</button>
  </nav>`;
}
function home() {
  const recent = data.transactions.slice(0,4);
  const monthSpent = data.transactions.filter(t => t.kind==="expense" && t.currency==="VND" && t.date?.slice(0,7)===today().slice(0,7)).reduce((s,t)=>s+t.amount,0);
  const byCategory = {};
  data.transactions.filter(t=>t.kind==="expense"&&t.currency==="VND"&&t.date?.slice(0,7)===today().slice(0,7)).forEach(t=>byCategory[t.category]=(byCategory[t.category]||0)+t.amount);
  const top = Object.entries(byCategory).sort((a,b)=>b[1]-a[1]).slice(0,3);
  return `<main class="screen">
    <section class="manifest-card"><div class="sparkle s1">✦</div><div class="manifest-label">твоя денежная мантра на сегодня</div><h2>Деньги любят меня,<br>а я умею с ними дружить 💗</h2><p>Я замечаю свои возможности и выбираю осознанно.</p><button class="pill-btn light" data-action="manifest">повторить мантру ✨</button><span class="sparkle s2">✧</span></section>
    <section class="balance-card"><div class="section-kicker">МОИ ДЕНЬГИ СЕЙЧАС <span>🌸</span></div><div class="big-balance">${vnd(totalVnd())}</div><div class="balance-caption">примерный общий баланс в донгах</div><div class="balance-split"><div><span>💸 Остаток в донгах</span><b>${vnd(currentVnd())}</b></div><div><span>🪙 Остаток в рублях</span><b>${rub(currentRub())}</b></div></div><div class="rate-chip">1 ₽ ≈ ${money(data.rate)} ₫ <button data-tab="settings">изменить</button></div></section>
    <div class="quick-grid"><button class="quick-card pink" data-kind="income"><span>💖</span><b>Получила</b><small>добавить доход</small></button><button class="quick-card lilac" data-kind="expense"><span>🛍️</span><b>Потратила</b><small>записать покупку</small></button></div>
    <section class="stats-row"><div class="stat-card"><span>🌷 Доходы в VND</span><b class="positive">+${vnd(income())}</b></div><div class="stat-card"><span>🍡 Расходы в VND</span><b class="negative">−${vnd(spent())}</b></div></section>
    <section class="section-block"><div class="section-heading"><h3>Недавно записала</h3><button class="text-btn" data-tab="history">всё →</button></div>
      ${recent.length ? `<div class="transaction-list">${recent.map(transactionRow).join("")}</div>` : `<div class="empty-state"><div>🧋</div><b>Тут пока тихо</b><p>Запиши первую покупку — и денежная картина начнёт складываться.</p><button class="pill-btn" data-tab="add">добавить запись ＋</button></div>`}
    </section>
    ${top.length ? `<section class="section-block"><div class="section-heading"><h3>Куда уходят донги</h3><span class="muted">${today().slice(0,7)}</span></div><div class="category-list">${top.map(([c,n])=>`<div class="category-line"><span>${categories[c]||"🌷"} ${esc(c)}</span><b>${vnd(n)}</b><div class="bar"><i style="width:${Math.max(5,n/Math.max(...top.map(x=>x[1]))*100)}%"></i></div></div>`).join("")}</div></section>` : ""}
  </main>`;
}
function transactionRow(t) {
  const sign = t.kind==="income" ? "+" : "−";
  return `<div class="transaction-row"><div class="transaction-icon">${categories[t.category]||"🌷"}</div><div class="transaction-info"><b>${esc(t.title)}</b><small>${esc(t.category)} · ${fmtDate(t.date)}${t.note ? ` · ${esc(t.note)}` : ""}</small></div><div class="transaction-amount ${t.kind==="income"?"positive":"negative"}">${sign}${t.currency==="RUB"?rub(t.amount):vnd(t.amount)}</div><button class="delete-btn" data-delete="${esc(t.id)}" title="Удалить">×</button></div>`;
}
function addScreen(kind="expense") {
  return `<main class="screen"><div class="page-title"><div><span class="eyebrow">маленькие шаги 💕</span><h1>Новая запись</h1></div><div class="title-sticker">🐱</div></div>
    <div class="kind-switch"><button class="${kind==="expense"?"selected":""}" data-kind="expense">🛍️ Расход</button><button class="${kind==="income"?"selected":""}" data-kind="income">💖 Доход</button></div>
    <form id="transaction-form" class="form-card">
      <label>Что это было?<input name="title" placeholder="${kind==="expense"?"Например, картошка, Grab, фо…":"Например, зарплата, перевод…"}" required maxlength="80"></label>
      <div class="two-fields"><label>Сумма<input name="amount" inputmode="decimal" type="number" min="0.01" step="any" placeholder="0" required></label><label>Валюта<select name="currency"><option value="VND">₫ Донги</option><option value="RUB">₽ Рубли</option></select></label></div>
      <label>Категория<select name="category">${Object.entries(categories).filter(([c])=>kind==="income"?c==="Доход"||c==="Другое":c!=="Доход").map(([c,e])=>`<option value="${esc(c)}">${e} ${esc(c)}</option>`).join("")}</select></label>
      <label>Дата<input type="date" name="date" value="${today()}" required></label>
      <label>Заметка <span class="optional">необязательно</span><input name="note" placeholder="магазин Go, на всю семью…"></label>
      <button class="submit-btn" type="submit">${kind==="income"?"Сохранить доход 💗":"Сохранить расход ✨"}</button>
    </form>
    <div class="tip-card">🌱 <span><b>Без идеальности.</b> Просто записывай как есть — ясность важнее контроля.</span></div>
  </main>`;
}
function shoppingScreen() {
  return `<main class="screen"><div class="page-title"><div><span class="eyebrow">чек без математики 🧮</span><h1>Корзинка покупок</h1></div><div class="title-sticker">🛒</div></div>
    <div class="form-card"><p class="muted intro">Добавляй каждый товар отдельно. Сумма за штуку × количество посчитается сама.</p>
      <form id="product-form">
        <label>Что купили?<input name="name" placeholder="Картошка" required maxlength="80"></label>
        <div class="two-fields"><label>Цена за единицу<input name="price" type="number" inputmode="decimal" min="0" step="any" placeholder="15000" required></label><label>Кол-во<input name="qty" type="number" inputmode="decimal" min="0.01" step="any" value="1" required></label></div>
        <div class="two-fields"><label>Единица<select name="unit"><option>кг</option><option>шт.</option><option>уп.</option><option>л</option><option>г</option><option>порц.</option><option>час</option><option>поездка</option></select></label><label>Магазин / место<input name="place" placeholder="Go, рынок, Grab…"></label></div>
        <button class="submit-btn" type="submit">Добавить в корзинку 🧺</button>
      </form>
      <div id="basket-list" class="basket-list">${basketRows()}</div>
      <div class="basket-total"><span>Итого по корзине</span><b>${vnd(data.products.reduce((s,p)=>s+p.price*p.qty,0))}</b></div>
      <button class="pill-btn full" data-action="checkout" ${data.products.length?"":"disabled"}>Записать всё как расход 💸</button>
    </div>
  </main>`;
}
function basketRows() {
  if (!data.products.length) return `<div class="empty-basket">Корзинка ждёт вкусняшки и нужные покупки 🍓</div>`;
  return data.products.map(p=>`<div class="basket-row"><div><b>${esc(p.name)}</b><small>${money(p.price)} ₫ × ${money(p.qty)} ${esc(p.unit)}${p.place?` · ${esc(p.place)}`:""}</small></div><strong>${vnd(p.price*p.qty)}</strong><button class="delete-btn" data-product-delete="${esc(p.id)}">×</button></div>`).join("");
}
function historyScreen() {
  return `<main class="screen"><div class="page-title"><div><span class="eyebrow">всё под рукой 📚</span><h1>Моя история</h1></div><div class="title-sticker">📔</div></div>
    <div class="history-summary"><div><small>Доходы VND</small><b class="positive">+${vnd(income())}</b></div><div><small>Расходы VND</small><b class="negative">−${vnd(spent())}</b></div></div>
    <div class="filter-pills"><button class="selected" data-filter="all">Все</button><button data-filter="expense">Расходы</button><button data-filter="income">Доходы</button></div>
    <div id="history-list" class="transaction-list roomy">${data.transactions.length ? data.transactions.map(transactionRow).join("") : `<div class="empty-state"><div>🐣</div><b>Пока нет записей</b><p>Твои доходы и расходы появятся здесь.</p></div>`}</div>
    <button class="export-btn" data-action="export">Скачать мои данные ⤓</button>
  </main>`;
}
function settingsScreen() {
  return `<main class="screen"><div class="page-title"><div><span class="eyebrow">настроим под тебя 🌸</span><h1>Настройки</h1></div><div class="title-sticker">🎀</div></div>
    <section class="form-card"><h3>💱 Конвертор рублей и донгов</h3><p class="muted">Укажи курс, по которому тебе удобно считать. Это ориентир, не биржевая котировка.</p>
      <label>1 российский рубль = <span class="inline-input"><input id="rate-input" type="number" min="0.01" step="any" value="${esc(data.rate)}"> ₫</span></label>
      <div class="converter-box"><label>Рубли ₽<input id="rub-input" type="number" inputmode="decimal" value="100" min="0" step="any"></label><div class="convert-arrow">⇄</div><label>Донги ₫<input id="vnd-input" type="number" inputmode="decimal" value="${money(100*data.rate)}" min="0" step="any"></label></div>
      <button class="submit-btn" data-action="save-rate">Сохранить курс 💗</button>
    </section>
    <section class="form-card"><h3>💰 Стартовый остаток</h3><p class="muted">Внеси деньги, которые уже есть у вас на руках и на счетах. Потом записывай только новые поступления и траты.</p>
      <label>Донги ₫<input id="start-vnd" type="number" min="0" step="any" value="${esc(data.balanceVnd)}"></label>
      <label>Рубли ₽<input id="start-rub" type="number" min="0" step="any" value="${esc(data.balanceRub)}"></label>
      <button class="submit-btn" data-action="save-balance">Сохранить остаток 🌷</button>
    </section>
    <section class="form-card"><h3>🧸 Твои данные</h3><p class="muted">Данные сохраняются на этом устройстве в браузере. Аккаунт и почта не нужны. Для переноса на другой телефон используй экспорт.</p><button class="export-btn" data-action="export">Экспортировать данные JSON ⤓</button><button class="danger-btn" data-action="reset">Очистить всё</button></section>
  </main>`;
}
function render() {
  const tab = data.lastTab || "home";
  let content = tab==="add" ? addScreen(window.currentKind || "expense") : tab==="history" ? historyScreen() : tab==="settings" ? settingsScreen() : tab==="shopping" ? shoppingScreen() : home();
  document.querySelector("#app").innerHTML = `${header()}${content}${bottomNav(tab)}<button class="float-shop" data-tab="shopping" aria-label="Корзинка покупок">🛒</button>`;
  bind();
}
function bind() {
  document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>nav(b.dataset.tab)));
  document.querySelectorAll("[data-kind]").forEach(b=>b.addEventListener("click",()=>{
    if (b.dataset.kind==="income"||b.dataset.kind==="expense") { window.currentKind=b.dataset.kind; nav("add"); }
  }));
  document.querySelectorAll("[data-delete]").forEach(b=>b.addEventListener("click",()=>{
    data.transactions=data.transactions.filter(t=>t.id!==b.dataset.delete); saveAndRender(); toast("Запись удалена 🌷");
  }));
  document.querySelectorAll("[data-product-delete]").forEach(b=>b.addEventListener("click",()=>{
    data.products=data.products.filter(p=>p.id!==b.dataset.productDelete); saveAndRender();
  }));
  document.querySelectorAll('[data-action="manifest"]').forEach(b=>b.addEventListener("click",()=>{
    const lines=["Деньги любят меня, а я умею с ними дружить 💗","Я достойна финансового спокойствия 🌸","Я замечаю возможности и выбираю осознанно ✨","Мой достаток растёт вместе с моими решениями 🐰"];
    toast(lines[Math.floor(Math.random()*lines.length)]);
  }));
  const tf=document.querySelector("#transaction-form");
  if(tf) tf.addEventListener("submit",e=>{
    e.preventDefault(); const f=new FormData(tf); const amount=Number(f.get("amount"));
    if(!(amount>0)){toast("Сумма должна быть больше нуля 🌷");return;}
    addTransaction({kind:window.currentKind||"expense",title:f.get("title").trim(),category:f.get("category"),amount,currency:f.get("currency"),date:f.get("date"),note:f.get("note").trim()});
    window.currentKind="expense"; toast("Записано! Ты молодец 💖");
  });
  const pf=document.querySelector("#product-form");
  if(pf) pf.addEventListener("submit",e=>{
    e.preventDefault();const f=new FormData(pf);const price=Number(f.get("price")),qty=Number(f.get("qty"));
    if(!(price>=0&&qty>0)){toast("Проверь цену и количество 🌷");return;}
    data.products.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),name:f.get("name").trim(),price,qty,unit:f.get("unit"),place:f.get("place").trim()});
    saveAndRender();toast("Добавлено в корзинку 🧺");
  });
  document.querySelectorAll('[data-action="checkout"]').forEach(b=>b.addEventListener("click",()=>{
    if(!data.products.length)return;
    const total=data.products.reduce((s,p)=>s+p.price*p.qty,0);
    const places=[...new Set(data.products.map(p=>p.place).filter(Boolean))];
    addTransaction({kind:"expense",title:places.length?`Покупки: ${places.join(", ")}`:"Покупки из корзинки",category:"Продукты",amount:total,currency:"VND",date:today(),note:data.products.map(p=>`${p.name} ${p.qty} ${p.unit}`).join("; ")});
    data.products=[];saveAndRender();toast("Корзинка записана в расходы 💸");
  }));
  document.querySelectorAll('[data-action="save-rate"]').forEach(b=>b.addEventListener("click",()=>{
    const val=Number(document.querySelector("#rate-input")?.value);
    if(!(val>0)){toast("Курс должен быть больше нуля");return;}
    data.rate=val;saveAndRender();toast("Курс сохранён 💱");
  }));
  document.querySelectorAll('[data-action="save-balance"]').forEach(b=>b.addEventListener("click",()=>{
    data.balanceVnd=Math.max(0,Number(document.querySelector("#start-vnd")?.value)||0);
    data.balanceRub=Math.max(0,Number(document.querySelector("#start-rub")?.value)||0);
    saveAndRender();toast("Стартовый остаток сохранён 🌷");
  }));
  const ri=document.querySelector("#rub-input"), vi=document.querySelector("#vnd-input"), rateI=document.querySelector("#rate-input");
  if(ri&&vi&&rateI){
    ri.addEventListener("input",()=>{vi.value=String(Math.round((Number(ri.value)||0)*(Number(rateI.value)||0)));});
    vi.addEventListener("input",()=>{ri.value=String(((Number(vi.value)||0)/(Number(rateI.value)||1)).toFixed(2));});
    rateI.addEventListener("input",()=>{vi.value=String(Math.round((Number(ri.value)||0)*(Number(rateI.value)||0)));});
  }
  document.querySelectorAll('[data-action="export"]').forEach(b=>b.addEventListener("click",()=>{
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`mimi-money-${today()}.json`;a.click();URL.revokeObjectURL(url);toast("Экспорт готов ⤓");
  }));
  document.querySelectorAll('[data-action="reset"]').forEach(b=>b.addEventListener("click",()=>{
    if(confirm("Точно очистить все доходы, расходы и настройки? Сначала экспортируй данные, если они нужны.")){data={...defaultData,transactions:[],products:[]};saveAndRender();toast("Начали с чистого листа 🌱");}
  }));
  document.querySelectorAll("[data-filter]").forEach(b=>b.addEventListener("click",()=>{
    document.querySelectorAll("[data-filter]").forEach(x=>x.classList.toggle("selected",x===b));
    const list=document.querySelector("#history-list");if(!list)return;
    const arr=b.dataset.filter==="all"?data.transactions:data.transactions.filter(t=>t.kind===b.dataset.filter);
    list.innerHTML=arr.length?arr.map(transactionRow).join(""):`<div class="empty-state"><div>🌸</div><b>Таких записей пока нет</b></div>`;
    list.querySelectorAll("[data-delete]").forEach(x=>x.addEventListener("click",()=>{data.transactions=data.transactions.filter(t=>t.id!==x.dataset.delete);saveAndRender();}));
  }));
}
if ("serviceWorker" in navigator && import.meta.env.PROD) window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
render();