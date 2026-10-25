const defaultModel = {
  basePrice: 8350,
  baseWidth: 1300,
  baseHeight: 1400,
  sizeSlope: 0.18,
  minimumSizeFactor: 0.82,
  maximumSizeFactor: 1.55,
  countFactors: {2:1,4:2.35,7:4.1,10:5.7},
  serviceCounts: {2:1,4:3,7:5.5,10:7.5},
  placeFactors: {apartment:1,house:1.05,cottage:0.95,other:1.04},
  installation: 3150,
  delivery: 1750,
  dismantling: 1100,
  wasteRemoval: 850,
};

export function calculateEstimate(values, overrides = {}) {
  const model={...defaultModel,...overrides};
  const count=Number(values.get('windows_count'))||1;
  const width=Number(values.get('window_width'))||model.baseWidth;
  const height=Number(values.get('window_height'))||model.baseHeight;
  const areaRatio=width*height/(model.baseWidth*model.baseHeight);
  const sizeFactor=Math.min(model.maximumSizeFactor,Math.max(model.minimumSizeFactor,1+(areaRatio-1)*model.sizeSlope));
  const countFactor=model.countFactors[count]||1;
  const serviceCount=model.serviceCounts[count]||1;
  const placeFactor=model.placeFactors[values.get('installation_place')]||1;
  let price=model.basePrice*countFactor*sizeFactor*placeFactor;
  if(values.get('installation')==='yes')price+=model.installation*serviceCount;
  if(values.get('delivery')==='yes')price+=model.delivery;
  if(values.get('dismantling')==='yes')price+=model.dismantling*serviceCount;
  if(values.get('waste_removal')==='yes')price+=model.wasteRemoval;
  return Math.round(price/50)*50;
}

export function initCalculators(submitLeadForm) {
  document.querySelectorAll('.home-lead-form').forEach(form=>{
    if(form.dataset.calculatorReady)return;
    form.dataset.calculatorReady='true';
    const status=form.querySelector('.home-form-status');
    const price=form.querySelector('.home-calculator__price');
    const configElement=form.closest('[data-component="calculator"]')?.querySelector('[data-calculator-model]');
    const model=configElement?JSON.parse(configElement.textContent):{};
    const update=()=>{
      if(!price)return;
      form.querySelectorAll('.home-calc-sizes input[type="range"]').forEach(range=>{
        const progress=(Number(range.value)-Number(range.min))/(Number(range.max)-Number(range.min))*100;
        range.style.setProperty('--range-progress',`${progress}%`);
        const output=range.closest('label')?.querySelector('output');
        if(output)output.textContent=`${range.value} мм`;
      });
      const total=calculateEstimate(new FormData(form),model);
      const format=new Intl.NumberFormat('ru-RU');
      price.textContent=`от ${format.format(total)} ₽`;
      const installment=form.querySelector('[data-calculator-installment] .card-installment__amount');
      if(installment)installment.textContent=`от ${format.format(Math.ceil(total/36))} ₽/мес.`;
    };
    form.addEventListener('input',update);
    update();
    form.addEventListener('submit',async event=>{
      event.preventDefault();if(!form.reportValidity())return;
      const button=form.querySelector('button[type="submit"]');
      if(button?.disabled)return;if(button)button.disabled=true;
      try{
        await submitLeadForm(form,price?'home-window-calculator':'page-consultation');
        if(status)status.textContent='Спасибо! Мы перезвоним и уточним размеры для расчёта.';
        form.reset();update();
      }catch(error){if(status)status.textContent=error.message||'Не удалось отправить заявку. Позвоните нам.';}
      finally{if(button)button.disabled=false;}
    });
  });
}
