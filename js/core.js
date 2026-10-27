'use strict';
// Ortak yardımcılar: tüm script'ler bunları kullanır (ES module yok, dosya çift tıklayınca da açılsın diye)
const $ = s => document.querySelector(s);
const P = new URLSearchParams(location.search);
const TEST = P.has('test'); // deterministik: zar yok, kısa animasyon, sağlık kaybı yok, yan sorun yok (spec.md "Test kancaları")
if (TEST) document.documentElement.classList.add('test');

const show = id => document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));

function load(key) { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; } }
function save(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }

// tek seferde bir pencere; gelen çağrı açık bir pencerenin arkasında sıraya girer
const modalQueue = []; let modalOpen = false, dismissable = false, timerId;
function openModal(html, mount, canDismiss = false) {
  if (modalOpen) return modalQueue.push([html, mount, canDismiss]);
  modalOpen = true; dismissable = canDismiss;
  $('#sheet').innerHTML = html; $('#modal').classList.remove('hidden');
  mount && mount($('#sheet'));
}
function closeModal() {
  modalOpen = false; clearInterval(timerId);
  $('#modal').classList.add('hidden');
  const n = modalQueue.shift(); if (n) openModal(...n);
}
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal' && dismissable) closeModal(); });
