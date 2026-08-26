export function initSliders() {
  document.querySelectorAll('[data-slider]').forEach((slider) => {
    const track = slider.querySelector('[data-slider-track]');
    const prevButton = slider.querySelector('[data-slider-prev]');
    const nextButton = slider.querySelector('[data-slider-next]');
    const dotsContainer = slider.querySelector('[data-slider-dots]') || slider.querySelector('.slider__dots');

    if (!(track instanceof HTMLElement)) return;

    const slides = Array.from(
      track.querySelectorAll('[data-slider-slide]'),
    ).filter((slide) => slide instanceof HTMLElement);

    const items = slides.length
      ? slides
      : Array.from(track.children).filter((slide) => slide instanceof HTMLElement);

    if (!items.length) return;

    if (slider.classList.contains('home-hero__slider')) {
      const heroInners = Array.from(slider.querySelectorAll('.home-hero__inner')).filter(
        (inner) => inner instanceof HTMLElement,
      );
      const heroBanner = slider.querySelector('.home-hero__banner');
      let heroUpdateRaf = 0;
      let heroResizeObserver;

      const updateHomeHeroHeight = () => {
        heroUpdateRaf = 0;

        const isCompactHomeHero = window.matchMedia('(max-width: 1199px)').matches;

        if (!isCompactHomeHero || !heroInners.length) {
          slider.style.removeProperty('--home-hero-banner-height');
          return;
        }

        const bannerHeight = Math.max(...heroInners.map((inner) => inner.scrollHeight));

        if (bannerHeight > 0) {
          slider.style.setProperty('--home-hero-banner-height', `${bannerHeight}px`);
        }
      };

      const scheduleHomeHeroHeightUpdate = () => {
        if (heroUpdateRaf) return;

        heroUpdateRaf = window.requestAnimationFrame(updateHomeHeroHeight);
      };

      scheduleHomeHeroHeightUpdate();

      if ('ResizeObserver' in window) {
        heroResizeObserver = new ResizeObserver(scheduleHomeHeroHeightUpdate);
        heroInners.forEach((inner) => heroResizeObserver.observe(inner));
      }

      window.addEventListener('resize', scheduleHomeHeroHeightUpdate);

      if (heroBanner instanceof HTMLElement) {
        const heroImages = Array.from(heroBanner.querySelectorAll('img'));
        heroImages.forEach((image) => {
          if (image.complete) return;
          image.addEventListener('load', scheduleHomeHeroHeightUpdate, { once: true });
          image.addEventListener('error', scheduleHomeHeroHeightUpdate, { once: true });
        });
      }
    }

    let activeIndex = 0;
    let scrollRaf = 0;
    let resizeObserver;
    let isPointerDown = false;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartScrollLeft = 0;
    let dragPointerId = null;
    let suppressClick = false;
    let activeDragMode = null;

    const getCurrentIndex = () => {
      const viewportCenter = track.scrollLeft + track.clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      items.forEach((slide, index) => {
        const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
        const distance = Math.abs(slideCenter - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      return closestIndex;
    };

    const scrollToIndex = (index, behavior = 'smooth') => {
      const targetIndex = Math.max(0, Math.min(items.length - 1, index));
      const targetSlide = items[targetIndex];

      if (!targetSlide) return;

      track.scrollTo({
        left: targetSlide.offsetLeft,
        behavior,
      });
    };

    const renderDots = () => {
      if (!(dotsContainer instanceof HTMLElement)) return;

      dotsContainer.innerHTML = '';

      if (items.length <= 1) {
        dotsContainer.hidden = true;
        return;
      }

      dotsContainer.hidden = false;
      dotsContainer.setAttribute('role', 'tablist');

      items.forEach((slide, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'slider__dot';
        dot.setAttribute('aria-label', `Перейти к слайду ${index + 1}`);
        dot.addEventListener('click', () => scrollToIndex(index));
        dotsContainer.append(dot);
      });
    };

    const updateState = () => {
      activeIndex = getCurrentIndex();

      if (prevButton instanceof HTMLButtonElement) {
        prevButton.disabled = activeIndex === 0;
      }

      if (nextButton instanceof HTMLButtonElement) {
        nextButton.disabled = activeIndex === items.length - 1;
      }

      if (dotsContainer instanceof HTMLElement) {
        Array.from(dotsContainer.children).forEach((dot, index) => {
          if (!(dot instanceof HTMLElement)) return;
          const isActive = index === activeIndex;
          dot.classList.toggle('slider__dot--active', isActive);
          dot.setAttribute('aria-selected', String(isActive));
          dot.tabIndex = isActive ? 0 : -1;
        });
      }
    };

    const scheduleUpdate = () => {
      if (scrollRaf) return;

      scrollRaf = window.requestAnimationFrame(() => {
        scrollRaf = 0;
        updateState();
      });
    };

    const cleanupDragListeners = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    const endDrag = () => {
      isPointerDown = false;
      dragPointerId = null;
      activeDragMode = null;
      track.classList.remove('is-dragging');
      track.style.scrollBehavior = '';

      cleanupDragListeners();

      if (isDragging) {
        suppressClick = true;
        window.setTimeout(() => {
          suppressClick = false;
        }, 0);
      }

      isDragging = false;
    };

    const handleDragMove = (clientX, event) => {
      if (!isPointerDown) return;

      const deltaX = clientX - dragStartX;

      if (!isDragging && Math.abs(deltaX) < 4) return;

      if (!isDragging) {
        isDragging = true;
      }

      event.preventDefault();
      track.scrollLeft = dragStartScrollLeft - deltaX;
      scheduleUpdate();
    };

    function onPointerMove(event) {
      if (!isPointerDown || activeDragMode !== 'pointer' || dragPointerId !== event.pointerId) return;
      handleDragMove(event.clientX, event);
    }

    function onPointerUp(event) {
      if (activeDragMode !== 'pointer' || dragPointerId !== event.pointerId) return;
      endDrag();
    }

    function onMouseMove(event) {
      if (!isPointerDown || activeDragMode !== 'mouse') return;
      handleDragMove(event.clientX, event);
    }

    function onMouseUp() {
      if (activeDragMode !== 'mouse') return;
      endDrag();
    }

    const startDrag = (event, mode) => {
      if (items.length <= 1) return;

      if (mode === 'pointer' && event.button !== 0) return;
      if (mode === 'mouse' && event.button !== 0) return;
      if (mode === 'pointer' && event.pointerType === 'touch') return;

      event.preventDefault();

      isPointerDown = true;
      isDragging = false;
      activeDragMode = mode;
      dragPointerId = mode === 'pointer' ? event.pointerId : null;
      dragStartX = event.clientX;
      dragStartScrollLeft = track.scrollLeft;
      track.classList.add('is-dragging');
      track.style.scrollBehavior = 'auto';

      if (mode === 'pointer' && track.setPointerCapture) {
        try {
          track.setPointerCapture(event.pointerId);
        } catch {
          // Ignore capture failures.
        }
      }

      window.addEventListener('pointermove', onPointerMove, { passive: false });
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
      window.addEventListener('mousemove', onMouseMove, { passive: false });
      window.addEventListener('mouseup', onMouseUp);
    };

    const getStepIndex = (direction) => {
      const currentIndex = getCurrentIndex();
      return currentIndex + direction;
    };

    prevButton?.addEventListener('click', () => {
      scrollToIndex(getStepIndex(-1));
    });

    nextButton?.addEventListener('click', () => {
      scrollToIndex(getStepIndex(1));
    });

    track.addEventListener('pointerdown', (event) => startDrag(event, 'pointer'));
    track.addEventListener('mousedown', (event) => startDrag(event, 'mouse'));
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

    track.addEventListener('scroll', scheduleUpdate, { passive: true });

    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(scheduleUpdate);
      resizeObserver.observe(track);
      items.forEach((slide) => resizeObserver.observe(slide));
    } else {
      window.addEventListener('resize', scheduleUpdate);
    }

    renderDots();
    updateState();
  });
}
