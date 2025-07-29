require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Bot, InlineKeyboard, Keyboard } = require('grammy'); 
const bot = new Bot(process.env.BOT_TOKEN); 
const ADMIN_ID = Number(process.env.ADMIN_ID);
const lapsikiFile = path.join(__dirname, 'lapsiki.json');

let userLapsiki = fs.existsSync(lapsikiFile)
  ? JSON.parse(fs.readFileSync(lapsikiFile, 'utf8'))
  : {};

function saveLapsiki() {
  fs.writeFileSync(lapsikiFile, JSON.stringify(userLapsiki, null, 2));
}
function getLapsiki(userId) {
  return userLapsiki[userId] || 0;
}
function addLapsiki(userId, amount) {
  userLapsiki[userId] = getLapsiki(userId) + amount;
  saveLapsiki();
}
function spendLapsiki(userId, amount) {
  if (getLapsiki(userId) < amount) return false;
  userLapsiki[userId] -= amount;
  saveLapsiki();
  return true;
}
// команда /списатьлапсики 
const BOYFRIEND_ID = 1189007223;
bot.command('списатьлапсики', async (ctx) => {
  const amount = Number(ctx.message.text.split(' ')[1]); // теперь только число аргументом
  if (isNaN(amount) || amount <= 0) {
    return ctx.reply('Введите корректное число для списания, например: /списатьлапсики 10');
  }
  if (!spendLapsiki(BOYFRIEND_ID, amount)) {
    return ctx.reply('Недостаточно лапсиков!');
  }
  await ctx.reply(`Списано ${amount} лапсиков у твоего парня`);
  await bot.api.sendMessage(BOYFRIEND_ID, `С баланса списано ${amount} лапсиков за заказ в Нежномаркете!`);
});

// команда начислитьлапсики 

bot.command('начислитьлапсики', async (ctx) => {
  const amount = Number(ctx.message.text.split(' ')[1]); // только число — сколько начислить
  if (isNaN(amount) || amount <= 0) {
    return ctx.reply('Введите сумму для начисления, например: /начислитьлапсики 10');
  }
  addLapsiki(BOYFRIEND_ID, amount); // твоя функция для добавления баллов
  await ctx.reply(`Начислено ${amount} лапсиков пользователю (id=${BOYFRIEND_ID})`);
  await bot.api.sendMessage(BOYFRIEND_ID, `Вам начислено ${amount} лапсиков!`);
});


// ---- Состояния (ВСЕ в начале!) ----
let waitingForDream = {};
let waitingForFeedback = {};
let waitingForPost = false;
let userMenuState = {};


// Обработка ошибок
bot.catch((err) => {
  console.error('⚠️ Ошибка в обработчике бота:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('🔴 Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('🔴 Uncaught Exception:', err);
});

// === Главное меню  ===
const mainKeyboard = new Keyboard()
  .text('Бесплатно💓').text('Платно🫰').row()
  .text('Сделать приятно Саше 💌').row()
  .text('Мой баланс 🐾').row()
  .text('Полезные ссылки 🔗').row()
  .text('Оставить предложения по улучшению проекта ✍️')
  .resized();

// === Бесплатные опции ===
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

// === Платные опции  ===
const paidKeyboard = new Keyboard()
  .text('Заварить чай/кофе ☕🫖').row()
  .text('Быстрый вкусный перекус 🥐').row()
  .text('Массаж 💆').row()
  .text('Мемчик 🐒').row()
  .text('🔙 Назад')
  .resized();

const sashaKeyboard = new Keyboard()
  .text('Признаться в любви ❤️').row()
  .text('Случайный выбор действия 🎲').row()
  .text('🔙 Назад')
  .resized();

const moodKeyboard = new Keyboard()
  .text('Отлично').row()
  .text('Устал').row()
  .text('Печально').row()
  .text('🔙 Назад')
  .resized();

// --- Данные ---
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

function saveMemeIndex() {
  fs.writeFileSync(memeIndexFile, JSON.stringify(userMemeIndex, null, 2));
}

let userAdviceTimestamps = fs.existsSync(adviceCooldownFile)
  ? JSON.parse(fs.readFileSync(adviceCooldownFile, 'utf8'))
  : {};

function saveAdviceTimestamps() {
  fs.writeFileSync(adviceCooldownFile, JSON.stringify(userAdviceTimestamps, null, 2));
}

const memePhotos = [
  'AgACAgIAAxkBAAPCaGjbFcVkDdfrkOVyMVzHs1xtDHEAAs7zMRsfj0hLcRah7yXIqmcBAAMCAAN4AAM2BA',
  'AgACAgIAAxkBAAPEaGjbN4perbA3ufmQs7vI3vI5u6wAAs_zMRsfj0hLUFgtq22NrUEBAAMCAAN4AAM2BA',
  'AgACAgIAAxkBAAPGaGjbVR96z4cluSJ-V0njKK0vrZIAAtHzMRsfj0hLl9XXoElGDokBAAMCAAN4AAM2BA',
  'AgACAgIAAxkBAAPKaGjbm9EZi1Zswp-2K6N6VUt-uZgAAtbzMRsfj0hL85IfFAW7GUoBAAMCAAN4AAM2BA',
  'AgACAgIAAxkBAAPMaGjbtQ0hNLzvq_hKWXvU5ISYAtkAAtrzMRsfj0hL9d1QT_O9i7MBAAMCAAN4AAM2BA',
  'AgACAgIAAxkBAAPOaGjb0XhKGijQ10qvtK4mbHQOU3UAAqDyMRu0nElLvzjPng13ZxkBAAMCAAN4AAM2BA'
];

// --- Цикл и уведомления ---
function getCyclePhase() {
  const startDate = new Date(process.env.CYCLE_START_DATE);
  const cycleLength = Number(process.env.CYCLE_LENGTH || 28);
  const today = new Date();
  const daysPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
  const dayInCycle = daysPassed % cycleLength;

  if (dayInCycle >= 0 && dayInCycle <= 4) return 'menstruation';
  if (dayInCycle >= 5 && dayInCycle <= 11) return 'follicular';
  if (dayInCycle >= 12 && dayInCycle <= 14) return 'ovulation';
  if (dayInCycle >= 15 && dayInCycle <= 24) return 'luteal';
  if (dayInCycle >= 25 && dayInCycle <= 27) return 'pms';
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
    await bot.api.sendMessage(1189007223, `🔔 Цикл: ${message}`); // Доп. ID
  }
}

// --- Хендлеры клавиатур ---

bot.command('start', async (ctx) => {
  await ctx.replyWithAnimation('CgACAgIAAxkBAAORaGjGMi2dp6DzsgZN-ccqxMOFA5IAAgV1AAIfj0hLA9gAARgwJwhCNgQ');
  await ctx.reply(
    'Привет, любимка! 💓 Здесь ты можешь выбрать, что тебе необходимо прямо сейчас, а я просто сделаю это ✨ 👉👈 Таким способом я хочу выразить свою любовь к тебе 💓 Некоторые услуги платные 😉',
    { reply_markup: mainKeyboard }
  );
});
bot.hears('Мой баланс 🐾', async (ctx) => {
  const balance = getLapsiki(ctx.from.id);
  await ctx.reply(`Твой текущий баланс: ${balance} лапсика(ов) 🐾`);
});


bot.hears('Бесплатно💓', async (ctx) => {
  userMenuState[ctx.from.id] = 'main';
  await ctx.reply('Выбирай:', { reply_markup: freeKeyboard });
});

bot.hears('Платно🫰', async (ctx) => {
  userMenuState[ctx.from.id] = 'main';
  await ctx.reply('Вот платные опции, милашка 😘', { reply_markup: paidKeyboard });
});

bot.hears('Полезные ссылки 🔗', async (ctx) => {
  await ctx.reply('Вот что может быть тебе полезно 🫶:', {
    reply_markup: new InlineKeyboard()
      .url('🌸 Информация о фазах моего цикла',
        'https://docs.google.com/document/d/14hiIuIbMan3o3tgH4n1rNd40ujKu3MLSoXnqwnsUM2w/edit?usp=sharing'
      )
  });
});

const catalogLink = "https://admin.webbot.shop/shop/271d025c-d4c9-4505-9b75-92d17c969f3b"; // Подставь свой URL


bot.hears('Оставить предложения по улучшению проекта ✍️', async (ctx) => {
  waitingForFeedback[ctx.from.id] = true;
  await ctx.reply('✍️ Пожалуйста, напиши свои пожелания по улучшению проекта. Чтобы отменить, напиши "отмена".');
});

bot.hears('Сделать приятно Саше 💌', async (ctx) => {
  await ctx.reply(
    `За выполнение этих действий тебе будут начисляться баллы — *Лапсики 🐾*\n` +
    `Их можно накопить и потратить на услугу по выбору в моем магазине — *Нежномаркет* 🐇\n\n` +
    `Можешь отправить мне признание в любви или выполнить действие, которое сможет меня порадовать. Оно сгенерируется случайным выбором ✨`,
    { parse_mode: 'Markdown', reply_markup: sashaKeyboard }
  );
});

bot.hears('Признаться в любви ❤️', async (ctx) => {
  const user = ctx.from;
  // Парню: информация о любви и потенциальная награда
  await ctx.reply(
    'Твоя любовь будет услышана! 💖\n\n💡 За это действие ты можешь получить 3 лапсика 🐾.\n\nНапиши мне после исполнения, чтобы получить награду!'
  );
  // Тебе: уведомление с подсказкой о начислении лапсиков
  await bot.api.sendMessage(
    ADMIN_ID,
    `📩 Влад признался тебе в любви ❤️\nИмя: ${user.first_name}\nЮзернейм: @${user.username || 'без юзернейма'}\n\n➕ За это действие надо вручную начислить 3 лапсика.`
  );
});


bot.hears('Случайный выбор действия 🎲', async (ctx) => {
  const actions = [
    {text:'*"Поймай момент"* 💌 - Подойди к Саше, когда она не ждёт, и просто обними.' , reward: 2},
    {text:'*"Танец без причины"*💃🕺💓 - Пригласи Сашу на танец (даже дома). Это будет забавно и мило.', reward: 4},
    {text:'*"Миссия: мем"* - Срочно найди смешной мем и отправь Саше, у тебя 20 минут на выполнение.', reward: 2},
    {text:'*"Режим зайчика"* 🐰 - Всё, что ты говоришь Саше, должно начинаться с "Сашенька любимая..." в течение 5 часов.', reward: 6},
    {text:'*"Целевой поцелуй"* 💋 - Поцелуй Сашу в 5 разных мест на своё усмотрение.', reward: 5}
  ];
  const random = actions[Math.floor(Math.random() * actions.length)];
  // Парню: говорим, сколько начисляется, но баллы НЕ начисляем!
  await ctx.reply(`Вот твоё действие:\n${random.text}\n\n💡 За выполнение этого задания ты сможешь получить ${random.reward} лапсика(ов) 🐾\n\nСообщи мне после выполнения, чтобы получить награду!`);
  // Тебе: уведомление с "подсказкой", сколько должно быть начислено
  await bot.api.sendMessage(
    ADMIN_ID,
    `🎲 Случайное действие для парня:\n${random.text}\n\n➕ За выполнение нужно вручную начислить ${random.reward} лапсика(ов).`
  );
});

bot.hears('Написать мечту (Кнопка заряжена энергией на её исполнение) 💫', async (ctx) => {
  const userId = ctx.from.id;
  waitingForDream[userId] = true;
  await ctx.reply('🤫 Напиши свою мечту. Она будет отправлена во вселенную и точно исполнится 💫 Это анонимно, никто не узнает, что ты загадал 💓 Для отмены ввода мечты напиши просто "отмена"');
});

bot.hears('🔙 Назад', async (ctx) => {
  await ctx.reply('🌸 Главное меню:', { reply_markup: mainKeyboard });
});

// --- Бесплатные ("free") функции по списку кнопок ---
const freeOptions = [
  'Поцелуй S ☁',
  'Поцелуй L 🍓',
  'Поцелуй XXL 😈',
  'Срочные обнимашки 🧸',
  'Объятия XL ❤️',
  'Тест на настроение (с рекомендацией) ✨',
  'Прогноз и совет на день 🪄'
];

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

for (const option of freeOptions) {
  bot.hears(option, async (ctx) => {
    userMenuState[ctx.from.id] = 'free';
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
        await ctx.reply('Как ты себя чувствуешь?', { reply_markup: moodKeyboard });
        break;
      case 'Прогноз и совет на день 🪄':
        {
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
          await notifyAdmin(ctx, choice);
        }
        break;
    }
  });
}

// --- Платные опции ---
bot.hears('Заварить чай/кофе ☕🫖', async (ctx) => {
  userMenuState[ctx.from.id] = 'paid';
  await ctx.replyWithPhoto('AgACAgIAAxkBAAO-aGjRaZA5IBMNjLKdwPwwm7mkx14AApLzMRsfj0hL5u0B22DBZf0BAAMCAAN4AAM2BA');
  await ctx.reply('С тебя 3 поцелуйчика 💋💋💋 Чай или кофе?', {
    reply_markup: new Keyboard().text('Чай 🍵').text('Кофе ☕').row().text('🔙 Назад').resized()
  });
  await notifyAdmin(ctx, 'Заварить чай/кофе ☕🫖');
});

bot.hears('Быстрый вкусный перекус 🥐', async (ctx) => {
  userMenuState[ctx.from.id] = 'paid';
  await ctx.replyWithPhoto('AgACAgIAAxkBAAPAaGjSNVbTEQABMkxakC447CTtEtA1AAII8TEbSUdIS_LpQaRT8nNjAQADAgADeAADNgQ');
  await ctx.reply('Это тебе будет стоить 5 поцелуйчиков 💋💋💋💋💋 Вкусняшка на моё усмотрение + может варьироваться в зависимости от продуктов, имеющихся дома в наличии 🥪🍳');
  await notifyAdmin(ctx, 'Быстрый вкусный перекус 🥐');
});

bot.hears('Массаж 💆', async (ctx) => {
  userMenuState[ctx.from.id] = 'paid';
  await ctx.reply('Стоимость услуги - 5 поцелуйчиков 💋💋💋💋💋 Устраивайся поудобнее... Начинаю мягкий расслабляющий массаж плеч и шеи 🌸💆‍♀️✨ Ты заслуживаешь полного отдыха!');
  await notifyAdmin(ctx, 'Массаж 💆');
});

bot.hears('Мемчик 🐒', async (ctx) => {
  userMenuState[ctx.from.id] = 'paid';
  const userId = ctx.from.id.toString();
  const index = userMemeIndex[userId] || 0;

  await ctx.replyWithPhoto(memePhotos[index]);
  await ctx.reply('С тебя оплата в виде улыбки 😊 Если хочешь ещё — жми ещё раз!');

  userMemeIndex[userId] = (index + 1) % memePhotos.length;
  saveMemeIndex();
});

bot.hears(['Чай 🍵', 'Кофе ☕'], async (ctx) => {
  const choice = ctx.message.text;
  userMenuState[ctx.from.id] = 'paid';
  await ctx.reply('Заказ принят! ❤️', {
    reply_markup: new Keyboard().text('🔙 Назад').resized()
  });
  await notifyAdmin(ctx, `Выбран напиток: ${choice}`);
});

// --- ВСЯ универсальная обработка текстовых сообщений ОДНИМ хендлером ---
bot.on('message:text', async (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text.trim();

  // === Мечты ===
  if (waitingForDream[userId]) {
    if (text.toLowerCase() === 'отмена') {
      delete waitingForDream[userId];
      return await ctx.reply('❌ Ты отменил ввод мечты. Возвращаемся назад 🔙', {
        reply_markup: freeKeyboard
      });
    }

    const now = new Date();

    if (!userDreams[userId]) {
      userDreams[userId] = {
        startDate: now.toISOString(),
        dreams: []
      };
    }

    userDreams[userId].dreams.push(ctx.message.text);
    saveDreams();

    delete waitingForDream[userId];
    return await ctx.reply('✨ Запрос во вселенную принят. Начинаются работы по исполнению твоей мечты...');
  }

  // === Настроение ===
  if (moodResponses[text]) {
    const responses = moodResponses[text];
    const response = responses[Math.floor(Math.random() * responses.length)];
    return await ctx.reply(response, {
      reply_markup: new Keyboard().text('🔙 Назад').resized()
    });
  }

  // === Обработка пожеланий ===
  if (waitingForFeedback[ctx.from.id]) {
    if (text.toLowerCase() === 'отмена') {
      delete waitingForFeedback[ctx.from.id];
      return await ctx.reply('❌ Отменено. Ты вышел из режима пожеланий.');
    }

    await bot.api.sendMessage(
      ADMIN_ID,
      `💡 Новое предложение по улучшению от @${ctx.from.username || ctx.from.first_name}:\n\n${text}`
    );
    await ctx.reply('✅ Спасибо за твоё мнение! Я обязательно передам это разработчице 💓');
    delete waitingForFeedback[ctx.from.id];
    return;
  }

  // === Пост для публикации ===
  if (ctx.from.id === ADMIN_ID && waitingForPost) {
    if (text.toLowerCase() === 'отмена') {
      waitingForPost = false;
      return await ctx.reply('❌ Отменено. Ты вышел из режима публикации.');
    }

    try {
      await ctx.reply('✅ Отправляю пост...');
      await bot.api.sendMessage(1189007223, text); // замените на нужный ID канала
      waitingForPost = false;
    } catch (err) {
      console.error('Ошибка при публикации поста:', err);
      await ctx.reply('❌ Ошибка при отправке поста.');
    }

    return;
  }
});

// --- Админ команды и file_id хелперы ---
const notifyAdmin = async (ctx, choice) => {
  await bot.api.sendMessage(
    ADMIN_ID,
    `🔔 Новый заказ: ${choice} от @${ctx.from.username || ctx.from.first_name}`
  );
};

bot.command('post', async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  waitingForPost = true;
  await ctx.reply('📝 Введи сообщение, которое нужно отправить. Чтобы отменить — напиши "отмена".');
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

bot.on('message:animation', async (ctx) => {
  const fileId = ctx.message.animation.file_id;
  await ctx.reply(`file_id этой гифки: ${fileId}`);
});

bot.on('message:photo', async (ctx) => {
  const fileId = ctx.message.photo.at(-1).file_id;
  await ctx.reply(`file_id этой картинки: ${fileId}`);
});

// --- Крон-планировщик ---
const cron = require('node-cron');

// Ежедневное уведомление в 8:00 утра
cron.schedule('0 8 * * *', () => {
  sendCycleNotification();
});

// Проверка мечт через полгода
cron.schedule('0 8 * * *', async () => {
  const now = new Date();

  for (const [userId, data] of Object.entries(userDreams)) {
    if (!data.startDate || !Array.isArray(data.dreams) || data.dreams.length === 0) {
      continue;
    }

    const startDate = new Date(data.startDate);
    const halfYearLater = new Date(startDate);
    halfYearLater.setMonth(halfYearLater.getMonth() + 6);

    if (now >= halfYearLater) {
      const dreamsList = data.dreams.map((d, i) => `${i + 1}. ${d}`).join('\n');
      try {
        await bot.api.sendMessage(
          userId,
          `Привет! 💓✨ Вот о чем ты мечтал за эти полгода 🤫:\n\n${dreamsList}`
        );
        delete userDreams[userId];
        saveDreams();
      } catch (err) {
        console.error(`❌ Ошибка при отправке мечт пользователю ${userId}:`, err);
      }
    }
  }
});

// === Запуск бота ===
bot.start();
console.log('Бот запущен ✅');
