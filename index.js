// telegram_bot_fixed.js
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Bot, Keyboard } = require('grammy');

const bot = new Bot(process.env.BOT_TOKEN);
const ADMIN_ID = Number(process.env.ADMIN_ID); // ← только эта строка



// Файлы хранения
const adviceCooldownFile = 'daily_advice.json';
const memeIndexFile = path.join(__dirname, 'meme_index.json');

// Загрузка данных
let userAdviceTimestamps = fs.existsSync(adviceCooldownFile)
  ? JSON.parse(fs.readFileSync(adviceCooldownFile, 'utf8'))
  : {};

let userMemeIndex = fs.existsSync(memeIndexFile)
  ? JSON.parse(fs.readFileSync(memeIndexFile, 'utf8'))
  : {};

// Сохранение данных
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
const mainKeyboard = new Keyboard().text('Бесплатно💓').row().text('Платно🫰').resized();

const freeKeyboard = new Keyboard()
  .text('Поцелуй S ☁').row()
  .text('Поцелуй L 🍓').row()
  .text('Поцелуй XXL 😈').row()
  .text('Срочные обнимашки 🧸').row()
  .text('Объятия XL ❤️').row()
  .text('Тест на настроение (с рекомендацией) ✨').row()
  .text('Прогноз и совет на день 🪄').row()
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
  await ctx.reply('Привет, любимка! 💓 Выбирай:', {
    reply_markup: mainKeyboard
  });
});

bot.hears('Бесплатно💓', async (ctx) => ctx.reply('Выбирай:', { reply_markup: freeKeyboard }));

bot.hears('Платно🫰', async (ctx) => ctx.reply('Вот платные опции:', { reply_markup: paidKeyboard }));

const notifyAdmin = async (ctx, choice) => {
  await bot.api.sendMessage(ADMIN_ID, `🔔 Новый заказ: ${choice} от @${ctx.from.username || ctx.from.first_name}`);
};

// Бесплатные опции
bot.hears([
  'Поцелуй S ☁',
  'Поцелуй L 🍓',
  'Поцелуй XXL 😈',
  'Срочные обнимашки 🧸',
  'Объятия XL ❤️',
  'Массаж 💆'
], async (ctx) => {
  const text = ctx.message.text;
  await ctx.reply('Принято! ✨');
  await notifyAdmin(ctx, text);
});

bot.hears('Тест на настроение (с рекомендацией) ✨', async (ctx) => {
  await ctx.reply('Как ты себя чувствуешь?', {
    reply_markup: new Keyboard().text('Отлично').row().text('Устал').row().text('Печально').row().text('🔙 Назад').resized()
  });
});

bot.hears('Прогноз и совет на день 🪄', async (ctx) => {
  const userId = ctx.from.id.toString();
  const now = Date.now();
  const last = userAdviceTimestamps[userId];

  if (last && now - last < 86400000) {
    const hoursLeft = Math.ceil((86400000 - (now - last)) / (60 * 60 * 1000));
    return ctx.reply(`🌙 Уже получал совет. Попробуй снова через ${hoursLeft} ч.`);
  }

  const adviceList = [
    'Сегодня день будет полон маленьких чудес.',
    'Ты светишься изнутри.',
    'Солнце сегодня не только в небе, но и в тебе.',
    'Возможны неожиданные приятности.',
    'Удача на твоей стороне.',
    'Выбери заботу о себе.',
    'Фокусируйся на хорошем.',
    'Твоя улыбка — магнит для добра.',
    'День будет как лёгкий ветер.'
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
  await ctx.reply('Это тебе будет стоить 5 поцелуйчиков 💋💋💋💋💋');
  await notifyAdmin(ctx, 'Быстрый вкусный перекус 🥐');
});

bot.hears('Массаж 💆', async (ctx) => {
  await ctx.reply('Начинаю мягкий расслабляющий массаж 🌸💆✨');
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
  await ctx.reply('Заказ принят! ❤️', {
    reply_markup: new Keyboard().text('🔙 Назад').resized()
  });
});

bot.hears('🔙 Назад', async (ctx) => {
  await ctx.reply('Ты вернулся в главное меню 💓 Выбирай снова:', {
    reply_markup: mainKeyboard
  });
});

const moodResponses = {
  'Отлично': ['Ты супер! ☀️'],
  'Устал': ['Сделай паузу ☕'],
  'Печально': ['Ты не один ❤️']
};

bot.hears(['Отлично', 'Устал', 'Печально'], async (ctx) => {
  const mood = ctx.message.text;
  const replies = moodResponses[mood];
  await ctx.reply(replies[Math.floor(Math.random() * replies.length)], {
    reply_markup: new Keyboard().text('🔙 Назад').resized()
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

// Вход в режим ожидания поста
bot.command('post', async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  waitingForPost = true;
  await ctx.reply('📝 Введи сообщение, которое нужно отправить. Чтобы отменить — напиши "отмена".');
});

// Обработка следующего сообщения
bot.on('message:text', async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  if (!waitingForPost) return;

  const text = ctx.message.text.trim();

  if (text.toLowerCase() === 'отмена') {
    waitingForPost = false;
    return await ctx.reply('❌ Отменено. Ты вышел из режима публикации.');
  }

  try {
    await ctx.reply('✅ Отправляю пост...');
    // Здесь ты можешь изменить, куда отправлять пост (например, в канал или группе)
    await ctx.reply(text);
    waitingForPost = false;
  } catch (err) {
    console.error('Ошибка при публикации поста:', err);
    await ctx.reply('❌ Ошибка при отправке поста.');
  }
});


// Запуск
bot.start();
console.log('Бот запущен ✅');
