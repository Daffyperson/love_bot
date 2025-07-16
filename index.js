process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Bot, Keyboard } = require('grammy');

const bot = new Bot(process.env.BOT_TOKEN);
const ADMIN_ID = Number(process.env.ADMIN_ID);

function getCyclePhase() {
  const startDate = new Date(process.env.CYCLE_START_DATE);
  const cycleLength = Number(process.env.CYCLE_LENGTH || 28);
  const today = new Date();
  const diff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) % cycleLength;

  if (diff >= 0 && diff <= 4) return 'menstruation';
  if (diff >= 5 && diff <= 11) return 'follicular';
  if (diff >= 12 && diff <= 14) return 'ovulation';
  if (diff >= 15 && diff <= 24) return 'luteal';
  if (diff >= 25 && diff <= 27) return 'pms';
  return 'unknown';
}

const phaseMessages = {
  menstruation: '🩸 У Саши месячные. Самое время заботы, уюта и чая с чем-то вкусным ☕🧁',
  follicular: '🌱 Фертильное окно. У Саши прилив сил и настроения — поддержи её активность!',
  ovulation: '💫 Сегодня овуляция! Саша особенно обаятельна и чувствительна — будь особенно внимателен ❤️',
  luteal: '🌙 Лютеальная фаза. Возможны резкие перепады настроения. Поддержка особенно важна!',
  pms: '⚠️ Скоро месячные. Может быть раздражительность, усталость — особенно важны бережность и обнимашки 🧸'
};

async function sendCycleNotification() {
  const phase = getCyclePhase();
  const message = phaseMessages[phase];
  if (message) {
    await bot.api.sendMessage(ADMIN_ID, `🔔 Цикл: ${message}`);
    await bot.api.sendMessage(1189007223, `🔔 Цикл: ${message}`);
  }
}


// === Файлы хранения ===
const memeIndexFile = path.join(__dirname, 'meme_index.json');
const adviceCooldownFile = path.join(__dirname, 'daily_advice.json');
const dreamsFile = path.join(__dirname, 'dreams.json');

let userDreams = fs.existsSync(dreamsFile)
  ? JSON.parse(fs.readFileSync(dreamsFile, 'utf8'))
  : {};

function saveDreams() {
  fs.writeFileSync(dreamsFile, JSON.stringify(userDreams, null, 2));
}


let userMemeIndex = fs.existsSync(memeIndexFile)
  ? JSON.parse(fs.readFileSync(memeIndexFile, 'utf8'))
  : {};

let userAdviceTimestamps = fs.existsSync(adviceCooldownFile)
  ? JSON.parse(fs.readFileSync(adviceCooldownFile, 'utf8'))
  : {};

function saveAdviceTimestamps() {
  fs.writeFileSync(adviceCooldownFile, JSON.stringify(userAdviceTimestamps, null, 2));
}

function saveMemeIndex() {
  fs.writeFileSync(memeIndexFile, JSON.stringify(userMemeIndex, null, 2));
}


// Мемы
const memePhotos = [
  'AgACAgIAAxkBAAPCaGjbFcVkDdfrkOVyMVzHs1xtDHEAAs7zMRsfj0hLcRah7yXIqmcBAAMCAAN4AAM2BA',
  'AgACAgIAAxkBAAPEaGjbN4perbA3ufmQs7vI3vI5u6wAAs_zMRsfj0hLUFgtq22NrUEBAAMCAAN4AAM2BA',
  'AgACAgIAAxkBAAPGaGjbVR96z4cluSJ-V0njKK0vrZIAAtHzMRsfj0hLl9XXoElGDokBAAMCAAN4AAM2BA',
  'AgACAgIAAxkBAAPKaGjbm9EZi1Zswp-2K6N6VUt-uZgAAtbzMRsfj0hL85IfFAW7GUoBAAMCAAN4AAM2BA',
  'AgACAgIAAxkBAAPMaGjbtQ0hNLzvq_hKWXvU5ISYAtkAAtrzMRsfj0hL9d1QT_O9i7MBAAMCAAN4AAM2BA',
  'AgACAgIAAxkBAAPOaGjb0XhKGijQ10qvtK4mbHQOU3UAAqDyMRu0nElLvzjPng13ZxkBAAMCAAN4AAM2BA'
];

// Меню
const mainKeyboard = new Keyboard()
.text('Бесплатно💓').row()
.text('Платно🫰')
.text('Полезные ссылки 🔗')
.text('Оставить предложения по улучшению проекта ✍️')
.resized();

const freeKeyboard = new Keyboard()
  .text('Поцелуй S ☁').row()
  .text('Поцелуй L 🍓').row()
  .text('Поцелуй XXL 😈').row()
  .text('Срочные обнимашки 🧸').row()
  .text('Объятия XL ❤️').row()
  .text('Тест на настроение (с рекомендацией) ✨').row()
  .text('Прогноз и совет на день 🪄').row()
  .text('Написать мечту (Кнопка заряжена энергией на её исполнение) 💫').row()
  .text('🔙 Назад')
  .resized();

const paidKeyboard = new Keyboard()
  .text('Заварить чай/кофе ☕🫖').row()
  .text('Быстрый вкусный перекус 🥐').row()
  .text('Массаж 💆').row()
  .text('Мемчик 🐒').row()
  .text('🔙 Назад')
  .resized();

// Команды
bot.command('start', async (ctx) => {
  await ctx.replyWithAnimation('CgACAgIAAxkBAAORaGjGMi2dp6DzsgZN-ccqxMOFA5IAAgV1AAIfj0hLA9gAARgwJwhCNgQ');
  await ctx.reply('Привет, любимка! 💓 Здесь ты можешь выбрать, что тебе необходимо прямо сейчас, а я просто сделаю это ✨ 👉👈 Таким способом я хочу выразить свою любовь к тебе 💓 Некоторые услуги платные 😉', {
    reply_markup: mainKeyboard
  });
});

bot.hears('Бесплатно💓', async (ctx) => ctx.reply('Выбирай:', { reply_markup: freeKeyboard }));

bot.hears('Платно🫰', async (ctx) => ctx.reply('Вот платные опции, милашка 😘', { reply_markup: paidKeyboard }));

bot.hears('Полезные ссылки 🔗', async (ctx) => {
  await ctx.reply('Вот что может быть тебе полезно 🫶:', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🌸 Информация о фазах моего цикла',
            url: 'https://docs.google.com/document/d/14hiIuIbMan3o3tgH4n1rNd40ujKu3MLSoXnqwnsUM2w/edit?usp=sharing'
          }
        ]
      ]
    }
  });
});
bot.hears('Оставить предложения по улучшению проекта ✍️', async (ctx) => {
  const userId = ctx.from.id;
  waitingForFeedback[userId] = true;

  await ctx.reply('Пожалуйста, напиши свои пожелания по улучшению проекта. Чтобы отменить, напиши "отмена"');
});




const notifyAdmin = async (ctx, choice) => {
  await bot.api.sendMessage(ADMIN_ID, `🔔 Новый заказ: ${choice} от @${ctx.from.username || ctx.from.first_name}`);
};

// Бесплатные опции
const freeOptions = [
  'Поцелуй S ☁',
  'Поцелуй L 🍓',
  'Поцелуй XXL 😈',
  'Срочные обнимашки 🧸',
  'Объятия XL ❤️',
  'Тест на настроение (с рекомендацией) ✨',
  'Прогноз и совет на день 🪄'
];

bot.hears(freeOptions, async (ctx) => {
  const choice = ctx.message.text;
  switch (choice) {
    case 'Поцелуй S ☁':
      await ctx.reply('Ты выбрал нежный аккуратный 💋чмок💋 Ожидай! ✨');
      await notifyAdmin(ctx, choice);
      break;
    case 'Поцелуй L 🍓':
      await ctx.reply('Приготовься... Самый сочный страстный поцелуй для тебя прямо сейчас 💋');
      await notifyAdmin(ctx, choice);
      break;
    case 'Поцелуй XXL 😈':
      await ctx.replyWithPhoto('AgACAgIAAxkBAAOzaGjN0kS0tzJpqSXRW5_9waCvhfcAAuT3MRuABEhLR1K5SGOpWEkBAAMCAAN4AAM2BA');
      await notifyAdmin(ctx, choice);
      await ctx.reply('Ну что ж... 💦 Доставай свой огромный 🍌');
      break;
    case 'Срочные обнимашки 🧸':
      await ctx.reply('Экстренная доставка объятий уже спешит к тебе! 🧸💫');
      await notifyAdmin(ctx, choice);
      break;
    case 'Объятия XL ❤️':
      await ctx.reply('Нежные, обволакивающие, с запасом любви ❤️🤗');
      await notifyAdmin(ctx, choice);
      break;
    
          case 'Тест на настроение (с рекомендацией) ✨':
      await ctx.reply('Как ты себя чувствуешь?', {
        reply_markup: moodKeyboard
      });
      break;

    case 'Прогноз и совет на день 🪄':
      const userId = ctx.from.id.toString();
      const now = Date.now();
      const last = userAdviceTimestamps[userId];

      if (last && now - last < 86400000) {
        const hoursLeft = Math.ceil((86400000 - (now - last)) / (60 * 60 * 1000));
        return ctx.reply(`🌙 Ты уже получал совет. Попробуй снова через ${hoursLeft} ч.`);
      }

      const adviceList = [
        'Сегодня день будет полон маленьких чудес. Не упускай шанс улыбнуться миру! ✨',
        'Ты светишься изнутри. Пусть это будет твоим секретным оружием сегодня 💫',
        'Солнце сегодня не только в небе, но и в тебе. Поделись своим теплом — и оно вернётся! 🌞',
        'Возможны неожиданные приятности. Будь открыт 🌈',
        'Удача на твоей стороне, особенно если действуешь мягко, но уверенно. Не торопись — просто иди вперёд 🍀',
        'Сегодня лучше не перегружать себя — выбери заботу о себе. Мир подождёт. Не забудь отдохнуть и покушать 🥟🥗',
        'Всё, что ты делаешь с любовью, принесёт удачу. Сфокусируйся на хорошем и оно приумножится 🦋',
        'Твоя улыбка — магнит для добрых событий. Не забывай включить её утром 💌',
        'Этот день будет как лёгкий ветер: нежный и свежий ☁'
      ];
      const dreamsFile = path.join(__dirname, 'dreams.json');
let userDreams = fs.existsSync(dreamsFile)
  ? JSON.parse(fs.readFileSync(dreamsFile, 'utf8'))
  : {};

function saveDreams() {
  fs.writeFileSync(dreamsFile, JSON.stringify(userDreams, null, 2));
}

let waitingForDream = {};

bot.hears('Написать мечту (Кнопка заряжена энергией на её исполнение) 💫', async (ctx) => {
  const userId = ctx.from.id;
  waitingForDream[userId] = true;

  await ctx.reply('🤫 Напиши свою мечту. Она будет отправлена во вселенную и точно исполнится 💫 Это анонимно, никто не узнает, что ты загадал 💓 Для отмены ввода мечты напиши просто "отмена"');
});

bot.on('message:text', async (ctx) => {
  const userId = ctx.from.id;

  // Режим ввода мечты
  if (waitingForDream[userId]) {
    const dreamText = ctx.message.text.trim().toLowerCase();

    if (dreamText === 'отмена') {
      delete waitingForDream[userId];
      return await ctx.reply('❌ Ты отменил ввод мечты. Возвращаемся назад 🔙', {
        reply_markup: freeKeyboard
      });
    }

    const now = new Date();

    userDreams[userId] = {
      text: ctx.message.text,
      date: now.toISOString()
    };
    saveDreams();

    delete waitingForDream[userId];
    return await ctx.reply('✨ Запрос во вселенную принят. Начинаются работы по исполнению твоей мечты...');
  }
});


      const message = adviceList[Math.floor(Math.random() * adviceList.length)];
      await ctx.reply(message);

      userAdviceTimestamps[userId] = now;
      saveAdviceTimestamps();
      break;

      }
});

const moodKeyboard = new Keyboard()
  .text('Отлично').row()
  .text('Устал').row()
  .text('Печально').row()
  .text('🔙 Назад')
  .resized();

const moodResponses = {
  'Отлично': [
    'Остановись на минуту и просто почувствуй: «Мне хорошо». Это ведь так важно! ☀️',
    'Поделись своим настроением — вернётся вдвойне ✨',
    'Закрой глаза и запомни этот момент. Он станет твоим личным якорем счастья 🍀',
    'Хочешь ещё больше радости? Подумай, за что ты благодарен прямо сейчас 🪐'
  ],
  'Устал': [
    'Представь, что ты лежишь в траве, и над тобой плывут облака. Просто побудь там 🌿',
    'Сделай себе тёплый чай (или закажи прямо здесь 😉). Поставь на паузу. Мир подождёт. ☕',
    'Сделай вдох на 4 секунды, задержи на 4 секунды, затем выдохни за 6 секунд. Повтори 5 раз. Медленно... спокойно... 🌬️'
  ],
  'Печально': [
    'Ты не один, я здесь, с тобой. Всегда ❤️. Попытайся подумать. что уже хорошего с тобой произошло и чего ты достиг ☀. И помни, ты сильнее, чем ты думаешь. И невероятно удачливый 🍀✨',
    'Попробуй улыбнуться, даже если не очень хочется - это запускает положительные эмоции ☀❤️',
    'Печаль - это нормально. Позволь себе почувствовать её, а я готова помочь найти тебе свет (если хочешь, можешь поделиться со мной своими переживаниями). Ты не один 💓👩‍❤️‍💋‍👨',
    'Сделай вдох на 4 секунды, задержи на 4 секунды, затем выдохни за 6 секунд. Повтори 5 раз. Медленно... спокойно... 🌬️'
  ]
};

bot.hears('Тест на настроение (с рекомендацией) ✨', async (ctx) => {
  await ctx.reply('Как ты себя чувствуешь?', {
    reply_markup: moodKeyboard
  });
});

bot.hears(['Отлично', 'Устал', 'Печально'], async (ctx) => {
  const mood = ctx.message.text;
  const responses = moodResponses[mood];
  const random = responses[Math.floor(Math.random() * responses.length)];

  await ctx.reply(random, {
    reply_markup: new Keyboard().text('🔙 Назад').resized()
  });
});

bot.hears('Прогноз и совет на день 🪄', async (ctx) => {
  const userId = ctx.from.id.toString();
  const now = Date.now();
  const last = userAdviceTimestamps[userId];

  if (last && now - last < 86400000) {
    const hoursLeft = Math.ceil((86400000 - (now - last)) / (60 * 60 * 1000));
    return ctx.reply(`🌙 Ты уже получал совет. Попробуй снова через ${hoursLeft} ч.`);
  }

  const adviceList = [
    'Сегодня день будет полон маленьких чудес. Не упускай шанс улыбнуться миру! ✨',
    'Ты светишься изнутри. Пусть это будет твоим секретным оружием сегодня 💫',
    'Солнце сегодня не только в небе, но и в тебе. Поделись своим теплом — и оно вернётся! 🌞',
    'Возможны неожиданные приятности. Будь открыт 🌈',
    'Удача на твоей стороне, особенно если действуешь мягко, но уверенно. Не торопись — просто иди вперёд 🍀',
    'Сегодня лучше не перегружать себя — выбери заботу о себе. Мир подождёт. Не забудь отдохнуть и покушать 🥟🥗',
    'Всё, что ты делаешь с любовью, принесёт удачу. Сфокусируйся на хорошем и оно приумножится 🦋',
    'Твоя улыбка — магнит для добрых событий. Не забывай включить её утром 💌',
    'Этот день будет как лёгкий ветер: нежный и свежий ☁'
  ];

  const message = adviceList[Math.floor(Math.random() * adviceList.length)];
  await ctx.reply(message);

  userAdviceTimestamps[userId] = now;
  saveAdviceTimestamps();
});

// Платные
bot.hears('Заварить чай/кофе ☕🫖', async (ctx) => {
  await ctx.replyWithPhoto('AgACAgIAAxkBAAO-aGjRaZA5IBMNjLKdwPwwm7mkx14AApLzMRsfj0hL5u0B22DBZf0BAAMCAAN4AAM2BA');
  await ctx.reply('С тебя 3 поцелуйчика 💋💋💋 Чай или кофе?', {
    reply_markup: new Keyboard().text('Чай 🍵').text('Кофе ☕').resized()
  });
  await notifyAdmin(ctx, 'Заварить чай/кофе ☕🫖');
});

bot.hears('Быстрый вкусный перекус 🥐', async (ctx) => {
  await ctx.replyWithPhoto('AgACAgIAAxkBAAPAaGjSNVbTEQABMkxakC447CTtEtA1AAII8TEbSUdIS_LpQaRT8nNjAQADAgADeAADNgQ');
  await ctx.reply('Это тебе будет стоить 5 поцелуйчиков 💋💋💋💋💋 Вкусняшка на моё усмотрение + может варьироваться в зависимости от продуктов, имеющихся дома в наличии 🥪🍳');
  await notifyAdmin(ctx, 'Быстрый вкусный перекус 🥐');
});

bot.hears('Массаж 💆', async (ctx) => {
  await ctx.reply('Стоимость услуги - 5 поцелуйчиков 💋💋💋💋💋 Устраивайся поудобнее... Начинаю мягкий расслабляющий массаж плеч и шеи 🌸💆‍♀️✨ Ты заслуживаешь полного отдыха!');
  
  await notifyAdmin(ctx, 'Массаж 💆');
});

bot.hears('Мемчик 🐒', async (ctx) => {
  const userId = ctx.from.id.toString();
  const index = userMemeIndex[userId] || 0;

  await ctx.replyWithPhoto(memePhotos[index]);
  await ctx.reply('С тебя оплата в виде улыбки 😊 Если хочешь ещё — жми ещё раз!');

  userMemeIndex[userId] = (index + 1) % memePhotos.length;
  saveMemeIndex();
});

bot.hears(['Чай 🍵', 'Кофе ☕'], async (ctx) => {
  const choice = ctx.message.text;
  await ctx.reply('Заказ принят! ❤️', {
    reply_markup: new Keyboard().text('🔙 Назад').resized()
  });
await notifyAdmin(ctx, `Выбран напиток: ${choice}`);
});

bot.hears('🔙 Назад', async (ctx) => {
  await ctx.reply('Ты вернулся в главное меню 💓 Выбирай снова:', {
    reply_markup: mainKeyboard
  });
});
bot.command('pingme', async (ctx) => {
  try {
    await bot.api.sendMessage(ADMIN_ID, '🔔 Тестовое уведомление тебе в личку!');
    await ctx.reply('✅ Уведомление отправлено. Проверь свою личку!');
  } catch (error) {
    console.error('❌ Ошибка при отправке в ЛС:', error);
    await ctx.reply('❌ Не удалось отправить сообщение в личку.');
  }
});

// Получение file_id
bot.on('message:animation', async (ctx) => {
  const fileId = ctx.message.animation.file_id;
  await ctx.reply(`file_id этой гифки: ${fileId}`);
});

bot.on('message:photo', async (ctx) => {
  const fileId = ctx.message.photo.at(-1).file_id;
  await ctx.reply(`file_id этой картинки: ${fileId}`);
});

// === Публикация произвольного поста через режим ожидания ===

let waitingForPost = false;
let waitingForFeedback = {};

// Вход в режим ожидания поста
bot.command('post', async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  waitingForPost = true;
  await ctx.reply('📝 Введи сообщение, которое нужно отправить. Чтобы отменить — напиши "отмена".');
});

// Обработка следующего сообщения
bot.on('message:text', async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

// Пожелания
if (waitingForFeedback[ctx.from.id]) {
  const text = ctx.message.text.trim();

  if (text.toLowerCase() === 'отмена') {
    delete waitingForFeedback[ctx.from.id];
    return await ctx.reply('❌ Отменено. Ты вышел из режима пожеланий.');
  }

  await bot.api.sendMessage(ADMIN_ID, `💡 Новое предложение по улучшению от @${ctx.from.username || ctx.from.first_name}:\n\n${text}`);
  await ctx.reply('✅ Спасибо за твоё мнение! Я обязательно передам это разработчице 💓');

  delete waitingForFeedback[ctx.from.id];
  return;
}
  if (!waitingForPost) return;

  const text = ctx.message.text.trim();

  if (text.toLowerCase() === 'отмена') {
    waitingForPost = false;
    return await ctx.reply('❌ Отменено. Ты вышел из режима публикации.');
  }

  try {
    await ctx.reply('✅ Отправляю пост...');
    // Здесь ты можешь изменить, куда отправлять пост (например, в канал или группе)
    await bot.api.sendMessage(1189007223, text);
    waitingForPost = false;
  } catch (err) {
    console.error('Ошибка при публикации поста:', err);
    await ctx.reply('❌ Ошибка при отправке поста.');
  }
});

const cron = require('node-cron');

// Каждый день в 8:00 утра
cron.schedule('0 8 * * *', () => {
  sendCycleNotification();
});

// Проверка мечт, которые пора отправить через полгода
cron.schedule('0 8 * * *', async () => {
  const now = new Date();

  for (const [userId, data] of Object.entries(userDreams)) {
    const startDate = new Date(data.startDate);
    const halfYearLater = new Date(startDate);
    halfYearLater.setMonth(halfYearLater.getMonth() + 6);

    if (
      now.getFullYear() === halfYearLater.getFullYear() &&
      now.getMonth() === halfYearLater.getMonth() &&
      now.getDate() === halfYearLater.getDate()
    ) {
      const dreamsList = data.dreams.map((d, i) => `${i + 1}. ${d}`).join('\n');
      try {
        await bot.api.sendMessage(userId, `Привет! 💓✨ Вот о чем ты мечтал за эти полгода 🤫:\n\n${dreamsList}`);
       delete userDreams[userId]; // Удаляем после отправки
        saveDreams(); // Сохраняем
      } catch (err) {
        console.error(`❌ Ошибка при отправке мечт пользователю ${userId}:`, err);
      }
    }
  }
});



// Запуск
bot.start();
console.log('Бот запущен ✅');
