document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-project-card]').forEach((card) => {
    const images = Array.from(card.querySelectorAll('[data-project-slider] img'));
    const prevButton = card.querySelector('.project-card__nav--prev');
    const nextButton = card.querySelector('.project-card__nav--next');
    const dots = Array.from(card.querySelectorAll('.project-card__pagination span'));

    if (!images.length || !prevButton || !nextButton || !dots.length) {
      return;
    }

    let activeIndex = 0;
    const items = images.map((image) => ({
      src: image.getAttribute('src') || image.src,
      alt: image.getAttribute('alt') || '',
    }));

    const render = () => {
      const ordered = [
        items[(activeIndex + 2) % items.length],
        items[activeIndex],
        items[(activeIndex + 1) % items.length],
      ];

      ordered.forEach((source, index) => {
        images[index].src = source.src;
        images[index].alt = source.alt;
      });

      dots.forEach((dot, index) => {
        dot.classList.toggle('is-active', index === activeIndex);
      });
    };

    prevButton.addEventListener('click', () => {
      activeIndex = (activeIndex - 1 + images.length) % images.length;
      render();
    });

    nextButton.addEventListener('click', () => {
      activeIndex = (activeIndex + 1) % images.length;
      render();
    });

    render();
  });

  const processSlider = document.querySelector('[data-process-slider]');

  if (processSlider) {
    const slides = Array.from(processSlider.querySelectorAll('[data-process-slide]'));
    const prevButton = processSlider.querySelector('.process-media__nav--prev');
    const nextButton = processSlider.querySelector('.process-media__nav--next');
    const dots = Array.from(document.querySelectorAll('.process-media__pagination span'));
    const timeLabel = processSlider.querySelector('[data-process-time]');

    if (slides.length > 1 && prevButton && nextButton && dots.length) {
      let activeIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));
      let touchStartX = null;
      let touchStartY = null;
      let activePointerId = null;

      const render = () => {
        slides.forEach((slide, index) => {
          slide.classList.toggle('is-active', index === activeIndex);
        });

        dots.forEach((dot, index) => {
          dot.classList.toggle('is-active', index === activeIndex);
        });

        if (timeLabel) {
          const activeSlide = slides[activeIndex];
          timeLabel.textContent = activeSlide?.dataset.processTime || timeLabel.textContent;
        }
      };

      prevButton.addEventListener('click', () => {
        activeIndex = (activeIndex - 1 + slides.length) % slides.length;
        render();
      });

      nextButton.addEventListener('click', () => {
        activeIndex = (activeIndex + 1) % slides.length;
        render();
      });

      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          activeIndex = index % slides.length;
          render();
        });
      });

      processSlider.addEventListener('pointerdown', (event) => {
        if (event.target.closest('button')) {
          return;
        }

        touchStartX = event.clientX;
        touchStartY = event.clientY;
        activePointerId = event.pointerId;

        try {
          processSlider.setPointerCapture(event.pointerId);
        } catch (error) {
          activePointerId = null;
        }
      });

      processSlider.addEventListener('pointerup', (event) => {
        if (touchStartX === null || touchStartY === null || (activePointerId !== null && event.pointerId !== activePointerId)) {
          return;
        }

        const deltaX = event.clientX - touchStartX;
        const deltaY = event.clientY - touchStartY;

        touchStartX = null;
        touchStartY = null;
        activePointerId = null;

        if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY)) {
          return;
        }

        if (deltaX < 0) {
          activeIndex = (activeIndex + 1) % slides.length;
        } else {
          activeIndex = (activeIndex - 1 + slides.length) % slides.length;
        }

        render();
      });

      processSlider.querySelectorAll('img').forEach((image) => {
        image.addEventListener('dragstart', (event) => {
          event.preventDefault();
        });
      });

      processSlider.addEventListener('pointercancel', () => {
        touchStartX = null;
        touchStartY = null;
        activePointerId = null;
      });

      render();
    }
  }

  const caseLightbox = document.querySelector('[data-case-lightbox]');

  if (caseLightbox instanceof HTMLElement) {
    const caseLightboxImage = caseLightbox.querySelector('[data-case-lightbox-image]');
    const caseLightboxVideo = caseLightbox.querySelector('[data-case-lightbox-video]');
    const caseLightboxPrev = caseLightbox.querySelector('[data-case-lightbox-prev]');
    const caseLightboxNext = caseLightbox.querySelector('[data-case-lightbox-next]');
    const caseLightboxThumbs = caseLightbox.querySelector('[data-case-lightbox-thumbs]');
    const caseLightboxCloseButtons = Array.from(caseLightbox.querySelectorAll('[data-case-lightbox-close]'));
    const body = document.body;
    let caseLightboxLastFocus = null;
    let caseLightboxItems = [];
    let caseLightboxIndex = 0;

    const renderCaseLightbox = () => {
      const item = caseLightboxItems[caseLightboxIndex];

      if (!item) {
        return;
      }

      if (caseLightboxImage instanceof HTMLImageElement) {
        caseLightboxImage.hidden = item.type === 'video';
        if (item.type === 'video') {
          caseLightboxImage.removeAttribute('src');
          caseLightboxImage.alt = '';
        } else {
          caseLightboxImage.hidden = false;
          caseLightboxImage.src = item.src;
          caseLightboxImage.alt = item.alt || '';
        }
      }

      if (caseLightboxVideo instanceof HTMLVideoElement) {
        caseLightboxVideo.hidden = item.type !== 'video';
        caseLightboxVideo.pause();
        if (item.type === 'video') {
          caseLightboxVideo.hidden = false;
          if (item.poster) {
            caseLightboxVideo.poster = item.poster;
          } else {
            caseLightboxVideo.removeAttribute('poster');
          }

          caseLightboxVideo.src = item.src;
          caseLightboxVideo.currentTime = 0;
          caseLightboxVideo.load();
        } else {
          caseLightboxVideo.removeAttribute('src');
          caseLightboxVideo.removeAttribute('poster');
          caseLightboxVideo.load();
        }
      }

      if (caseLightboxThumbs instanceof HTMLElement) {
        caseLightboxThumbs.innerHTML = '';

        caseLightboxItems.forEach((thumbItem, index) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = `case-lightbox__thumb${index === caseLightboxIndex ? ' is-active' : ''}${thumbItem.type === 'video' ? ' case-lightbox__thumb--video' : ''}`;
          button.setAttribute('aria-label', `Медиа ${index + 1}`);

          const image = document.createElement('img');
          image.src = thumbItem.type === 'video' ? thumbItem.poster : thumbItem.src;
          image.alt = thumbItem.alt || '';
          image.loading = 'lazy';
          image.decoding = 'async';
          button.appendChild(image);

          if (thumbItem.type === 'video') {
            const play = document.createElement('span');
            play.className = 'case-lightbox__thumb-play';
            play.setAttribute('aria-hidden', 'true');
            play.innerHTML = '<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path d="M8 6.5v11l9-5.5-9-5.5z" fill="currentColor"></path></svg>';
            button.appendChild(play);
          }

          button.addEventListener('click', () => {
            caseLightboxIndex = index;
            renderCaseLightbox();
          });

          caseLightboxThumbs.appendChild(button);
        });
      }

      if (caseLightboxPrev instanceof HTMLButtonElement) {
        caseLightboxPrev.hidden = caseLightboxItems.length < 2;
      }

      if (caseLightboxNext instanceof HTMLButtonElement) {
        caseLightboxNext.hidden = caseLightboxItems.length < 2;
      }
    };

    const openCaseLightbox = (items, startIndex = 0) => {
      if (!Array.isArray(items) || !items.length) {
        return;
      }

      caseLightboxItems = items.filter((item) => item && item.src);

      if (!caseLightboxItems.length) {
        return;
      }

      caseLightboxIndex = Math.max(0, Math.min(startIndex, caseLightboxItems.length - 1));
      caseLightboxLastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      renderCaseLightbox();

      caseLightbox.hidden = false;
      requestAnimationFrame(() => {
        caseLightbox.classList.add('is-open');
        body.classList.add('is-modal-open');
      });
    };

    const closeCaseLightbox = () => {
      caseLightbox.classList.remove('is-open');
      body.classList.remove('is-modal-open');
      window.setTimeout(() => {
        caseLightbox.hidden = true;
        if (caseLightboxImage instanceof HTMLImageElement) {
          caseLightboxImage.removeAttribute('src');
          caseLightboxImage.alt = '';
          caseLightboxImage.hidden = false;
        }

        if (caseLightboxVideo instanceof HTMLVideoElement) {
          caseLightboxVideo.pause();
          caseLightboxVideo.removeAttribute('src');
          caseLightboxVideo.removeAttribute('poster');
          caseLightboxVideo.load();
          caseLightboxVideo.hidden = true;
        }

        if (caseLightboxThumbs instanceof HTMLElement) {
          caseLightboxThumbs.innerHTML = '';
        }

        caseLightboxItems = [];
        caseLightboxIndex = 0;
      }, 220);

      if (caseLightboxLastFocus) {
        caseLightboxLastFocus.focus();
        caseLightboxLastFocus = null;
      }
    };

    caseLightboxCloseButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        closeCaseLightbox();
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !caseLightbox.hidden) {
        closeCaseLightbox();
        return;
      }

      if (caseLightbox.hidden) {
        return;
      }

      if (event.key === 'ArrowLeft' && caseLightboxItems.length > 1) {
        event.preventDefault();
        caseLightboxIndex = (caseLightboxIndex - 1 + caseLightboxItems.length) % caseLightboxItems.length;
        renderCaseLightbox();
      }

      if (event.key === 'ArrowRight' && caseLightboxItems.length > 1) {
        event.preventDefault();
        caseLightboxIndex = (caseLightboxIndex + 1) % caseLightboxItems.length;
        renderCaseLightbox();
      }
    });

    caseLightbox.addEventListener('click', (event) => {
      if (event.target === caseLightbox) {
        closeCaseLightbox();
      }
    });

    caseLightboxPrev?.addEventListener('click', (event) => {
      event.preventDefault();
      if (caseLightboxItems.length < 2) {
        return;
      }

      caseLightboxIndex = (caseLightboxIndex - 1 + caseLightboxItems.length) % caseLightboxItems.length;
      renderCaseLightbox();
    });

    caseLightboxNext?.addEventListener('click', (event) => {
      event.preventDefault();
      if (caseLightboxItems.length < 2) {
        return;
      }

      caseLightboxIndex = (caseLightboxIndex + 1) % caseLightboxItems.length;
      renderCaseLightbox();
    });

    document.querySelectorAll('[data-case-gallery]').forEach((gallery) => {
      const mainImage = gallery.querySelector('[data-case-main]');
      const prevButton = gallery.querySelector('[data-case-prev]');
      const nextButton = gallery.querySelector('[data-case-next]');
      const zoomButton = gallery.querySelector('[data-case-zoom]');
      const playButton = gallery.querySelector('[data-case-play]');
      const thumbs = Array.from(gallery.querySelectorAll('[data-case-thumb]'));

      if (!(mainImage instanceof HTMLImageElement) || !prevButton || !nextButton || !zoomButton || !thumbs.length) {
        return;
      }

      const items = thumbs.map((thumb) => {
        const image = thumb.querySelector('img');
        const type = thumb.dataset.caseType === 'video' ? 'video' : 'image';

        return {
          type,
          src: type === 'video'
            ? (thumb.dataset.caseVideo || image?.getAttribute('src') || '')
            : (image?.getAttribute('src') || ''),
          poster: thumb.dataset.casePoster || image?.getAttribute('src') || '',
          alt: image?.getAttribute('alt') || '',
        };
      }).filter((item) => item.src);

      if (!items.length) {
        return;
      }

      let activeIndex = 0;

      const render = () => {
        const item = items[activeIndex];
        mainImage.src = item.type === 'video' ? item.poster : item.src;
        mainImage.alt = item.alt;

        if (playButton instanceof HTMLButtonElement) {
          playButton.hidden = item.type !== 'video';
          playButton.dataset.caseVideoSrc = item.src;
          playButton.dataset.caseVideoPoster = item.poster;
          playButton.dataset.caseVideoAlt = item.alt;
        }

        thumbs.forEach((thumb, index) => {
          thumb.classList.toggle('is-active', index === activeIndex);
        });
      };

      const setIndex = (index) => {
        activeIndex = (index + items.length) % items.length;
        render();
      };

      prevButton.addEventListener('click', (event) => {
        event.preventDefault();
        setIndex(activeIndex - 1);
      });

      nextButton.addEventListener('click', (event) => {
        event.preventDefault();
        setIndex(activeIndex + 1);
      });

      thumbs.forEach((thumb, index) => {
        thumb.addEventListener('click', (event) => {
          event.preventDefault();
          setIndex(index);
        });
      });

      zoomButton.addEventListener('click', (event) => {
        event.preventDefault();
        openCaseLightbox(items, activeIndex);
      });

      if (playButton instanceof HTMLButtonElement) {
        playButton.addEventListener('click', (event) => {
          event.preventDefault();
          const item = items[activeIndex];
          if (item.type === 'video') {
            openCaseLightbox(items, activeIndex);
          }
        });
      }

      render();
    });
  }

  document.querySelectorAll('[data-projects-cases-slider]').forEach((slider) => {
    const viewport = slider.querySelector('[data-projects-cases-viewport]');
    const track = slider.querySelector('.projects-cases__track');
    const prevButton = slider.querySelector('[data-projects-cases-prev]');
    const nextButton = slider.querySelector('[data-projects-cases-next]');
    const pagination = slider.querySelector('[data-projects-cases-pagination]');

    if (!(viewport instanceof HTMLElement) || !(track instanceof HTMLElement) || !prevButton || !nextButton) {
      return;
    }

    const cards = Array.from(track.querySelectorAll('.projects-case-card')).filter((card) => card instanceof HTMLElement);
    const dots = [];
    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let startTranslate = 0;
    let currentTranslate = 0;
    let isDragging = false;
    let suppressClick = false;
    let syncFrame = null;
    let slideStep = 0;
    let activeIndex = 0;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const getVisibleCount = () => {
      const width = viewport.clientWidth;

      if (width >= 1200) {
        return 4;
      }

      if (width >= 992) {
        return 3;
      }

      if (width >= 640) {
        return 2;
      }

      return 1;
    };

    const getMaxStartIndex = () => {
      return Math.max(0, cards.length - getVisibleCount());
    };

    const getPaginationCount = () => {
      return Math.max(1, cards.length - getVisibleCount() + 1);
    };

    const getMaxTranslate = () => Math.min(0, viewport.clientWidth - track.scrollWidth);

    const getTranslateForIndex = (index) => {
      const card = cards[index];

      if (!card) {
        return currentTranslate;
      }

      const viewportPaddingLeft = Number.parseFloat(window.getComputedStyle(viewport).paddingLeft || '0') || 0;
      const targetTranslate = viewportPaddingLeft - card.offsetLeft;

      return clamp(targetTranslate, getMaxTranslate(), 0);
    };

    const applyTranslate = (animate = true) => {
      track.style.transition = animate ? 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)' : 'none';
      track.style.transform = `translate3d(${currentTranslate}px, 0, 0)`;
    };

    const updateLayout = () => {
      if (!cards.length) {
        return { stepSize: viewport.clientWidth, gap: 0 };
      }

      const styles = window.getComputedStyle(track);
      const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0;
      const visibleCount = getVisibleCount();
      const cardWidth = visibleCount === 1
        ? Math.max(220, Math.min(340, Math.floor(viewport.clientWidth - 12)))
        : Math.max(
          220,
          Math.floor((viewport.clientWidth - gap * Math.max(0, visibleCount - 1)) / visibleCount),
        );

      track.style.setProperty('--projects-cases-card-width', `${cardWidth}px`);
      slideStep = cardWidth + gap;
      activeIndex = clamp(activeIndex, 0, getMaxStartIndex());
      currentTranslate = clamp(getTranslateForIndex(activeIndex), getMaxTranslate(), 0);
      applyTranslate(false);

      return { stepSize: slideStep, gap };
    };

    const syncVisibleCardHeights = () => {
      cards.forEach((card) => {
        card.style.height = '';
      });

      slider.style.setProperty('--projects-cases-visible-height', '0px');
      viewport.style.setProperty('--projects-cases-viewport-height', '');
      slider.style.setProperty('--projects-cases-nav-top', '50%');
      slider.style.setProperty('--projects-cases-pagination-top', '100%');

      if (!cards.length) {
        return;
      }

      const viewportRect = viewport.getBoundingClientRect();
      const visibleCards = cards.filter((card) => {
        const rect = card.getBoundingClientRect();
        return rect.right > viewportRect.left + 1 && rect.left < viewportRect.right - 1;
      });

      if (!visibleCards.length) {
        return;
      }

      const maxHeight = Math.max(...visibleCards.map((card) => card.getBoundingClientRect().height));
      const viewportHeight = Math.ceil(maxHeight + 28);
      slider.style.setProperty('--projects-cases-visible-height', `${Math.ceil(maxHeight)}px`);
      viewport.style.setProperty('--projects-cases-viewport-height', `${viewportHeight}px`);

      const viewportOffsetTop = viewport.offsetTop;
      const cardTop = viewportOffsetTop + 10;
      slider.style.setProperty('--projects-cases-nav-top', `${Math.round(cardTop + (maxHeight / 2))}px`);
      slider.style.setProperty('--projects-cases-pagination-top', `${Math.round(cardTop + maxHeight + 41)}px`);

      visibleCards.forEach((card) => {
        card.style.height = `${Math.ceil(maxHeight)}px`;
      });
    };

    const setActiveDot = (index) => {
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === index);
        dot.setAttribute('aria-selected', dotIndex === index ? 'true' : 'false');
      });
    };

    const syncPaginationCount = () => {
      if (!(pagination instanceof HTMLElement)) {
        return;
      }

      const dotCount = getPaginationCount();

      if (dots.length === dotCount) {
        return;
      }

      pagination.replaceChildren();
      dots.length = 0;

      for (let index = 0; index < dotCount; index += 1) {
        const dot = document.createElement('button');
        dot.className = 'projects-cases__dot';
        dot.type = 'button';
        dot.setAttribute('aria-label', `Перейти к кейсу ${index + 1}`);
        dot.setAttribute('aria-selected', index === activeIndex ? 'true' : 'false');

        dot.addEventListener('click', () => {
          slideToIndex(index);
        });

        pagination.appendChild(dot);
        dots.push(dot);
      }
    };

    const syncPagination = () => {
      if (!dots.length) {
        return;
      }

      setActiveDot(activeIndex);
    };

    const syncState = () => {
      updateLayout();
      syncPaginationCount();
      syncVisibleCardHeights();
      syncPagination();
    };

    const scheduleStateSync = () => {
      if (syncFrame !== null) {
        return;
      }

      syncFrame = window.requestAnimationFrame(() => {
        syncFrame = null;
        syncState();
      });
    };

    const slideToIndex = (index, animate = true) => {
      if (!cards.length) {
        return;
      }

      const targetIndex = clamp(index, 0, getMaxStartIndex());
      const targetCard = cards[targetIndex];

      if (!targetCard) {
        return;
      }

      activeIndex = targetIndex;
      currentTranslate = getTranslateForIndex(targetIndex);
      applyTranslate(animate);
      syncVisibleCardHeights();
      syncPagination();
    };

    const slideByStep = (direction) => {
      slideToIndex(activeIndex + direction);
    };

    syncState();
    window.addEventListener('resize', scheduleStateSync, { passive: true });

    prevButton.addEventListener('click', () => {
      slideByStep(-1);
    });

    nextButton.addEventListener('click', () => {
      slideByStep(1);
    });

    viewport.addEventListener('pointerdown', (event) => {
      if (!(event.target instanceof Element) || event.button !== 0) {
        return;
      }

      if (event.target.closest('button, a, input, textarea, select, label, video')) {
        return;
      }

      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      startTranslate = currentTranslate;
      isDragging = false;
      suppressClick = false;
      track.style.transition = 'none';
      viewport.classList.add('is-drag-ready');

      try {
        viewport.setPointerCapture(event.pointerId);
      } catch (error) {
        pointerId = null;
      }
    });

    viewport.addEventListener('pointermove', (event) => {
      if (pointerId === null || event.pointerId !== pointerId) {
        return;
      }

      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;

      if (!isDragging) {
        const dragThreshold = isCoarsePointer ? 2 : 6;
        const horizontalDominance = isCoarsePointer ? 0.5 : 1;

        if (Math.abs(deltaX) < dragThreshold || Math.abs(deltaX) < Math.abs(deltaY) * horizontalDominance) {
          return;
        }

        isDragging = true;
        suppressClick = true;
        viewport.classList.add('is-dragging');
      }

      event.preventDefault();
      currentTranslate = clamp(startTranslate + deltaX, getMaxTranslate(), 0);
      applyTranslate(false);
      syncVisibleCardHeights();
    });

    const stopDragging = (event) => {
      if (pointerId === null || (event && event.pointerId !== pointerId)) {
        return;
      }

      viewport.classList.remove('is-dragging', 'is-drag-ready');
      pointerId = null;

      if (isDragging) {
        const positions = Array.from({ length: getMaxStartIndex() + 1 }, (_, index) => getTranslateForIndex(index));
        let targetIndex = 0;
        let closestDistance = Number.POSITIVE_INFINITY;

        positions.forEach((translate, index) => {
          const distance = Math.abs(currentTranslate - translate);
          if (distance < closestDistance) {
            closestDistance = distance;
            targetIndex = index;
          }
        });

        slideToIndex(targetIndex);
      } else {
        applyTranslate(true);
      }

      isDragging = false;

      window.setTimeout(() => {
        suppressClick = false;
      }, 0);
    };

    viewport.addEventListener('pointerup', stopDragging);
    viewport.addEventListener('pointercancel', stopDragging);
    viewport.addEventListener('lostpointercapture', stopDragging);

    viewport.addEventListener('click', (event) => {
      if (!suppressClick) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
    }, true);

    viewport.querySelectorAll('img').forEach((image) => {
      image.addEventListener('dragstart', (event) => {
        event.preventDefault();
      });
      image.addEventListener('load', scheduleStateSync);
    });

    window.addEventListener('load', scheduleStateSync, { once: true });
  });

  const submissionConfig = window.gkOrlinkSubmission || {};
  const submitApplicationRequest = async (formData) => {
    if (!submissionConfig.ajaxUrl) {
      throw new Error('AJAX endpoint is not configured');
    }

    formData.set('action', 'gk_orlink_submit_application');
    formData.set('nonce', submissionConfig.nonce || '');

    const response = await fetch(submissionConfig.ajaxUrl, {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.success) {
      throw new Error(payload?.data?.message || 'Submission failed');
    }

    return payload;
  };

  const callbackModal = document.querySelector('[data-callback-modal]');

  if (callbackModal) {
    const openButtons = Array.from(document.querySelectorAll('[data-callback-open]'));
    const closeButtons = Array.from(callbackModal.querySelectorAll('[data-callback-close]'));
    const callbackForm = callbackModal.querySelector('[data-callback-form]');
    const callbackSuccess = callbackModal.querySelector('[data-callback-success]');
    const callbackName = callbackModal.querySelector('[data-callback-name]');
    const callbackPhone = callbackModal.querySelector('[data-callback-phone]');
    const callbackChannelInputs = Array.from(callbackModal.querySelectorAll('[data-callback-channel]'));
    const callbackSubmit = callbackModal.querySelector('.callback-modal__submit');
    const callbackTitle = callbackModal.querySelector('[data-callback-title]');
    const callbackSubtitle = callbackModal.querySelector('.callback-modal__subtitle');
    const callbackVisual = callbackModal.querySelector('[data-callback-visual]');
    const callbackImage = callbackModal.querySelector('[data-callback-image]');
    const defaultCallbackTitle = callbackTitle?.textContent?.trim() || '';
    const defaultCallbackSubtitle = callbackSubtitle?.textContent?.trim() || '';
    const body = document.body;
    let lastFocusedElement = null;
    let closeTimer = null;

    const setModalContext = (button) => {
      const title = button?.dataset.callbackTitle?.trim() || defaultCallbackTitle;
      const imageSrc = button?.dataset.callbackImage?.trim() || '';
      const imageAlt = button?.dataset.callbackImageAlt?.trim() || title;

      if (callbackTitle) {
        callbackTitle.textContent = title;
        callbackTitle.hidden = false;
      }

      if (callbackSubtitle) {
        callbackSubtitle.hidden = false;
      }

      if (callbackVisual && callbackImage) {
        if (imageSrc) {
          callbackImage.src = imageSrc;
          callbackImage.alt = imageAlt;
          callbackVisual.hidden = false;
        } else {
          callbackVisual.hidden = true;
          callbackImage.removeAttribute('src');
          callbackImage.alt = '';
        }
      }
    };

    const openModal = (button = null) => {
      if (closeTimer) {
        window.clearTimeout(closeTimer);
        closeTimer = null;
      }

      setModalContext(button);
      lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      callbackModal.hidden = false;
      requestAnimationFrame(() => {
        callbackModal.classList.add('is-open');
        body.classList.add('is-modal-open');
        callbackName?.focus();
      });
    };

    const closeModal = () => {
      callbackModal.classList.remove('is-open');
      body.classList.remove('is-modal-open');
      closeTimer = window.setTimeout(() => {
        callbackModal.hidden = true;
        closeTimer = null;
      }, 220);

      callbackForm.hidden = false;
      callbackSuccess.hidden = true;
      if (callbackTitle) {
        callbackTitle.hidden = false;
      }
      if (callbackSubtitle) {
        callbackSubtitle.hidden = false;
        callbackSubtitle.textContent = defaultCallbackSubtitle;
      }
      callbackForm.reset();

      if (lastFocusedElement) {
        lastFocusedElement.focus();
        lastFocusedElement = null;
      }
    };

    openButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        openModal(button);
      });
    });

    closeButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        closeModal();
      });

      if (!(button instanceof HTMLButtonElement)) {
        button.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            closeModal();
          }
        });
      }
    });

    callbackModal.addEventListener('click', (event) => {
      if (event.target === callbackModal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !callbackModal.hidden) {
        closeModal();
      }
    });

    callbackForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const phoneDigits = (callbackPhone.value || '').replace(/\D/g, '');
      const checkedChannel = callbackChannelInputs.find((input) => input instanceof HTMLInputElement && input.checked);
      const channelValue = checkedChannel?.value || '';

      if ((callbackName.value || '').trim().length < 2) {
        callbackName.focus();
        callbackName.setCustomValidity('Р’РІРµРґРёС‚Рµ РёРјСЏ');
        callbackName.reportValidity();
        callbackName.setCustomValidity('');
        return;
      }

      if (phoneDigits.length < 7) {
        callbackPhone.focus();
        callbackPhone.setCustomValidity('Р’РІРµРґРёС‚Рµ РєРѕСЂСЂРµРєС‚РЅС‹Р№ РЅРѕРјРµСЂ С‚РµР»РµС„РѕРЅР°');
        callbackPhone.reportValidity();
        callbackPhone.setCustomValidity('');
        return;
      }

      if (!channelValue) {
        const firstChannel = callbackChannelInputs[0];
        if (firstChannel) {
          firstChannel.focus();
          firstChannel.setCustomValidity('Р’С‹Р±РµСЂРёС‚Рµ СЃРїРѕСЃРѕР± СЃРІСЏР·Рё');
          firstChannel.reportValidity();
          firstChannel.setCustomValidity('');
        }
        return;
      }

      const formData = new FormData(callbackForm);
      formData.set('application_form', 'callback');
      formData.set('application_source', callbackTitle?.textContent?.trim() || 'callback');
      formData.set('application_title', callbackTitle?.textContent?.trim() || defaultCallbackTitle || 'Callback');
      formData.set('application_page_url', window.location.href);
      formData.set('application_page_title', document.title);

      if (callbackImage && !callbackVisual.hidden && callbackImage.src) {
        formData.set('application_context_image', callbackImage.src);
      }

      callbackSubmit.disabled = true;

      try {
        await submitApplicationRequest(formData);
        callbackForm.hidden = true;
        callbackSuccess.hidden = false;
        if (callbackTitle) {
          callbackTitle.hidden = true;
        }
        if (callbackSubtitle) {
          callbackSubtitle.hidden = true;
        }
        callbackSubmit.blur();
      } catch (error) {
        window.console.error(error);
        window.alert('Не удалось отправить заявку. Попробуйте ещё раз.');
      } finally {
        callbackSubmit.disabled = false;
      }
    });
  }

  const quizForm = document.querySelector('[data-quiz-form]');
  const quizConfigNode = document.getElementById('quiz-config');

  if (!quizForm || !quizConfigNode) {
    return;
  }

  let quizSteps = [];

  try {
    quizSteps = JSON.parse(quizConfigNode.textContent || '[]');
  } catch (error) {
    quizSteps = [];
  }

  if (!quizSteps.length) {
    return;
  }

  const quizCard = quizForm.closest('.quiz-card') || quizForm.parentElement;
  const quizStage = quizForm.querySelector('[data-quiz-stage]');
  const quizOptions = quizForm.querySelector('[data-quiz-options]');
  const quizFields = quizForm.querySelector('[data-quiz-fields]');
  const quizQuestionTitle = quizForm.querySelector('[data-quiz-question-title]');
  const quizQuestionSubtitle = quizForm.querySelector('[data-quiz-question-subtitle]');
  const quizHeadline = quizCard?.querySelector('.quiz-card__headline');
  const quizFill = quizCard?.querySelector('[data-quiz-fill]');
  const quizMeta = quizCard?.querySelector('[data-quiz-meta]');
  const quizStepsNodes = Array.from(quizCard?.querySelectorAll('[data-quiz-step]') || []);
  const quizBack = quizForm.querySelector('[data-quiz-back]');
  const quizNext = quizForm.querySelector('[data-quiz-next]');
  const quizNextLabel = quizForm.querySelector('[data-quiz-next-label]');
  const quizSubmit = quizForm.querySelector('[data-quiz-submit]');
  const quizControls = quizForm.querySelector('.quiz-controls');
  const quizPrivacyNote = quizForm.querySelector('[data-quiz-privacy-note]');
  const quizAnswersInput = quizForm.querySelector('[data-quiz-answers]');
  const quizSuccess = quizForm.querySelector('[data-quiz-success]');
  const quizReset = quizForm.querySelector('[data-quiz-reset]');
  const quizPrivacyNoteMarkup = `
    <span class="form-privacy-note__icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="9"></circle>
        <path d="m8.5 12.2 2.5 2.6 4.9-5.3"></path>
      </svg>
    </span>
    <span>Нажимая кнопку, вы соглашаетесь с <a href="/privacy-policy/">политикой конфиденциальности</a></span>
  `;

  const escapeHtml = (value) =>
    String(value || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');

  const state = {
    stepIndex: 0,
    answers: Array.from({ length: quizSteps.length }, () => null),
    contact: {
      name: '',
      phone: '',
      comment: '',
    },
  };

  const clampStepIndex = (value) => Math.max(0, Math.min(quizSteps.length - 1, value));

  const getProgressWidth = () => {
    if (quizSteps.length <= 1) {
      return 0;
    }

    if (state.stepIndex === 0) {
      return 8;
    }

    return (state.stepIndex / (quizSteps.length - 1)) * 100;
  };

  const syncAnswersField = () => {
    const payload = {
      name: state.contact.name || '',
      phone: state.contact.phone || '',
      comment: state.contact.comment || '',
    };

    quizSteps.forEach((step, index) => {
      if (step.type === 'form') {
        return;
      }

      const answerValue = state.answers[index]?.value || '';
      payload[`step_${index + 1}`] = answerValue;

      if (step.type === 'input') {
        payload.location = answerValue;
      }
    });

    quizAnswersInput.value = JSON.stringify(payload);
  };

  const isStepComplete = (stepIndex) => {
    const step = quizSteps[stepIndex];
    const answerValue = state.answers[stepIndex]?.value || '';

    if (!step || step.type === 'form') {
      return true;
    }

    if (step.type === 'input') {
      return Boolean(answerValue.trim().length >= 2);
    }

    return Boolean(answerValue);
  };

  const getLastUnlockedStepIndex = () => {
    let lastUnlockedStepIndex = 0;

    for (let index = 0; index < quizSteps.length - 1; index += 1) {
      if (!isStepComplete(index)) {
        break;
      }

      lastUnlockedStepIndex = index + 1;
    }

    return Math.min(lastUnlockedStepIndex, quizSteps.length - 1);
  };

  const updateButtons = () => {
    const currentStep = quizSteps[state.stepIndex];
    const isFinalStep = currentStep.type === 'form';
    const isLocationStep = currentStep.type === 'input';

    quizBack.disabled = state.stepIndex === 0;
    quizNext.hidden = isFinalStep;
    quizSubmit.hidden = !isFinalStep;
    if (quizPrivacyNote) {
      quizPrivacyNote.hidden = !isFinalStep;
      quizPrivacyNote.innerHTML = isFinalStep ? quizPrivacyNoteMarkup : '';
    }

    if (quizNextLabel) {
      quizNextLabel.textContent = 'Следующий вопрос';
    }

    const canContinue = isLocationStep
      ? Boolean((state.answers[state.stepIndex]?.value || '').trim().length >= 2)
      : isStepComplete(state.stepIndex);

    if (!isFinalStep) {
      quizNext.disabled = !canContinue;
    }
  };

  const updateProgress = () => {
    quizFill.style.width = `${getProgressWidth()}%`;
    quizMeta.textContent = `Вопрос ${state.stepIndex + 1} из ${quizSteps.length}`;

    quizStepsNodes.forEach((node, index) => {
      node.classList.toggle('is-active', index === state.stepIndex);
      node.classList.toggle('is-complete', index < state.stepIndex);
      node.classList.toggle('is-available', index <= getLastUnlockedStepIndex());
      node.setAttribute('aria-current', index === state.stepIndex ? 'step' : 'false');
      node.setAttribute('aria-disabled', index <= getLastUnlockedStepIndex() ? 'false' : 'true');
      node.setAttribute('tabindex', index <= getLastUnlockedStepIndex() ? '0' : '-1');
      node.setAttribute('role', 'button');
    });
  };

  const renderCards = (step) => {
    quizOptions.hidden = false;
    quizFields.hidden = true;
    quizFields.innerHTML = '';
    quizOptions.className = `quiz-options ${step.type === 'cards' ? 'quiz-options--cards' : 'quiz-options--chips'}`;
    const options = Array.isArray(step.options) ? step.options.filter((option) => option && option.label) : [];
    quizOptions.dataset.columns = step.type === 'chips' ? String(Math.min(options.length, 3) || 1) : '3';

    quizOptions.innerHTML = options
      .map((option, index) => {
        const selectedValue = state.answers[state.stepIndex]?.index;
        const selectedClass = selectedValue === index ? ' is-selected' : '';

        if (step.type === 'chips') {
          return `
            <button class="quiz-option quiz-option--chip${selectedClass}" type="button" data-quiz-option="${index}">
              <span class="quiz-option__content">
                <span class="quiz-option__title">${escapeHtml(option.label)}</span>
              </span>
            </button>
          `;
        }

        return `
          <button class="quiz-option${selectedClass}" type="button" data-quiz-option="${index}">
            <span class="quiz-option__image">
              <img src="${escapeHtml(option.image_url)}" alt="${escapeHtml(option.label)}" loading="lazy" decoding="async">
            </span>
            <span class="quiz-option__content">
              <span class="quiz-option__title">${escapeHtml(option.label)}</span>
            </span>
          </button>
        `;
      })
      .join('');
  };

  const clearOptionsPanel = () => {
    quizOptions.hidden = true;
    quizOptions.innerHTML = '';
  };

  const renderInput = (step) => {
    clearOptionsPanel();
    quizFields.hidden = false;
    quizFields.className = 'quiz-fields';

    const currentValue = state.answers[state.stepIndex]?.value || '';

    quizFields.innerHTML = `
      <div class="quiz-fields__grid quiz-fields__grid--single">
        <label class="quiz-field">
          <span class="quiz-field__label">Регион или город</span>
          <input
            class="quiz-field__input"
            type="text"
            name="quiz_location"
            placeholder="${escapeHtml(step.placeholder || '')}"
            value="${escapeHtml(currentValue)}"
            data-quiz-location
          >
        </label>
      </div>
    `;
  };

  const renderRange = (step) => {
    clearOptionsPanel();
    quizFields.hidden = false;
    quizFields.className = 'quiz-fields';

    const min = Number(step.min ?? 0);
    const max = Number(step.max ?? min);
    const rangeStep = Number(step.step ?? 1);
    const unit = step.unit || '';
    const storedAnswer = state.answers[state.stepIndex]?.value;
    const defaultValue = String(step.default_value ?? min);
    const currentValue = String(storedAnswer || defaultValue);

    if (!state.answers[state.stepIndex]) {
      state.answers[state.stepIndex] = {
        value: currentValue,
      };
    }

    quizFields.innerHTML = `
      <div class="quiz-range">
        <div class="quiz-range__head">
          <span class="quiz-range__label">Примерная площадь</span>
          <span class="quiz-range__value" data-quiz-range-value>${escapeHtml(currentValue)} ${escapeHtml(unit)}</span>
        </div>
        <input
          class="quiz-range__input"
          type="range"
          min="${escapeHtml(min)}"
          max="${escapeHtml(max)}"
          step="${escapeHtml(rangeStep)}"
          value="${escapeHtml(currentValue)}"
          data-quiz-range
        >
        <div class="quiz-range__scale" aria-hidden="true">
          <span>${escapeHtml(min)} ${escapeHtml(unit)}</span>
          <span>${escapeHtml(max)} ${escapeHtml(unit)}</span>
        </div>
      </div>
    `;
  };

  const renderForm = () => {
    clearOptionsPanel();
    quizFields.hidden = false;
    quizFields.className = 'quiz-fields quiz-fields--compact';

    const contact = state.contact;

    quizFields.innerHTML = `
      <div class="quiz-fields__grid quiz-fields__grid--single">
        <label class="quiz-field">
          <span class="quiz-field__label">Как к Вам обращаться?</span>
          <input
            class="quiz-field__input"
            type="text"
            name="quiz_name"
            placeholder="Как к вам обращаться?"
            value="${escapeHtml(contact.name)}"
            data-quiz-name
          >
        </label>
        <label class="quiz-field">
          <span class="quiz-field__label">Телефон</span>
          <input
            class="quiz-field__input"
            type="tel"
            name="quiz_phone"
            placeholder="+7 (___) ___-__-__"
            value="${escapeHtml(contact.phone)}"
            data-quiz-phone
            required
          >
        </label>
      </div>
    `;
  };

  const renderStage = () => {
    state.stepIndex = clampStepIndex(state.stepIndex);
    const step = quizSteps[state.stepIndex];
    const isFinalStep = step.type === 'form';

    quizStage.classList.remove('is-transitioning');
    quizControls.classList.toggle('quiz-controls--final', isFinalStep);
    quizQuestionTitle.textContent = step.question;
    quizQuestionSubtitle.textContent = step.subtitle || '';

    if (step.type === 'cards' || step.type === 'chips') {
      renderCards(step);
    } else if (step.type === 'range') {
      renderRange(step);
    } else if (step.type === 'input') {
      renderInput(step);
    } else {
      renderForm();
    }

    updateProgress();
    updateButtons();
    syncAnswersField();
  };

  const showSuccess = () => {
    quizStage.hidden = true;
    quizControls.hidden = true;
    quizProgressToggle(false);
    if (quizHeadline instanceof HTMLElement) {
      quizHeadline.hidden = true;
    }
    if (quizPrivacyNote) {
      quizPrivacyNote.hidden = true;
      quizPrivacyNote.innerHTML = '';
    }
    quizSuccess.hidden = false;
    syncAnswersField();
  };

  const quizProgressToggle = (visible) => {
    const progress = quizCard?.querySelector('[data-quiz-progress]');
    if (progress) {
      progress.hidden = !visible;
    }
  };

  const resetQuiz = () => {
    state.stepIndex = 0;
    state.answers = Array.from({ length: quizSteps.length }, () => null);
    state.contact = {
      name: '',
      phone: '',
      comment: '',
    };

    quizSuccess.hidden = true;
    quizStage.hidden = false;
    quizControls.hidden = false;
    quizProgressToggle(true);
    if (quizHeadline instanceof HTMLElement) {
      quizHeadline.hidden = false;
    }
    if (quizPrivacyNote) {
      quizPrivacyNote.hidden = true;
      quizPrivacyNote.innerHTML = '';
    }

    renderStage(false);
  };

  quizForm.addEventListener('click', (event) => {
    const optionButton = event.target.closest('[data-quiz-option]');

    if (optionButton && quizForm.contains(optionButton)) {
      event.preventDefault();

      const optionIndex = Number(optionButton.getAttribute('data-quiz-option'));
      const currentStep = quizSteps[state.stepIndex];
      const option = currentStep.options[optionIndex];

      if (!option) {
        return;
      }

      state.answers[state.stepIndex] = {
        index: optionIndex,
        value: option.label,
      };

      if ((currentStep.type === 'cards' || currentStep.type === 'chips') && state.stepIndex < quizSteps.length - 1) {
        state.stepIndex = clampStepIndex(state.stepIndex + 1);
        renderStage();
        return;
      }

      renderStage(false);
      return;
    }

    if (event.target.closest('[data-quiz-reset]')) {
      event.preventDefault();
      resetQuiz();
    }
  });

  quizStepsNodes.forEach((node, index) => {
    const openStep = () => {
      if (index > getLastUnlockedStepIndex() || index === state.stepIndex) {
        return;
      }

      state.stepIndex = index;
      renderStage();
    };

    node.addEventListener('click', openStep);
    node.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }

      event.preventDefault();
      openStep();
    });
  });

  quizForm.addEventListener('input', (event) => {
    const target = event.target;

    if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLTextAreaElement)) {
      return;
    }

    if (target.matches('[data-quiz-location]')) {
      state.answers[state.stepIndex] = {
        value: target.value.trim(),
      };
      syncAnswersField();
      updateButtons();
      return;
    }

    if (target.matches('[data-quiz-range]')) {
      state.answers[state.stepIndex] = {
        value: target.value,
      };

      const valueNode = quizForm.querySelector('[data-quiz-range-value]');
      if (valueNode) {
        const currentStep = quizSteps[state.stepIndex];
        valueNode.textContent = `${target.value} ${currentStep.unit || ''}`.trim();
      }

      syncAnswersField();
      updateButtons();
      return;
    }

    if (target.matches('[data-quiz-name]')) {
      state.contact.name = target.value;
      syncAnswersField();
      return;
    }

    if (target.matches('[data-quiz-phone]')) {
      state.contact.phone = target.value;
      syncAnswersField();
      return;
    }

    if (target.matches('[data-quiz-comment]')) {
      state.contact.comment = target.value;
      syncAnswersField();
    }
  });

  quizBack.addEventListener('click', () => {
    if (state.stepIndex === 0) {
      return;
    }

    state.stepIndex = clampStepIndex(state.stepIndex - 1);
    renderStage();
  });

  quizNext.addEventListener('click', () => {
    if (quizNext.disabled || state.stepIndex >= quizSteps.length - 1) {
      return;
    }

    state.stepIndex = clampStepIndex(state.stepIndex + 1);
    renderStage();
  });

  quizForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const phoneDigits = (state.contact.phone || '').replace(/\D/g, '');

    if (phoneDigits.length < 7) {
      const phoneInput = quizForm.querySelector('[data-quiz-phone]');
      if (phoneInput) {
        phoneInput.focus();
        phoneInput.setCustomValidity('Введите корректный номер телефона');
        phoneInput.reportValidity();
        phoneInput.setCustomValidity('');
      }
      return;
    }

    syncAnswersField();
    const formData = new FormData(quizForm);
    formData.set('application_form', 'quiz');
    formData.set('application_source', 'quiz');
    formData.set('application_title', quizHeadline?.textContent?.trim() || 'Quiz');
    formData.set('application_page_url', window.location.href);
    formData.set('application_page_title', document.title);

    quizSubmit.disabled = true;

    try {
      await submitApplicationRequest(formData);
      showSuccess();
    } catch (error) {
      window.console.error(error);
      window.alert('Не удалось отправить заявку. Попробуйте ещё раз.');
    } finally {
      quizSubmit.disabled = false;
    }
  });

  quizReset.addEventListener('click', () => {
    resetQuiz();
  });

  renderStage(false);
});

