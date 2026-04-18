// Draggable "Scene Layers" panel behaviour.
// Host tool fills `#elem-list` (or equivalent) via its own row renderer;
// this module owns drag, show/hide, and toggle-button state only.

export function createLayersPanel({ panelEl, handleEl, closeBtn, toggleBtn, mountEl }) {
  let dragging = false, dragOffX = 0, dragOffY = 0;

  handleEl.addEventListener('mousedown', e => {
    if (e.target === closeBtn) return;
    dragging = true;
    const r = panelEl.getBoundingClientRect();
    dragOffX = e.clientX - r.left;
    dragOffY = e.clientY - r.top;
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const mr = mountEl.getBoundingClientRect();
    let x = e.clientX - mr.left - dragOffX;
    let y = e.clientY - mr.top - dragOffY;
    x = Math.max(0, Math.min(x, mr.width - panelEl.offsetWidth));
    y = Math.max(0, Math.min(y, mr.height - panelEl.offsetHeight));
    panelEl.style.left = x + 'px';
    panelEl.style.top = y + 'px';
    panelEl.style.right = 'auto';
  });

  document.addEventListener('mouseup', () => { dragging = false; });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      panelEl.classList.add('hidden');
      toggleBtn?.classList.remove('active');
    });
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const hidden = panelEl.classList.toggle('hidden');
      toggleBtn.classList.toggle('active', !hidden);
    });
  }

  return {
    show() { panelEl.classList.remove('hidden'); toggleBtn?.classList.add('active'); },
    hide() { panelEl.classList.add('hidden'); toggleBtn?.classList.remove('active'); },
    isHidden() { return panelEl.classList.contains('hidden'); },
  };
}
