const genericProjectImage = '/public-project-06-after.webp';
const project01BeforeImage = '/public-project-01-before.webp';
const project01ProcessImage = '/public-project-01-process.webp';
const project01AfterImage = '/public-project-01-after.webp';
const project02BeforeImage = '/public-project-02-before.webp';
const project02AfterImage = '/public-project-02-after.webp';
const project03BeforeImage = '/public-project-03-before.webp';
const project03ProcessImage = '/public-project-03-process.webp';
const project03AfterImage = '/public-project-03-after.webp';
const project04MainImage = '/public-project-04-main.webp';
const project04BeforeImage = '/public-project-04-before.webp';
const project04ProgressImage = '/public-project-04-progress.webp';
const project04AfterImage = '/public-project-04-after.webp';
const project05BeforeImage = '/public-project-05-before.webp';
const project05ProcessImage = '/public-project-05-process.webp';
const project05AfterImage = '/public-project-05-after.webp';
const project06ProcessImage = '/public-project-06-process.webp';
const project06AfterImage = '/public-project-06-after.webp';
const project07BeforeImage = '/public-project-07-before.webp';
const project07ProcessImage = '/public-project-07-process.webp';
const project07AfterImage = '/public-project-07-after.webp';
const project08ProcessImage = '/public-project-08-process.webp';
const project08AfterImage = '/public-project-08-after.webp';
const project09BeforeImage = '/public-project-09-before.webp';
const project09ProcessImage = '/public-project-09-process.webp';
const project09AfterImage = '/public-project-09-after.webp';

function createImages(prefix) {
  return [
    { src: genericProjectImage, alt: `${prefix}: готовый участок кровли` },
    { src: genericProjectImage, alt: `${prefix}: этап монтажа кровельного покрытия` },
    { src: genericProjectImage, alt: `${prefix}: общий вид кровельных работ` },
  ];
}

export const projects = [
  {
    title: 'Монтаж мягкой кровли на крыше крыльца',
    location: 'Московская область',
    area: '32 м²',
    material: 'Мягкая кровля',
    duration: '4 дня',
    price: 'от 95 тыс. ₽',
    description:
      'Собрали деревянный каркас крыльца, подготовили основание и уложили мягкую кровлю с оформлением карнизов, подшивки и водосточной системы.',
    workList: [
      'Сборка деревянного каркаса крыльца',
      'Подготовка основания под мягкую кровлю',
      'Монтаж гибкой черепицы',
      'Оформление карнизов, подшивки и водостока',
    ],
    images: [
      { src: project01BeforeImage, alt: 'Монтаж мягкой кровли на крыше крыльца: готовая кровля' },
      { src: project01AfterImage, alt: 'Монтаж мягкой кровли на крыше крыльца: работы в процессе' },
      { src: project01ProcessImage, alt: 'Монтаж мягкой кровли на крыше крыльца: деревянный каркас и подшивка' },
    ],
  },
  {
    title: 'Монтаж кровли из профнастила на хозблоке',
    location: 'Истринский район',
    area: '96 м²',
    material: 'Профнастил',
    duration: '3 дня',
    price: 'от 90 тыс. ₽',
    description:
      'Подготовили стропильную систему, смонтировали гидроизоляцию, обрешётку и профнастил с необходимыми доборными элементами.',
    workList: [
      'Подготовка стропильной системы',
      'Монтаж гидроизоляции',
      'Монтаж обрешётки',
      'Укладка профнастила и доборных элементов',
    ],
    images: [
      { src: project02AfterImage, alt: 'Монтаж кровли из профнастила на хозблоке: укладка профнастила на скат' },
      { src: project02BeforeImage, alt: 'Монтаж кровли из профнастила на хозблоке: подготовленное основание перед укладкой покрытия' },
    ],
  },
  {
    title: 'Монтаж мягкой кровли на беседке',
    location: 'Подольск',
    area: '58 м²',
    material: 'Мягкая кровля',
    duration: '5 дней',
    price: 'от 85 тыс. ₽',
    description:
      'Собрали основание кровли, уложили сплошной настил, подкладочный ковёр и гибкую черепицу с оформлением примыканий.',
    workList: [
      'Сборка основания кровли',
      'Укладка сплошного настила',
      'Монтаж подкладочного ковра',
      'Монтаж гибкой черепицы и оформление примыканий',
    ],
    images: [
      { src: project03AfterImage, alt: 'Монтаж мягкой кровли на беседке: готовая кровля' },
      { src: project03ProcessImage, alt: 'Монтаж мягкой кровли на беседке: кровельные работы в процессе' },
      { src: project03BeforeImage, alt: 'Монтаж мягкой кровли на беседке: основание до монтажа покрытия' },
    ],
  },
  {
    title: 'Монтаж кровли на новом доме',
    location: 'Москва и область',
    area: '',
    material: 'Металлочерепица',
    duration: '',
    price: '',
    description:
      'Новая кровля на готовой коробке с устройством стропильной системы, пирога и покрытия по проекту.',
    workList: [
      'Подготовка и монтаж стропильной системы',
      'Монтаж обрешётки и контробрешётки',
      'Устройство кровельного пирога',
      'Монтаж металлочерепицы',
    ],
    images: createImages('Монтаж кровли на новом доме'),
  },
  {
    title: 'Замена кровли на дачном доме',
    location: 'Чеховский район',
    area: '145 м²',
    material: 'Металлочерепица',
    duration: '9 дней',
    price: 'от 210 тыс. ₽',
    description:
      'Сняли старую кровлю и обрешётку, заменили повреждённые элементы стропил и смонтировали новую кровлю из металлочерепицы.',
    workList: [
      'Демонтаж старой кровли и обрешётки',
      'Замена повреждённых элементов стропил',
      'Монтаж новой обрешётки',
      'Монтаж кровли из металлочерепицы',
    ],
    images: [
      { src: project04AfterImage, alt: 'Замена кровли на дачном доме в Чеховском районе: готовая кровля' },
      { src: project04ProgressImage, alt: 'Замена кровли на дачном доме в Чеховском районе: монтаж кровли в процессе' },
      { src: project04BeforeImage, alt: 'Замена кровли на дачном доме в Чеховском районе: до начала работ' },
      { src: project04MainImage, alt: 'Замена кровли на дачном доме в Чеховском районе: основной вид объекта' },
    ],
  },
  {
    title: 'Замена кровли на дачном доме',
    location: 'Подольский район',
    area: '120 м²',
    material: 'Гибкая черепица',
    duration: '7 дней',
    price: 'от 140 тыс. ₽',
    description:
      'Демонтировали старое покрытие, заменили повреждённую обрешётку и смонтировали новую кровлю из гибкой черепицы.',
    workList: [
      'Демонтаж старого покрытия',
      'Замена повреждённой обрешётки',
      'Подготовка основания под гибкую черепицу',
      'Монтаж новой кровли из гибкой черепицы',
    ],
    images: [
      { src: project05AfterImage, alt: 'Замена кровли на дачном доме в Подольском районе: готовая кровля из гибкой черепицы' },
      { src: project05ProcessImage, alt: 'Замена кровли на дачном доме в Подольском районе: работы в процессе' },
      { src: project05BeforeImage, alt: 'Замена кровли на дачном доме в Подольском районе: до начала работ' },
    ],
  },
  {
    title: 'Монтаж кровли на загородном доме',
    location: 'Красногорск',
    area: '210 м²',
    material: 'Металлочерепица',
    duration: '10 дней',
    price: 'от 255 тыс. ₽',
    description:
      'Смонтировали гидроизоляцию, контробрешётку, металлическую кровлю и доборные элементы на доме сложной формы.',
    workList: [
      'Монтаж гидроизоляции',
      'Монтаж контробрешётки',
      'Монтаж металлической кровли',
      'Установка доборных элементов на доме сложной формы',
    ],
    images: [
      { src: project06AfterImage, alt: 'Монтаж кровли на загородном доме в Красногорске: готовая металлическая кровля' },
      { src: project06ProcessImage, alt: 'Монтаж кровли на загородном доме в Красногорске: работы в процессе' },
    ],
  },
  {
    title: 'Монтаж кровли на гостевом доме',
    location: 'Одинцовский район',
    area: '74 м²',
    material: 'Мягкая кровля',
    duration: '5 дней',
    price: 'от 95 тыс. ₽',
    description:
      'Подготовили стропильную систему, выполнили обрешётку и смонтировали кровельное покрытие с водосточной системой.',
    workList: [
      'Подготовка стропильной системы',
      'Монтаж обрешётки',
      'Монтаж мягкого кровельного покрытия',
      'Установка водосточной системы',
    ],
    images: [
      { src: project07AfterImage, alt: 'Монтаж кровли на гостевом доме в Одинцовском районе: готовая мягкая кровля' },
      { src: project07ProcessImage, alt: 'Монтаж кровли на гостевом доме в Одинцовском районе: работы в процессе' },
      { src: project07BeforeImage, alt: 'Монтаж кровли на гостевом доме в Одинцовском районе: до начала работ' },
    ],
  },
  {
    title: 'Монтаж утеплённой кровли на коттедже',
    location: 'Истринский район',
    area: '220 м²',
    material: 'Металлочерепица',
    duration: '14 дней',
    price: 'от 375 тыс. ₽',
    description:
      'Выполнили утепление кровли, смонтировали мембраны, обрешётку, металлочерепицу и оформили сложные примыкания.',
    workList: [
      'Утепление кровли',
      'Монтаж мембран',
      'Монтаж обрешётки и металлочерепицы',
      'Оформление сложных примыканий',
    ],
    images: [
      { src: project08AfterImage, alt: 'Монтаж утеплённой кровли на коттедже в Истринском районе: готовая кровля из металлочерепицы' },
      { src: project08ProcessImage, alt: 'Монтаж утеплённой кровли на коттедже в Истринском районе: работы в процессе' },
    ],
  },
  {
    title: 'Монтаж вальмовой кровли из еврошифера',
    location: 'Домодедовский район',
    area: '130 м²',
    material: 'Еврошифер',
    duration: '6 дней',
    price: 'от 125 тыс. ₽',
    description:
      'Смонтировали гидроизоляционную мембрану, контробрешётку и обрешётку, уложили еврошифер, оформили коньки, карнизы и примыкания.',
    workList: [
      'Монтаж гидроизоляционной мембраны',
      'Монтаж контробрешётки и обрешётки',
      'Укладка еврошифера',
      'Оформление коньков, карнизов и примыканий',
    ],
    images: [
      { src: project09AfterImage, alt: 'Монтаж вальмовой кровли из еврошифера в Домодедовском районе: готовая кровля' },
      { src: project09ProcessImage, alt: 'Монтаж вальмовой кровли из еврошифера в Домодедовском районе: работы в процессе' },
      { src: project09BeforeImage, alt: 'Монтаж вальмовой кровли из еврошифера в Домодедовском районе: до начала работ' },
    ],
  },
  {
    title: 'Монтаж кровли дома и террасы',
    location: 'Московская область',
    area: '',
    material: '',
    duration: '',
    price: '',
    description:
      'Комплексный монтаж покрытия для основного дома и террасы с разными узлами и сопряжениями.',
    workList: [
      'Расчёт материалов по двум зонам кровли',
      'Монтаж покрытия на доме',
      'Монтаж покрытия на террасе',
      'Проработка примыканий и водостоков',
    ],
    images: createImages('Монтаж кровли дома и террасы'),
  },
  {
    title: 'Монтаж крыши для пристройки',
    location: 'Москва и область',
    area: '',
    material: '',
    duration: '',
    price: '',
    description:
      'Кровельные работы для пристройки с увязкой нового контура к существующей конструкции дома.',
    workList: [
      'Проверка примыкания к основному зданию',
      'Монтаж основания и покрытия',
      'Устройство примыканий',
      'Проверка герметичности',
    ],
    images: createImages('Монтаж крыши для пристройки'),
  },
];
