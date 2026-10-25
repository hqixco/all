export const defaultWallDetails = {
  aerated: [
    [
      "Правильное положение рамы",
      "Рама устанавливается в тепловой контур, ближе к наружной плоскости стены.",
    ],
    [
      "Способ крепления",
      "Крепление на анкерные пластины или рамные дюбели к несущей части стены.",
    ],
    [
      "Устройство монтажного шва",
      "Трёхслойный монтажный шов: пароизоляция внутри, утепление по центру, паропроницаемая лента снаружи.",
    ],
    [
      "Внешняя защита от влаги",
      "ПСУЛ или диффузионная лента защищает шов от осадков и ветра.",
    ],
    [
      "Утепление и опорные элементы",
      "Заполняем шов пеной и устанавливаем опорные колодки под рамой.",
    ],
    [
      "Риски неправильного монтажа",
      "Промерзание, плесень, продувание, разрушение шва и сквозняки.",
    ],
  ],
  frame: [
    [
      "Положение рамы",
      "Рама устанавливается в плоскости утеплённого контура каркасной стены.",
    ],
    [
      "Способ крепления",
      "Используем усиленные монтажные пластины и крепим раму к стойкам каркаса.",
    ],
    [
      "Монтажный шов",
      "Шов защищаем изнутри и снаружи, пустоты заполняем эластичной пеной.",
    ],
    [
      "Защита от влаги",
      "Стыки закрываем лентами, чтобы влага не попадала в утеплитель стены.",
    ],
    [
      "Опорные элементы",
      "Нагрузка передаётся на усиленную нижнюю перемычку и опорные колодки.",
    ],
    [
      "Риски ошибки",
      "Продувание, промерзание откосов и деформация рамы при подвижках каркаса.",
    ],
  ],
  brick: [
    [
      "Положение рамы",
      "Раму ставим с учётом четверти и будущего утепления наружной стены.",
    ],
    [
      "Способ крепления",
      "Используем рамные дюбели с креплением в прочную часть кирпичной кладки.",
    ],
    [
      "Монтажный шов",
      "Формируем трёхслойный шов с утеплением и защитными лентами по периметру.",
    ],
    [
      "Защита от влаги",
      "Наружный слой выпускаем в зону фасада и защищаем от осадков.",
    ],
    [
      "Опорные элементы",
      "Под рамой устанавливаем колодки с распределением нагрузки на кладку.",
    ],
    [
      "Риски ошибки",
      "Трещины в кладке, продувание, промерзание и разрушение пены от влаги.",
    ],
  ],
  wood: [
    [
      "Положение рамы",
      "Оставляем монтажный зазор на усадку и устанавливаем обсадную коробку.",
    ],
    [
      "Способ крепления",
      "Крепим окно к обсаде, не связывая его жёстко с подвижной стеной.",
    ],
    [
      "Монтажный шов",
      "Используем эластичные материалы, которые компенсируют сезонные движения древесины.",
    ],
    [
      "Защита от влаги",
      "Закрываем шов лентами и защищаем примыкание от косого дождя.",
    ],
    [
      "Опорные элементы",
      "Нагрузка передаётся через обсаду и опорные колодки без перекоса рамы.",
    ],
    [
      "Риски ошибки",
      "Заклинивание створок, продувание и повреждение окна при усадке дома.",
    ],
  ],
};


export function initInstallationBlocks() {
 document.querySelectorAll('.installation-section').forEach(section=>{
  const config=section.querySelector('[data-wall-details]');
  const details=config?JSON.parse(config.textContent):defaultWallDetails;
  const diagram=section.querySelector('.installation-diagram img');
  const container=section.querySelector('.installation-details');
  const pointConfig=section.querySelector('[data-wall-points]');
  const wallPoints=pointConfig?JSON.parse(pointConfig.textContent):{};
  section.querySelectorAll('.wall-tab').forEach(tab=>tab.addEventListener('click',()=>{
   section.querySelectorAll('.wall-tab').forEach(item=>item.classList.toggle('is-active',item===tab));
   if(wallPoints[tab.dataset.wallKey])section.querySelectorAll('.installation-points li').forEach((item,index)=>{item.textContent=wallPoints[tab.dataset.wallKey][index];});
   if(diagram){diagram.src=tab.dataset.wallImage;diagram.alt=tab.dataset.wallAlt||'Схема монтажного узла: '+tab.textContent.trim();if(tab.dataset.wallWidth)diagram.width=Number(tab.dataset.wallWidth);if(tab.dataset.wallHeight)diagram.height=Number(tab.dataset.wallHeight);}
   if(container&&details[tab.dataset.wallKey])container.innerHTML=details[tab.dataset.wallKey].map(([title,text])=>'<div><strong>'+title+'</strong><span>'+text+'</span></div>').join('');
  }));
 });
}
