const TelegramApi = require('node-telegram-bot-api')
require('dotenv').config();

const token = process.env.TOKEN
const bot = new TelegramApi(token, { polling: true })
const variants = {
  menu: 'menu',
  about: 'about',
  test: 'test',
  help: 'help',
  game: 'game'
}


const start = () => {
  bot.on('message', async (msg) => {

    const text = msg.text
    const chatId = msg.chat.id

    try {
      if (text === '/start') {
        return await bot.sendMessage(chatId, `<b>Бляшки уже заждались!</b>\n\nЗаходи в меню и жми старт, чтобы начать.`, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Играть', web_app: { url: 'https://cholesterunner.ru' } }],
              [{ text: 'О проекте', callback_data: variants.about }, { text: 'Тест', callback_data: variants.test }, { text: 'Помочь фонду', callback_data: variants.help }],
            ],
          }
        })
      }
      return await bot.sendMessage(chatId, "Используете кнопки для взаимодействия")
    } catch (e) {
      return bot.sendMessage(chatId, 'Произошла какая то ошибочка!)');
    }
  })

  bot.on('callback_query', async function onCallbackQuery(callbackQuery) {
    const { data, message } = callbackQuery
    
    switch (data) {
      case variants.menu:
        await bot.sendMessage(message.chat.id, `<b>Бляшки уже заждались!</b>\n\nЗаходи в меню и жми старт, чтобы начать.`, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Играть', web_app: { url: 'https://cholesterunner.ru' } }],
              [{ text: 'О проекте', callback_data: variants.about }, { text: 'Тест', callback_data: variants.test }, { text: 'Помочь фонду', callback_data: variants.help }],
            ],
          }
        })
        break;
      case variants.about:
        await bot.sendMessage(message.chat.id, `Игра создана фондом борьбы с инсультом ОРБИ, чтобы в смешном формате рассказать как плохой холестерин повышает риск возникновения инсульта. Переходите на сайте фонда, чтобы узнать об этом больше и оценить свои риски! <b><a href='https://www.youtube.com/watch?v=dQw4w9WgXcQ/'> Ссылка </a></b>`, {
          disable_web_page_preview: true,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Назад', callback_data: variants.menu }],
            ],
          }
        })
        break;
      case variants.test:
        await bot.sendMessage(message.chat.id, `Мы подготовили специальный тест, который поможет оценить ваш риск получить инсульт. Чтобы пройти тест, переходите на сайт по ссылке. <b><a href='https://www.youtube.com/watch?v=dQw4w9WgXcQ/'> Ссылка </a></b>`, {
          disable_web_page_preview: true,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Назад', callback_data: variants.menu }],
            ],
          }
        })
        break;
      case variants.help:
        await bot.sendMessage(message.chat.id, `Если вам понравилась игра и вы хотите поддержать фонд, сделать это можно двумя способами – разовое пожертвование и подписка на ежемесячное пожертвование. Переходите на сайт и выбирайте любой удобный для вас способ.  <b><a href='https://www.youtube.com/watch?v=dQw4w9WgXcQ/'> Ссылка </a></b>`, {
          disable_web_page_preview: true,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Назад', callback_data: variants.menu }],
            ],
          }
        })
        break;
    }
  });
}


start()