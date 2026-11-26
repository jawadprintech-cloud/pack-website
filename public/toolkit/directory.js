const search = document.querySelector('#directory input[type="search"]');
const cards = [...document.querySelectorAll('.card')];
const filters = [...document.querySelectorAll('.filter')];
let group = '-1';
function refresh() {
  const terms = search.value.toLowerCase().trim().split(/\s+/);
  let count = 0;
  for (const card of cards) {
    const matches = (group === '-1' || card.dataset.group === group) && terms.every(term => card.textContent.toLowerCase().includes(term));
    card.hidden = !matches;
    if (matches) count++;
  }
  document.getElementById('total').textContent = count + (count === 1 ? ' tool' : ' tools');
  document.querySelector('.empty').hidden = count > 0;
  for (const btn of filters) btn.setAttribute('aria-pressed', String(btn.dataset.filter === group));
}
filters.forEach(button => button.addEventListener('click', () => {group = button.dataset.filter; refresh();}));
search.addEventListener('input', refresh);
document.querySelector('#reset').addEventListener('click', () => {group = '-1'; search.value = ''; refresh(); search.focus();});
document.addEventListener('keydown', event => {
  if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.target.closest('input,textarea,[contenteditable=true]')) { event.preventDefault(); search.focus(); }
});
