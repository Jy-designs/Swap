/* Swap calculator (hero). Based on swap-calculator.html; markup in index.html, styles in styles.css.
   Two editable amounts, a coin list per side, a flip control, the "Get X" CTA and the price note. */
(function () {
  'use strict';

  /* ================= CONFIG: replace with your price feed ================= */
  // Reference prices in EUR. BTC and ETH match the Figma mock; the rest are placeholders.
  // The list matches the coins shown in "Swap with any of these assets", plus LINK (named in its copy).
  var COINS = [
    { ticker: 'BTC',  name: 'Bitcoin',   price: 80838.038 },
    { ticker: 'ETH',  name: 'Ethereum',  price: 2401.7481 },
    { ticker: 'SOL',  name: 'Solana',    price: 152.4 },
    { ticker: 'XRP',  name: 'XRP',       price: 2.14 },
    { ticker: 'BNB',  name: 'BNB',       price: 905.2 },
    { ticker: 'ADA',  name: 'Cardano',   price: 0.61 },
    { ticker: 'AVAX', name: 'Avalanche', price: 22.35 },
    { ticker: 'DOGE', name: 'Dogecoin',  price: 0.152 },
    { ticker: 'LINK', name: 'Chainlink', price: 14.2 },
    { ticker: 'SUI',  name: 'Sui',       price: 2.48 },
    { ticker: 'TRX',  name: 'TRON',      price: 0.29 },
    { ticker: 'GRT',  name: 'The Graph', price: 0.085 }
  ];
  var LAST_UPDATED = '20 Oct 2026, 10:42 CEST';
  // Coin SVGs exported from Figma: <ICON_BASE><ticker>.svg
  var ICON_BASE = 'assets/coins/';
  /* ======================================================================== */

  var byTicker = {};
  COINS.forEach(function (c) { byTicker[c.ticker] = c; });

  var state = { from: 'BTC', to: 'ETH', amount: '1.2', edited: 'from' };

  var $ = function (id) { return document.getElementById(id); };
  var sides = {
    from: { stat: document.querySelector('[data-side="from"]'), trigger: $('from-trigger'), input: $('from-amount'), list: $('from-list') },
    to:   { stat: document.querySelector('[data-side="to"]'),   trigger: $('to-trigger'),   input: $('to-amount'),   list: $('to-list') }
  };
  if (!sides.from.stat) return;
  var measure = $('measure');

  /* ---------- Icons ---------- */
  function iconMarkup(coin) {
    return '<img src="' + ICON_BASE + coin.ticker.toLowerCase() + '.svg" width="32" height="32" alt="">';
  }

  /* ---------- Numbers ---------- */
  function parse(str) {
    var n = parseFloat(str);
    return isFinite(n) ? n : 0;
  }
  function format(n) {
    if (!isFinite(n) || n <= 0) return '0';
    var decimals = n >= 1000 ? 2 : n >= 1 ? 4 : n >= 0.01 ? 6 : 8;
    var s = n.toFixed(decimals);
    return s.indexOf('.') > -1 ? s.replace(/\.?0+$/, '') : s;
  }
  function sanitise(raw) {
    var s = raw.replace(/,/g, '.').replace(/[^0-9.]/g, '');
    var dot = s.indexOf('.');
    if (dot > -1) s = s.slice(0, dot + 1) + s.slice(dot + 1).replace(/\./g, '');
    if (s.charAt(0) === '.') s = '0' + s;
    return s;
  }
  function euro(n) {
    return '€' + n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: n < 1 ? 4 : 2 });
  }
  function fit(input) {
    measure.textContent = input.value || '0';
    input.style.width = Math.ceil(measure.getBoundingClientRect().width) + 2 + 'px';
  }
  function pop(el) {
    el.classList.remove('amount-pop');
    void el.offsetWidth;
    el.classList.add('amount-pop');
  }

  /* ---------- Render ---------- */
  function compute(animate) {
    var from = byTicker[state.from], to = byTicker[state.to];
    var other = state.edited === 'from' ? 'to' : 'from';
    var amt = parse(state.amount);
    var result = state.edited === 'from' ? amt * from.price / to.price : amt * to.price / from.price;
    var next = format(result);
    if (animate && sides[other].input.value !== next) pop(sides[other].input);
    sides[other].input.value = next;
    fit(sides.from.input);
    fit(sides.to.input);
  }

  function render(animate) {
    ['from', 'to'].forEach(function (side) {
      var coin = byTicker[state[side]], s = sides[side];
      s.stat.querySelector('[data-icon]').innerHTML = iconMarkup(coin);
      s.stat.querySelector('[data-ticker]').textContent = coin.ticker;
      s.trigger.setAttribute('aria-label', (side === 'from' ? 'Crypto you swap: ' : 'Crypto you receive: ') + coin.name + '. Choose another');
      if (state.edited === side && document.activeElement !== s.input) s.input.value = state.amount;
    });
    var from = byTicker[state.from], to = byTicker[state.to];
    $('cta-text').textContent = 'Get ' + to.ticker;
    $('cta-icon').innerHTML = iconMarkup(to);
    $('note').textContent = 'Price: 1 ' + from.ticker + ' = ' + euro(from.price) +
      ' | Estimated amount. Fees are not included. Final price, fees and received amount are confirmed in the app. Last updated: ' + LAST_UPDATED;
    compute(animate);
  }

  /* ---------- Amount editing ---------- */
  ['from', 'to'].forEach(function (side) {
    var input = sides[side].input;
    input.addEventListener('focus', function () { closeAll(); input.select(); });
    input.addEventListener('input', function () {
      var clean = sanitise(input.value);
      if (clean !== input.value) input.value = clean;
      state.edited = side;
      state.amount = clean;
      compute();
    });
    input.addEventListener('blur', function () {
      if (state.edited !== side) return;
      state.amount = format(parse(input.value));
      input.value = state.amount;
      fit(input);
    });
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') input.blur(); });
  });

  /* ---------- Dropdown ---------- */
  function buildList(side) {
    sides[side].list.innerHTML = COINS.map(function (c) {
      return '<li role="option" tabindex="-1" data-ticker="' + c.ticker + '" aria-selected="' + (c.ticker === state[side]) + '">' +
        '<span class="coin-icon">' + iconMarkup(c) + '</span>' +
        '<span class="coin-list__name">' + c.name + '</span>' +
        '<span class="coin-list__ticker">' + c.ticker + '</span>' +
        '<svg class="coin-list__check" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</li>';
    }).join('');
  }
  function open(side) {
    closeAll();
    var s = sides[side];
    buildList(side);
    s.list.hidden = false;
    s.stat.classList.add('is-open');
    s.trigger.setAttribute('aria-expanded', 'true');
    var current = s.list.querySelector('[aria-selected="true"]') || s.list.firstElementChild;
    current.focus({ preventScroll: true });
    s.list.scrollTop = Math.max(0, current.offsetTop - 60);
  }
  function close(side, refocus) {
    var s = sides[side];
    if (s.list.hidden) return;
    s.list.hidden = true;
    s.stat.classList.remove('is-open');
    s.trigger.setAttribute('aria-expanded', 'false');
    if (refocus) s.trigger.focus();
  }
  function closeAll() { close('from'); close('to'); }

  function choose(side, ticker, refocus) {
    var other = side === 'from' ? 'to' : 'from';
    if (ticker === state[other]) state[other] = state[side]; // picking the other side's coin switches them
    state[side] = ticker;
    close(side, refocus !== false);
    render(true);
  }

  ['from', 'to'].forEach(function (side) {
    var s = sides[side];
    s.trigger.addEventListener('click', function () {
      if (s.list.hidden) open(side); else close(side, true);
    });
    s.trigger.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(side); }
    });
    s.list.addEventListener('click', function (e) {
      var li = e.target.closest('li');
      if (li) choose(side, li.dataset.ticker);
    });
    s.list.addEventListener('keydown', function (e) {
      var li = document.activeElement.closest('li');
      if (!li) return;
      var next = null;
      if (e.key === 'ArrowDown') next = li.nextElementSibling || s.list.firstElementChild;
      else if (e.key === 'ArrowUp') next = li.previousElementSibling || s.list.lastElementChild;
      else if (e.key === 'Home') next = s.list.firstElementChild;
      else if (e.key === 'End') next = s.list.lastElementChild;
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(side, li.dataset.ticker); return; }
      else if (e.key === 'Escape') { e.preventDefault(); close(side, true); return; }
      else if (e.key === 'Tab') { close(side); return; }
      else if (e.key.length === 1) {
        var ch = e.key.toLowerCase();
        next = Array.prototype.find.call(s.list.children, function (el) {
          return el !== li && (el.dataset.ticker.toLowerCase().charAt(0) === ch || el.textContent.trim().toLowerCase().charAt(0) === ch);
        });
      }
      if (next) { e.preventDefault(); next.focus(); }
    });
  });

  document.addEventListener('pointerdown', function (e) {
    if (!e.target.closest('.stat')) closeAll();
    else ['from', 'to'].forEach(function (side) { if (!sides[side].stat.contains(e.target)) close(side); });
  });

  /* ---------- Flip ---------- */
  $('flip').addEventListener('click', function () {
    closeAll();
    var swapAmount = sides.from.input.value;
    var t = state.from; state.from = state.to; state.to = t;
    // Keep what the person typed in "You swap" as the amount of the new coin.
    state.edited = 'from';
    state.amount = swapAmount;
    render(true);
  });

  /* ---------- Public hook: the asset chips further down pre-fill the "You receive" coin ---------- */
  window.vengaSwap = {
    has: function (ticker) { return !!byTicker[ticker]; },
    setReceive: function (ticker) {
      if (!byTicker[ticker]) return;
      if (ticker === state.to) { render(true); return; }
      choose('to', ticker, false);
    }
  };

  render();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fit(sides.from.input); fit(sides.to.input); });
})();
