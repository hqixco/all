const fenceQuiz = document.querySelector('.fence-quiz');

if (fenceQuiz) {
  const panels = Array.from(fenceQuiz.querySelectorAll('.fence-quiz-panel'));
  const progress = fenceQuiz.querySelector('.quiz-progress span');
  const stepLabel = fenceQuiz.querySelector('.quiz-step');
  const previous = fenceQuiz.querySelector('.quiz-prev');
  const next = fenceQuiz.querySelector('.quiz-next');
  const status = fenceQuiz.querySelector('.quiz-status');
  let step = 0;
  let autoAdvance;

  fenceQuiz.classList.add('fence-quiz-enhanced');

  const showStep = (index) => {
    clearTimeout(autoAdvance);
    step = index;
    panels.forEach((panel, panelIndex) => { panel.hidden = panelIndex !== step; });
    progress.style.width = `${((step + 1) / panels.length) * 100}%`;
    stepLabel.textContent = step === panels.length - 1 ? 'Заявка' : `Вопрос ${step + 1} из 5`;
    previous.disabled = step === 0;
    next.hidden = step === panels.length - 1;
    fenceQuiz.classList.toggle('is-final-step', step === panels.length - 1);
    status.textContent = '';
  };

  previous.addEventListener('click', () => showStep(step - 1));
  next.addEventListener('click', () => {
    const panel = panels[step];
    const radios = panel.querySelectorAll('input[type="radio"]');
    if (radios.length && !panel.querySelector('input[type="radio"]:checked')) {
      status.textContent = 'Выберите вариант ответа.';
      radios[0].focus();
      return;
    }
    showStep(step + 1);
  });

  fenceQuiz.addEventListener('change', (event) => {
    if (!event.target.matches('input[type="radio"]') || !panels[step].contains(event.target)) return;
    status.textContent = '';
    clearTimeout(autoAdvance);
    if (step === panels.length - 1) return;
    autoAdvance = setTimeout(() => showStep(step + 1), 200);
  });

  showStep(0);
}
