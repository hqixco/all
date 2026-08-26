export function initDragScroll() {
  document.querySelectorAll('[data-drag-scroll]').forEach((track) => {
    if (!(track instanceof HTMLElement)) return;

    let isPointerDown = false;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartOffset = 0;
    let currentOffset = 0;
    let targetOffset = 0;
    let animationFrameId = 0;
    let dragPointerId = null;
    let suppressClick = false;
    const viewport = track.parentElement;

    if (!(viewport instanceof HTMLElement) || track.scrollWidth <= viewport.clientWidth) {
      return;
    }

    const getBounds = () => {
      const maxOffset = 0;
      const minOffset = viewport instanceof HTMLElement ? Math.min(0, viewport.clientWidth - track.scrollWidth) : 0;
      return { minOffset, maxOffset };
    };

    const stopAnimation = () => {
      if (!animationFrameId) return;
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;
    };

    const tick = () => {
      const delta = targetOffset - currentOffset;
      currentOffset += delta * 0.18;

      if (Math.abs(delta) < 0.5) {
        currentOffset = targetOffset;
        track.style.transform = `translate3d(${currentOffset}px, 0, 0)`;
        animationFrameId = 0;
        return;
      }

      track.style.transform = `translate3d(${currentOffset}px, 0, 0)`;
      animationFrameId = window.requestAnimationFrame(tick);
    };

    const ensureAnimation = () => {
      if (animationFrameId) return;
      animationFrameId = window.requestAnimationFrame(tick);
    };

    const cleanupListeners = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };

    const endDrag = () => {
      isPointerDown = false;
      dragPointerId = null;
      track.classList.remove('is-dragging');
      cleanupListeners();

      if (isDragging) {
        suppressClick = true;
        window.setTimeout(() => {
          suppressClick = false;
        }, 0);
      }

      isDragging = false;
      ensureAnimation();
    };

    const handleMove = (clientX, event) => {
      if (!isPointerDown) return;

      const deltaX = clientX - dragStartX;

      if (!isDragging && Math.abs(deltaX) < 4) return;

      if (!isDragging) {
        isDragging = true;
      }

      event.preventDefault();
      const { minOffset, maxOffset } = getBounds();
      targetOffset = Math.max(minOffset, Math.min(maxOffset, dragStartOffset + deltaX));
      ensureAnimation();
    };

    function onPointerMove(event) {
      if (!isPointerDown || dragPointerId !== event.pointerId) return;
      handleMove(event.clientX, event);
    }

    function onPointerUp(event) {
      if (dragPointerId !== event.pointerId) return;
      endDrag();
    }

    track.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;

      isPointerDown = true;
      isDragging = false;
      dragPointerId = event.pointerId;
      dragStartX = event.clientX;
      dragStartOffset = currentOffset;
      const { minOffset, maxOffset } = getBounds();
      currentOffset = Math.max(minOffset, Math.min(maxOffset, currentOffset));
      targetOffset = currentOffset;
      track.classList.add('is-dragging');
      stopAnimation();

      if (track.setPointerCapture) {
        try {
          track.setPointerCapture(event.pointerId);
        } catch {
          // Ignore capture failures.
        }
      }

      window.addEventListener('pointermove', onPointerMove, { passive: false });
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    });

    track.style.transform = 'translate3d(0, 0, 0)';
    track.addEventListener('dragstart', (event) => {
      event.preventDefault();
    });

    track.addEventListener(
      'click',
      (event) => {
        if (!suppressClick) return;
        event.preventDefault();
        event.stopImmediatePropagation();
      },
      true,
    );
  });
}
