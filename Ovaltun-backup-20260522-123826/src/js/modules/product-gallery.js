export function initProductGallery() {
  document.querySelectorAll('[data-product-gallery]').forEach((gallery) => {
    const thumbs = Array.from(gallery.querySelectorAll('.product-gallery__thumb'));
    const mainImage = gallery.querySelector('[data-product-gallery-main]');
    const thumbsViewport = gallery.querySelector('.product-gallery__thumbs');

    if (!thumbs.length || !(mainImage instanceof HTMLImageElement)) return;

    const setActive = (activeThumb) => {
      thumbs.forEach((thumb) => {
        thumb.classList.toggle('product-gallery__thumb--active', thumb === activeThumb);
      });

      const nextSrc = activeThumb.getAttribute('data-full-src');
      const nextAlt = activeThumb.getAttribute('data-full-alt');

      if (nextSrc) {
        mainImage.src = nextSrc;
      }

      if (nextAlt) {
        mainImage.alt = nextAlt;
      }
    };

    let suppressClick = false;
    let dragState = null;

    const stopDrag = () => {
      dragState = null;
      if (thumbsViewport instanceof HTMLElement) {
        thumbsViewport.classList.remove('is-dragging');
      }
      window.setTimeout(() => {
        suppressClick = false;
      }, 0);
    };

    thumbs.forEach((thumb) => {
      thumb.addEventListener('dragstart', (event) => {
        event.preventDefault();
      });

      thumb.addEventListener('click', (event) => {
        if (suppressClick) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }

        setActive(thumb);
      });
    });

    if (thumbsViewport instanceof HTMLElement) {
      thumbsViewport.addEventListener('mousedown', (event) => {
        if (event.button !== 0) return;
        if (!(event.target instanceof Element)) return;

        const thumb = event.target.closest('.product-gallery__thumb');
        if (!(thumb instanceof HTMLElement)) return;

        dragState = {
          startY: event.clientY,
          startScrollTop: thumbsViewport.scrollTop,
          moved: false,
        };
        thumbsViewport.classList.add('is-dragging');

        const onMouseMove = (moveEvent) => {
          if (!dragState) return;

          const deltaY = moveEvent.clientY - dragState.startY;
          if (Math.abs(deltaY) > 5) {
            dragState.moved = true;
            suppressClick = true;
          }

          if (!dragState.moved) return;

          moveEvent.preventDefault();
          thumbsViewport.scrollTop = dragState.startScrollTop - deltaY;
        };

        const onMouseUp = () => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
          stopDrag();
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });

      thumbsViewport.addEventListener(
        'wheel',
        (event) => {
          const maxScrollTop = thumbsViewport.scrollHeight - thumbsViewport.clientHeight;
          if (maxScrollTop <= 0) return;

          event.preventDefault();
          thumbsViewport.scrollTop = Math.max(
            0,
            Math.min(maxScrollTop, thumbsViewport.scrollTop + event.deltaY),
          );
        },
        { passive: false },
      );
    }

    const activeThumb =
      thumbs.find((thumb) => thumb.classList.contains('product-gallery__thumb--active')) || thumbs[0];
    if (activeThumb) {
      setActive(activeThumb);
    }
  });
}
