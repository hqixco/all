// Safari 13 supports grid gaps but needs spacing between flex items.
const probe = document.createElement('div');
probe.style.cssText = 'position:absolute;visibility:hidden;display:flex;flex-direction:column;row-gap:1px;';
probe.innerHTML = '<div style="height:1px"></div><div style="height:1px"></div>';
document.body.append(probe);
const supportsFlexGap = probe.scrollHeight === 3;
probe.remove();

if (!supportsFlexGap) {
  const update = root => {
    const elements = root.nodeType === 1 ? [root, ...root.querySelectorAll('*')] : [];
    elements.forEach(element => {
      element.classList.remove('legacy-flex-row', 'legacy-flex-column');
      const style = getComputedStyle(element);
      if (!['flex', 'inline-flex'].includes(style.display)) return;
      const column = style.flexDirection.startsWith('column');
      const gap = column ? style.rowGap : style.columnGap;
      if (!gap || gap === 'normal' || parseFloat(gap) === 0) return;
      element.style.setProperty('--legacy-flex-gap', gap);
      element.classList.add(column ? 'legacy-flex-column' : 'legacy-flex-row');
    });
  };
  update(document.body);
  const observer = new MutationObserver(records => {
    records.forEach(record => record.addedNodes.forEach(update));
  });
  observer.observe(document.body, { childList: true, subtree: true });
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => update(document.body), 100);
  });
}
