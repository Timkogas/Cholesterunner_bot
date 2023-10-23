const TelegramApi = require('node-telegram-bot-api')
const mongoose = require('mongoose');
require('dotenv').config();

process.env["NTBA_FIX_350"] = 1

mongoose.connect(process.env.DB_MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  id: { type: Number, required: true },
  phone: String,
});

const labelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  count: { type: Number, default: 1 }
});

const User = mongoose.model('User', userSchema);
const Label = mongoose.model('Label', labelSchema);

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
    const textArr = msg.text.split(' ')

    const text = msg.text
    const chatId = msg.chat.id

    const existingUser = await User.findOne({ id: msg.from.id });

    if (!existingUser) {
      let newUser
      if (msg?.contact?.phone_number) {
        newUser = new User({
          username: msg.from.username,
          id: msg.from.id,
          phone: msg?.contact?.phone_number,
        });
      } else {
        newUser = new User({
          username: msg.from.username,
          id: msg.from.id,
        });
      }
      await newUser.save();
    } else {
      if (msg?.contact?.phone_number) {
        existingUser.phone = msg?.contact?.phone_number;
        await existingUser.save();
      }
    }

    try {
      if (text.includes('/start')) {

        if (textArr.length === 2) {
          const labelName = textArr[1];
          try {
            const existingLabel = await Label.findOne({ name: labelName });
    
            if (existingLabel) {
              existingLabel.count += 1;
              await existingLabel.save();
            } else {
              const newLabel = new Label({ name: labelName });
              await newLabel.save();
            }
          } catch (error) {
            console.error(error);
          }
        }

        return await bot.sendPhoto(chatId, './pic.jpg', {
          caption: `<b>Бляшки уже заждались! 🔥</b>\n\nЗаходи в меню и жми играть, чтобы начать!\n\n<b>Внимание:</b> игра запускается только с мобильных устройств. `,
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
        await bot.sendPhoto(message.chat.id, './pic.jpg', {
          caption: `<b>Бляшки уже заждались! 🔥</b>\n\nЗаходи в меню и жми играть, чтобы начать!\n\n<b>Внимание:</b> игра запускается только с мобильных устройств. `,
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
        await bot.sendMessage(message.chat.id, `Игра создана фондом борьбы с инсультом ОРБИ, чтобы в смешном формате рассказать как плохой холестерин повышает риск возникновения инсульта. Переходите на <b><a href='https://orbifond.ru'>сайт</a></b> фонда, чтобы узнать об этом больше и оценить свои риски! `, {
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
        await bot.sendMessage(message.chat.id, `Мы подготовили специальный тест, который поможет оценить ваш риск получить инсульт. Чтобы пройти тест, переходите на сайт по <b><a href='https://orbifond.ru/cholesterunner/'>ссылке</a></b>.`, {
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
        await bot.sendMessage(message.chat.id, `Если вам понравилась игра и вы хотите поддержать фонд, сделать это можно двумя способами – разовое пожертвование и подписка на ежемесячное пожертвование. Переходите на <b><a href='https://orbifond.ru/kak-pomoch/'>сайт</a></b> и выбирайте любой удобный для вас способ.`, {
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