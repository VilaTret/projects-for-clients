// const TelegramBot = require('node-telegram-bot-api')
// const https = require('https')
// const Jimp = require('jimp')
// const express = require('express')

// const token = '6965202334:AAEcJYVXE_NehXzEZ2NtjjdIHUT3PEvZGwQ'
// // const token = '6085919277:AAGvJfRHmmSVj9FZJFOnhKWaJgJRrc1UwkI'
// const bot = new TelegramBot(token, { polling: true })
// const chatForOrdersId = '-1001731459101'
// // const chatForOrdersId = '-1002123218064'
// const fs = require('fs')

// const clothes = JSON.parse(fs.readFileSync('clothes.json', 'utf8'))
// const navsText = JSON.parse(fs.readFileSync('navigationItemsText.json', 'utf8'))
// const navigationItems = JSON.parse(
// 	fs.readFileSync('navigationItems.json', 'utf8')
// )

// const app = express()

// app.get('/users', (req, res) => {
// 	const users = fs.readFileSync('users.json', 'utf-8')

// 	res.json({
// 		data: users,
// 	})
// })

// app.listen('3000', () => {
// 	console.log('server was started')
// })

// // Головне меню
// const mainMenu = {
// 	keyboard: navsText.map(navText => {
// 		return [{ text: navText.value }]
// 	}),
// 	resize_keyboard: true,
// }

// function getRandomInt(min, max) {
// 	min = Math.ceil(min)
// 	max = Math.floor(max)
// 	return Math.floor(Math.random() * (max - min + 1)) + min
// }

// async function sendItemDescription(
// 	chatId,
// 	itemName,
// 	itemPrice,
// 	itemImages,
// 	itemId,
// 	category
// ) {
// 	const itemMessage = `${itemName}\nЦіна: ${itemPrice} грн`

// 	// Преобразовываем массив URL-ов фотографий в массив объектов с типом 'photo'
// 	const media = itemImages.map(photoUrl => ({
// 		media: `https://545style.com${photoUrl}`,
// 		type: 'photo',
// 		caption: itemMessage, // Добавляем название и цену товара
// 		parse_mode: 'Markdown',
// 	}))

// 	// Опции для группы фотографий
// 	const itemOptions = {
// 		reply_markup: {
// 			inline_keyboard: [
// 				[
// 					{
// 						text: 'Купити',
// 						callback_data: `buy ${category} ${itemId}`,
// 					},
// 					{
// 						text: 'Подивитись більше фоток',
// 						callback_data: `more_photos ${category} ${itemId}`,
// 					},
// 				],
// 			],
// 		},
// 	}

// 	try {
// 		// Відправляємо групу фото
// 		await bot.sendPhoto(chatId, media[0].media)
// 		// await bot.sendPhoto(chatId, media[0].media, {
// 		// 	caption: itemMessage,
// 		// 	...itemOptions,
// 		// })

// 		// Отправляем текстовое сообщение
// 		await bot.sendMessage(chatId, itemMessage, itemOptions)
// 	} catch (error) {
// 		console.error('Помилка при відправці групи фото:', error)
// 	}
// }

// const state = {}
// bot.on('message', async msg => {
// 	const chatId = msg.chat.id
// 	console.log(state[chatId])

// 	if (msg.photo) {
// 		if (
// 			!!state[chatId]?.productName &&
// 			!!state[chatId]?.paymentType &&
// 			!!state[chatId]?.phoneNumber &&
// 			!!state[chatId]?.size &&
// 			!!state[chatId]?.fullName &&
// 			!!state[chatId]?.city &&
// 			!!state[chatId]?.mail
// 		) {
// 			const photo = msg.photo[msg.photo.length - 1]
// 			const fileId = photo.file_id
// 			console.log(1)
// 			await bot.getFile(fileId).then(async fileInfo => {
// 				const fileUrl = `https://api.telegram.org/file/bot${token}/${fileInfo.file_path}`

// 				// Загружаем изображение
// 				https.get(fileUrl, response => {
// 					if (response.statusCode !== 200) {
// 						console.error(
// 							'Failed to download image. HTTP Status Code:',
// 							response.statusCode
// 						)
// 						return
// 					}

// 					let imageData = Buffer.from([])

// 					// Собираем данные изображения в буфер
// 					response.on('data', chunk => {
// 						imageData = Buffer.concat([imageData, chunk])
// 					})
// 					console.log(2)

// 					// Обработка события завершения загрузки изображения
// 					response.on('end', () => {
// 						// Обрабатываем изображение с помощью sharp в памяти
// 						Jimp.read(imageData, async (err, image) => {
// 							if (!err) {
// 								console.log(3)

// 								const processedImageBuffer = await image.getBufferAsync(
// 									Jimp.AUTO
// 								)

// 								// Пересылаем обработанное изображение в другой чат
// 								bot.sendPhoto(chatForOrdersId, processedImageBuffer, {
// 									caption: `
// 																			\n Ім'я: ${state[chatId]?.fullName}
// 																			\nНомер телефону: ${state[chatId]?.phoneNumber}
// 																			\nМісто: ${state[chatId]?.city}
// 																			\nВідділення пошти: ${state[chatId]?.mail}
// 																			\nТовар: ${state[chatId]?.productName}
//                                       \Розмір: ${state[chatId]?.size}
// 																			\nТип оплати: ${state[chatId]?.paymentType === 'imposed' ? 'наложка' : 'онлайн'}
// 																			\nUPD: товар замовили за допомогою бота
// 																	`,
// 								})
// 								console.log(4)

// 								await bot.sendMessage(
// 									chatId,
// 									`Ви успішно замовили: ${state[chatId]?.productName}!`
// 								)
// 								console.log(5)

// 								if (
// 									state[chatId]?.productName ===
// 									'Тактичні штани 5.45style піксель жіночі'
// 								) {
// 									const category = '/futbolky/'

// 									const clothe = clothes[category].find(
// 										clothe =>
// 											clothe.name ===
// 											'Тактичний лонгслів жіночий 5.45style піксель'
// 									)

// 									const itemOptions = {
// 										reply_markup: {
// 											inline_keyboard: [
// 												[
// 													{
// 														text: 'Так',
// 														callback_data: `is_want_induct true ${category} ${clothe.id}`,
// 													},
// 													{
// 														text: 'Ні, повернутись назад',
// 														callback_data: `is_want_induct false`,
// 													},
// 												],
// 											],
// 										},
// 									}

// 									await bot.sendMessage(
// 										chatId,
// 										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
// 									)

// 									await bot.sendMessage(
// 										chatId,
// 										`Бажаєте ознайомитись з товаром?`,
// 										itemOptions
// 									)
// 								} else if (
// 									state[chatId]?.productName ===
// 									'Тактичний утеплений лонгслів 5.45style з місцем під жетон'
// 								) {
// 									const category = '/shtany/'

// 									const clothe = clothes[category].find(
// 										clothe => clothe.name === 'Штани Soft Shell на флісі чорні'
// 									)
// 									const itemOptions = {
// 										reply_markup: {
// 											inline_keyboard: [
// 												[
// 													{
// 														text: 'Так',
// 														callback_data: `is_want_induct true ${category} ${clothe.id}`,
// 													},
// 													{
// 													text: 'Ні, повернутись назад',
// 														callback_data: `is_want_induct false`,
// 													},
// 												],
// 											],
// 										},
// 									}

// 									await bot.sendMessage(
// 										chatId,
// 										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
// 									)

// 									await bot.sendMessage(
// 										chatId,
// 										`Бажаєте ознайомитись з товаром?`,
// 										itemOptions
// 									)
// 								} else if (
// 									state[chatId]?.productName ===
// 									'Штани Soft Shell на флісі чорні'
// 								) {
// 									const category = '/futbolky/'

// 									const clothe = clothes[category].find(
// 										clothe =>
// 											clothe.name ===
// 											'Тактичний утеплений лонгслів 5.45style з місцем під жетон'
// 									)
// 									const itemOptions = {
// 										reply_markup: {
// 											inline_keyboard: [
// 												[
// 													{
// 														text: 'Так',
// 														callback_data: `is_want_induct true ${category} ${clothe.id}`,
// 													},
// 													{
// 													text: 'Ні, повернутись назад',
// 														callback_data: `is_want_induct false`,
// 													},
// 												],
// 											],
// 										},
// 									}

// 									await bot.sendMessage(
// 										chatId,
// 										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
// 									)

// 									await bot.sendMessage(
// 										chatId,
// 										`Бажаєте ознайомитись з товаром?`,
// 										itemOptions
// 									)
// 								} else if (
// 									state[chatId]?.productName ===
// 									'Тактичний лонгслів 5.45style синій жіночий'
// 								) {
// 									const category = '/shtany/'

// 									const clothe = clothes[category].find(
// 										clothe =>
// 											clothe.name ===
// 											'Тактичні штани 5.45style темно-сині жіночі'
// 									)
// 									const itemOptions = {
// 										reply_markup: {
// 											inline_keyboard: [
// 												[
// 													{
// 														text: 'Так',
// 														callback_data: `is_want_induct true ${category} ${clothe.id}`,
// 													},
// 													{
// 													text: 'Ні, повернутись назад',
// 														callback_data: `is_want_induct false`,
// 													},
// 												],
// 											],
// 										},
// 									}

// 									await bot.sendMessage(
// 										chatId,
// 										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
// 									)

// 									await bot.sendMessage(
// 										chatId,
// 										`Бажаєте ознайомитись з товаром?`,
// 										itemOptions
// 									)
// 								} else if (
// 									state[chatId]?.productName ===
// 									'Тактичний лонгслів 5.45style black із жетоном'
// 								) {
// 									const category = '/shtany/'

// 									const clothe = clothes[category].find(
// 										clothe =>
// 											clothe.name === 'Тактичні штани 5.45style чорні жіночі'
// 									)
// 									const itemOptions = {
// 										reply_markup: {
// 											inline_keyboard: [
// 												[
// 													{
// 														text: 'Так',
// 														callback_data: `is_want_induct true ${category} ${clothe.id}`,
// 													},
// 													{
// 													text: 'Ні, повернутись назад',
// 														callback_data: `is_want_induct false`,
// 													},
// 												],
// 											],
// 										},
// 									}

// 									await bot.sendMessage(
// 										chatId,
// 										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
// 									)

// 									await bot.sendMessage(
// 										chatId,
// 										`Бажаєте ознайомитись з товаром?`,
// 										itemOptions
// 									)
// 								} else if (
// 									state[chatId]?.productName ===
// 									'Тактичні штани 5.45style чорні жіночі'
// 								) {
// 									const category = '/futbolky/'

// 									const clothe = clothes[category].find(
// 										clothe =>
// 											clothe.name ===
// 											'Тактичний лонгслів 5.45style black із жетоном'
// 									)

// 									console.log(clothe)

// 									const itemOptions = {
// 										reply_markup: {
// 											inline_keyboard: [
// 												[
// 													{
// 														text: 'Так',
// 														callback_data: `is_want_induct true ${category} ${clothe.id}`,
// 													},
// 													{
// 												text: 'Ні, повернутись назад',
// 														callback_data: `is_want_induct false`,
// 													},
// 												],
// 											],
// 										},
// 									}

// 									await bot.sendMessage(
// 										chatId,
// 										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
// 									)

// 									await bot.sendMessage(
// 										chatId,
// 										`Бажаєте ознайомитись з товаром?`,
// 										itemOptions
// 									)
// 								} else if (
// 									state[chatId]?.productName ===
// 									'Тактичні штани 5.45style темно-сині жіночі'
// 								) {
// 									const category = '/futbolky/'

// 									const clothe = clothes[category].find(
// 										clothe =>
// 											clothe.name ===
// 											'Тактичний лонгслів 5.45style синій жіночий'
// 									)
// 									const itemOptions = {
// 										reply_markup: {
// 											inline_keyboard: [
// 												[
// 													{
// 														text: 'Так',
// 														callback_data: `is_want_induct true ${category} ${clothe.id}`,
// 													},
// 													{
// 													text: 'Ні, повернутись назад',
// 														callback_data: `is_want_induct false`,
// 													},
// 												],
// 											],
// 										},
// 									}

// 									await bot.sendMessage(
// 										chatId,
// 										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
// 									)

// 									await bot.sendMessage(
// 										chatId,
// 										`Бажаєте ознайомитись з товаром?`,
// 										itemOptions
// 									)
// 								} else if (
// 									state[chatId]?.productName ===
// 									'Тактичний лонгслів 5.45style жіночий black'
// 								) {
// 									const category = '/shtany/'

// 									const clothe = clothes[category].find(
// 										clothe =>
// 											clothe.name === 'Тактичні штани 5.45style чорні жіночі'
// 									)
// 									const itemOptions = {
// 										reply_markup: {
// 											inline_keyboard: [
// 												[
// 													{
// 														text: 'Так',
// 														callback_data: `is_want_induct true ${category} ${clothe.id}`,
// 													},
// 													{
// 														text: 'Ні, повернутись назад',
// 														callback_data: `is_want_induct false`,
// 													},
// 												],
// 											],
// 										},
// 									}

// 									await bot.sendMessage(
// 										chatId,
// 										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
// 									)

// 									await bot.sendMessage(
// 										chatId,
// 										`Бажаєте ознайомитись з товаром?`,
// 										itemOptions
// 									)
// 								} else if (
// 									state[chatId]?.productName ===
// 									'Тактичні штани 5.45style чорні жіночі'
// 								) {
// 									const category = '/futbolky/'

// 									const clothe = clothes[category].find(
// 										clothe =>
// 											clothe.name ===
// 											'Тактичний лонгслів 5.45style жіночий black'
// 									)
// 									const itemOptions = {
// 										reply_markup: {
// 											inline_keyboard: [
// 												[
// 													{
// 														text: 'Так',
// 														callback_data: `is_want_induct true ${category} ${clothe.id}`,
// 													},
// 													{
// 													text: 'Ні, повернутись назад',
// 														callback_data: `is_want_induct false`,
// 													},
// 												],
// 											],
// 										},
// 									}

// 									await bot.sendMessage(
// 										chatId,
// 										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
// 									)

// 									await bot.sendMessage(
// 										chatId,
// 										`Бажаєте ознайомитись з товаром?`,
// 										itemOptions
// 									)
// 								} else if (
// 									state[chatId]?.productName === 'Куртка Soft Shell олива'
// 								) {
// 									const category = '/shtany/'

// 									const clothe = clothes[category].find(
// 										clothe => clothe.name === 'Штани Soft Shell на флісі олива'
// 									)
// 									const itemOptions = {
// 										reply_markup: {
// 											inline_keyboard: [
// 												[
// 													{
// 														text: 'Так',
// 														callback_data: `is_want_induct true ${category} ${clothe.id}`,
// 													},
// 													{
// 											text: 'Ні, повернутись назад',
// 														callback_data: `is_want_induct false`,
// 													},
// 												],
// 											],
// 										},
// 									}

// 									await bot.sendMessage(
// 										chatId,
// 										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
// 									)

// 									await bot.sendMessage(
// 										chatId,
// 										`Бажаєте ознайомитись з товаром?`,
// 										itemOptions
// 									)
// 								} else if (
// 									state[chatId]?.productName ===
// 									'Штани Soft Shell на флісі олива'
// 								) {
// 									const category = '/kurtky/'

// 									const clothe = clothes[category].find(
// 										clothe => clothe.name === 'Куртка Soft Shell олива'
// 									)
// 									const itemOptions = {
// 										reply_markup: {
// 											inline_keyboard: [
// 												[
// 													{
// 														text: 'Так',
// 														callback_data: `is_want_induct true ${category} ${clothe.id}`,
// 													},
// 													{
// 														text: 'Ні, повернутись назад',
// 														callback_data: `is_want_induct false`,
// 													},
// 												],
// 											],
// 										},
// 									}

// 									await bot.sendMessage(
// 										chatId,
// 										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
// 									)

// 									await bot.sendMessage(
// 										chatId,
// 										`Бажаєте ознайомитись з товаром?`,
// 										itemOptions
// 									)
// 								} else if (
// 									state[chatId]?.productName ===
// 									'Тактичний лонгслів жіночий 5.45style піксель'
// 								) {
// 									const category = '/shtany/'

// 									const clothe = clothes[category].find(
// 										clothe =>
// 											clothe.name === 'Тактичні штани 5.45style піксель жіночі'
// 									)
// 									const itemOptions = {
// 										reply_markup: {
// 											inline_keyboard: [
// 												[
// 													{
// 														text: 'Так',
// 														callback_data: `is_want_induct true ${category} ${clothe.id}`,
// 													},
// 													{
// 													text: 'Ні, повернутись назад',
// 														callback_data: `is_want_induct false`,
// 													},
// 												],
// 											],
// 										},
// 									}

// 									await bot.sendMessage(
// 										chatId,
// 										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
// 									)

// 									await bot.sendMessage(
// 										chatId,
// 										`Бажаєте ознайомитись з товаром?`,
// 										itemOptions
// 									)
// 								} else if (
// 									state[chatId]?.productName ===
// 									'Тактичні штани 5.45style піксель жіночі'
// 								) {
// 									const category = '/futbolky/'

// 									const clothe = clothes[category].find(
// 										clothe =>
// 											clothe.name ===
// 											'Тактичний лонгслів жіночий 5.45style піксель'
// 									)
// 									const itemOptions = {
// 										reply_markup: {
// 											inline_keyboard: [
// 												[
// 													{
// 														text: 'Так',
// 														callback_data: `is_want_induct true ${category} ${clothe.id}`,
// 													},
// 													{
// 														text: 'Ні, повернутись назад',
// 														callback_data: `is_want_induct false`,
// 													},
// 												],
// 											],
// 										},
// 									}

// 									await bot.sendMessage(
// 										chatId,
// 										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
// 									)

// 									await bot.sendMessage(
// 										chatId,
// 										`Бажаєте ознайомитись з товаром?`,
// 										itemOptions
// 									)
// 								} else if (
// 									state[chatId]?.productName === 'Лонслів НГУ жіночий 5.45style'
// 								) {
// 									const category = '/shtany/'

// 									const clothe = clothes[category].find(
// 										clothe =>
// 											clothe.name ===
// 											'Тактичні штани 5.45style жіночі олива (хакі)'
// 									)
// 									const itemOptions = {
// 										reply_markup: {
// 											inline_keyboard: [
// 												[
// 													{
// 														text: 'Так',
// 														callback_data: `is_want_induct true ${category} ${clothe.id}`,
// 													},
// 													{
// 													text: 'Ні, повернутись назад',
// 														callback_data: `is_want_induct false`,
// 													},
// 												],
// 											],
// 										},
// 									}

// 									await bot.sendMessage(
// 										chatId,
// 										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
// 									)

// 									await bot.sendMessage(
// 										chatId,
// 										`Бажаєте ознайомитись з товаром?`,
// 										itemOptions
// 									)
// 								} else if (
// 									state[chatId]?.productName ===
// 									'Тактичні штани 5.45style жіночі олива (хакі)'
// 								) {
// 									const category = '/futbolky/'

// 									const clothe = clothes[category].find(
// 										clothe => clothe.name === 'Лонслів НГУ жіночий 5.45style'
// 									)
// 									const itemOptions = {
// 										reply_markup: {
// 											inline_keyboard: [
// 												[
// 													{
// 														text: 'Так',
// 														callback_data: `is_want_induct true ${category} ${clothe.id}`,
// 													},
// 													{
// 													text: 'Ні, повернутись назад',
// 														callback_data: `is_want_induct false`,
// 													},
// 												],
// 											],
// 										},
// 									}

// 									await bot.sendMessage(
// 										chatId,
// 										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
// 									)

// 									await bot.sendMessage(
// 										chatId,
// 										`Бажаєте ознайомитись з товаром?`,
// 										itemOptions
// 									)
// 								} else if (
// 									state[chatId]?.productName ===
// 									'Тактичний лонгслів жіночий 5.45style піксель'
// 								) {
// 									const category = '/shtany/'

// 									const clothe = clothes[category].find(
// 										clothe =>
// 											clothe.name === 'Тактичні штани 5.45style піксель жіночі'
// 									)
// 									const itemOptions = {
// 										reply_markup: {
// 											inline_keyboard: [
// 												[
// 													{
// 														text: 'Так',
// 														callback_data: `is_want_induct true ${category} ${clothe.id}`,
// 													},
// 													{
// 												text: 'Ні, повернутись назад',
// 														callback_data: `is_want_induct false`,
// 													},
// 												],
// 											],
// 										},
// 									}

// 									await bot.sendMessage(
// 										chatId,
// 										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
// 									)

// 									await bot.sendMessage(
// 										chatId,
// 										`Бажаєте ознайомитись з товаром?`,
// 										itemOptions
// 									)
// 								} else if (
// 									state[chatId]?.productName ===
// 									'Тактичний утеплений лонгслів 5.45style з місцем під жетон'
// 								) {
// 									const category = '/shtany/'

// 									const clothe = clothes[category].find(
// 										clothe =>
// 											clothe.name === 'Тактичні штани 5.45style чорні жіночі'
// 									)
// 									const itemOptions = {
// 										reply_markup: {
// 											inline_keyboard: [
// 												[
// 													{
// 														text: 'Так',
// 														callback_data: `is_want_induct true ${category} ${clothe.id}`,
// 													},
// 													{
// 														text: 'Ні, повернутись назад',
// 														callback_data: `is_want_induct false`,
// 													},
// 												],
// 											],
// 										},
// 									}

// 									await bot.sendMessage(
// 										chatId,
// 										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
// 									)

// 									await bot.sendMessage(
// 										chatId,
// 										`Бажаєте ознайомитись з товаром?`,
// 										itemOptions
// 									)
// 								} else if (
// 									state[chatId]?.productName ===
// 									'Тактичні штани 5.45style чорні жіночі'
// 								) {
// 									const category = '/futbolky/'

// 									const clothe = clothes[category].find(
// 										clothe =>
// 											clothe.name ===
// 											'Тактичний утеплений лонгслів 5.45style з місцем під жетон'
// 									)
// 									const itemOptions = {
// 										reply_markup: {
// 											inline_keyboard: [
// 												[
// 													{
// 														text: 'Так',
// 														callback_data: `is_want_induct true ${category} ${clothe.id}`,
// 													},
// 													{
// 												text: 'Ні, повернутись назад',
// 														callback_data: `is_want_induct false`,
// 													},
// 												],
// 											],
// 										},
// 									}

// 									await bot.sendMessage(
// 										chatId,
// 										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
// 									)

// 									await bot.sendMessage(
// 										chatId,
// 										`Бажаєте ознайомитись з товаром?`,
// 										itemOptions
// 									)
// 								} else {
// 									const category = '/holovni-ubory/'
// 									const isManClothe =
// 										!state[chatId]?.productName.includes('жіноч')

// 									const manOrWomanClothes = clothes[category].filter(clothe =>
// 										!isManClothe
// 											? clothe.name.includes('жіноч')
// 											: !clothe.name.includes('жіноч')
// 									)

// 									const categoryClothesLength = manOrWomanClothes.length
// 									const idOfRandomClothe = getRandomInt(
// 										0,
// 										categoryClothesLength - 1
// 									)

// 									const randomClothe = manOrWomanClothes.find(
// 										(clothe, i) => i === Number(idOfRandomClothe)
// 									)

// 									const itemOptions = {
// 										reply_markup: {
// 											inline_keyboard: [
// 												[
// 													{
// 														text: 'Так',
// 														callback_data: `is_want_induct true ${category} ${randomClothe.id}`,
// 													},
// 													{
// 							text: 'Ні, повернутись назад',
// 														callback_data: `is_want_induct false`,
// 													},
// 												],
// 											],
// 										},
// 									}

// 									await bot.sendMessage(
// 										chatId,
// 										`Разом з товаром що ви обрали найчастіше замовлять: ${randomClothe.name}!`
// 									)

// 									await bot.sendMessage(
// 										chatId,
// 										`Бажаєте ознайомитись з товаром?`,
// 										itemOptions
// 									)
// 								}
// 								console.log(6)
// 								state[chatId] = {}
// 								return
// 							} else {
// 								console.error('Error processing image:', err)
// 							}
// 						})
// 					})
// 				})
// 			})
// 		}
// 	}

// 	if (msg.text === '/start') {
// 		await bot.sendMessage(chatId, 'Вітаємо вас 👋')
// 	}

// 	if (msg.text === '/start' || msg.text === 'Назад до головного меню') {
// 		console.log('state undef 2')
// 		state[chatId] = {}
// 		await bot.sendMessage(
// 			chatId,
// 			'Виберіть розділ, щоб вивести перелік товарів:',
// 			{
// 				reply_markup: mainMenu,
// 			}
// 		)
// 	}

// 	if (
// 		!!navsText.find(navText => {
// 			return navText.value === msg.text
// 		})
// 	) {
// 		console.log('state undef 3')
// 		state[chatId] = {}

// 		let indexOfActiveClothe = null

// 		navsText.forEach((navText, i) => {
// 			if (navText.value === msg.text) {
// 				indexOfActiveClothe = i
// 			}
// 		})

// 		state[chatId].clothe = navigationItems[indexOfActiveClothe].value

// 		// Отправляем inline-клавиатуру для выбора "утепленных" и "неутепленных" кофт
// 		await bot.sendMessage(chatId, 'Виберіть тип одягу:', {
// 			reply_markup: {
// 				inline_keyboard: [
// 					[
// 						{ text: 'Утеплені', callback_data: 'warm' },
// 						{ text: 'Неутеплені', callback_data: 'not_warm' },
// 					],
// 				],
// 			},
// 		})
// 	}
// })

// // Обработка inline-клавиатуры
// bot.on('callback_query', async query => {
// 	const chatId = query.message.chat.id
// 	const clothingType = query.data
// 	const clothe = state[chatId].clothe

// 	// Обработка выбора типа кофт
// 	if (clothingType === 'warm' || clothingType === 'not_warm') {
// 		const category = clothe
// 		const clothesByCategory = clothes[category]
// 		let isClotheExists = false

// 		if (!clothesByCategory) {
// 			return await bot.sendMessage(
// 				chatId,
// 				'Таких товарів зараз нема у наявності'
// 			)
// 		}

// 		if (clothingType === 'warm') {
// 			for (const clothe of clothesByCategory) {
// 				if (clothe.isWarm) {
// 					isClotheExists = true
// 					await sendItemDescription(
// 						chatId,
// 						clothe.name,
// 						clothe.price,
// 						clothe.imageSrcs,
// 						clothe.id,
// 						category
// 					)
// 				}
// 			}
// 		}

// 		if (clothingType === 'not_warm') {
// 			for (const clothe of clothesByCategory) {
// 				if (!clothe.isWarm) {
// 					isClotheExists = true

// 					await sendItemDescription(
// 						chatId,
// 						clothe.name,
// 						clothe.price,
// 						clothe.imageSrcs,
// 						clothe.id,
// 						category
// 					)
// 				}
// 			}
// 		}

// 		if (!isClotheExists) {
// 			return await bot.sendMessage(
// 				chatId,
// 				'Таких товарів зараз нема у наявності'
// 			)
// 		}

// 		// bot.sendMessage(
// 		// 	chatId,
// 		// 	'Натисніть "Назад до головного меню", щоб повернутися',
// 		// 	{
// 		// 		reply_markup: {
// 		// 			keyboard: [['Назад до головного меню']],
// 		// 			resize_keyboard: true,
// 		// 			one_time_keyboard: true,
// 		// 		},
// 		// 	}
// 		// )
// 	}

// 	// обработка кнопки buy
// 	if (clothingType.split(' ')[0] === 'buy') {
// 		const productCategory = clothingType.split(' ')[1]
// 		const productId = clothingType.split(' ')[2]
// 		const clothesByCategory = clothes[productCategory]
// 		const orderedProduct = clothesByCategory.find(clothe => {
// 			return Number(clothe.id) === Number(productId)
// 		})

// 		state[chatId].productName = orderedProduct.name

// 		await bot.sendMessage(
// 			chatId,
// 			`Ви обрали: "${state[chatId].productName}"`,
// 			{}
// 		)
// 		await bot.sendMessage(chatId, 'Оберіть спосіб платежу:', {
// 			reply_markup: {
// 				inline_keyboard: [
// 					[
// 						{
// 							text: 'Накладений',
// 							callback_data: `payment-type imposed`,
// 						},
// 						{
// 							text: 'Онлайн',
// 							callback_data: `payment-type online`,
// 						},
// 					],
// 				],
// 			},
// 		})
// 	}
// 	// обработка типа платежа
// 	if (clothingType.split(' ')[0] === 'payment-type') {
// 		const firstSpaceIndex = clothingType.indexOf(' ')
// 		const paymentType =
// 			firstSpaceIndex !== -1
// 				? clothingType.slice(firstSpaceIndex + 1)
// 				: clothingType

// 		// const productName = clothingType.split(' ')[1]

// 		state[chatId].paymentType = paymentType

// 		bot.sendMessage(chatId, 'Напишіть ваш номер телефону')
// 	}

// 	// обработка типа платежа
// 	if (clothingType.split(' ')[0] === 'more_photos') {
// 		const productCategory = clothingType.split(' ')[1]
// 		const productId = clothingType.split(' ')[2]
// 		const clothesByCategory = clothes[productCategory]
// 		const orderedProduct = clothesByCategory.find(clothe => {
// 			return Number(clothe.id) === Number(productId)
// 		})

// 		const itemOptions = {
// 			reply_markup: {
// 				inline_keyboard: [
// 					[
// 						{
// 							text: 'Купити',
// 							callback_data: `buy ${productCategory} ${productId}`,
// 						},
// 					],
// 				],
// 			},
// 		}

// 		const media = orderedProduct.imageSrcs.map(photoUrl => ({
// 			media: `https://545style.com${photoUrl}`,
// 			type: 'photo',
// 			caption: '1', // Добавляем название и цену товара
// 			parse_mode: 'Markdown',
// 		}))

// 		await bot.sendMessage(chatId, `Більше фоток для "${orderedProduct.name}"`)
// 		await bot.sendMediaGroup(chatId, media)
// 		await bot.sendMessage(
// 			chatId,
// 			`Натисніть кнопку "Купити", щоб придбати товар`,
// 			itemOptions
// 		)
// 	}

// 	if (clothingType.split(' ')[0] === 'is_want_induct') {
// 		if (eval(clothingType.split(' ')[1])) {
// 			const productCategory = clothingType.split(' ')[2]
// 			const productId = clothingType.split(' ')[3]
// 			const clothesByCategory = clothes[productCategory]
// 			const orderedProduct = clothesByCategory.find(clothe => {
// 				return Number(clothe.id) === Number(productId)
// 			})

// 			await sendItemDescription(
// 				chatId,
// 				orderedProduct.name,
// 				orderedProduct.price,
// 				orderedProduct.imageSrcs,
// 				orderedProduct.id,
// 				productCategory
// 			)
// 		} else {
// 			bot.sendMessage(chatId, 'Дякуємо за ваше замовлення',{
// 				reply_markup: mainMenu,
// 			})
// 		}
// 	}
// })

// // Обработка ответа на запрос данных пользователя
// bot.on('text', async msg => {
// 	const chatId = msg.chat.id
// 	console.log(state[chatId])

// 	if (
// 		!!state[chatId]?.productName &&
// 		!!state[chatId]?.paymentType &&
// 		!state[chatId]?.phoneNumber
// 	) {
// 		state[chatId].phoneNumber = msg.text

// 		bot.sendMessage(chatId, `Укажіть розмір`)
// 		return
// 	}
// 	if (
// 		!!state[chatId]?.productName &&
// 		!!state[chatId]?.paymentType &&
// 		!!state[chatId]?.phoneNumber &&
// 		!state[chatId]?.size
// 	) {
// 		state[chatId].size = msg.text

// 		bot.sendMessage(chatId, `Укажіть ваш ПІБ`)
// 		return
// 	}
// 	if (
// 		!!state[chatId]?.productName &&
// 		!!state[chatId]?.paymentType &&
// 		!!state[chatId]?.phoneNumber &&
// 		!!state[chatId]?.size &&
// 		!state[chatId]?.fullName
// 	) {
// 		state[chatId].fullName = msg.text

// 		bot.sendMessage(chatId, `Укажіть ваше місто`)
// 		return
// 	}
// 	if (
// 		!!state[chatId]?.productName &&
// 		!!state[chatId]?.paymentType &&
// 		!!state[chatId]?.phoneNumber &&
// 		!!state[chatId]?.size &&
// 		!!state[chatId]?.fullName &&
// 		!state[chatId]?.city
// 	) {
// 		state[chatId].city = msg.text

// 		bot.sendMessage(chatId, `Укажіть відділення пошти`)
// 		return
// 	}
// 	if (
// 		!!state[chatId]?.productName &&
// 		!!state[chatId]?.paymentType &&
// 		!!state[chatId]?.phoneNumber &&
// 		!!state[chatId]?.size &&
// 		!!state[chatId]?.fullName &&
// 		!!state[chatId]?.city &&
// 		!state[chatId]?.mail
// 	) {
// 		state[chatId].mail = msg.text

// 		if (state[chatId]?.paymentType === 'imposed') {
// 			await bot.sendMessage(
// 				chatId,
// 				`
// 			Надішліть передоплату у розмірі 200грн на
// 			карту: 5375411402901206 Терез А.
// 			або
// 			на IBAN: ФОП Терез Артем Володимирович IBAN UA053220010000026004320012081 ІПН/ЄДРПОУ 3392401775 Акціонерне товариство УНІВЕРСАЛ БАНК МФО 322001 ЄДРПОУ Банку 21133352

// 			Після оплати надішліть фото квитанції у бота!
// 			`
// 			)
// 		} else {
// 			await bot.sendMessage(
// 				chatId,
// 				`
// 			Надішліть оплату на
// 			карту: 5375411402901206 Терез А.
// 			або
// 			на IBAN: ФОП Терез Артем Володимирович IBAN UA053220010000026004320012081 ІПН/ЄДРПОУ 3392401775 Акціонерне товариство УНІВЕРСАЛ БАНК МФО 322001 ЄДРПОУ Банку 21133352

// 			Після оплати надішліть фото квитанції у бота!
// 			`
// 			)
// 		}
// 	}
// })

// ---------------------
const TelegramBot = require('node-telegram-bot-api')
const https = require('https')
const Jimp = require('jimp')
const express = require('express')

const token = '7225387110:AAH9KTu9WttDVa9Uc1SYb_13IUnlZsHXGgo'
// const token = '6965202334:AAEcJYVXE_NehXzEZ2NtjjdIHUT3PEvZGwQ'
// const token = '6085919277:AAGvJfRHmmSVj9FZJFOnhKWaJgJRrc1UwkI'
const bot = new TelegramBot(token, { polling: true })
const chatForOrdersId = '-1002480234590'
// const chatForOrdersId = '-1001731459101'
// const chatForOrdersId = '-1002123218064'
const fs = require('fs')

const clothes = JSON.parse(fs.readFileSync('clothes.json', 'utf8'))
const navsText = JSON.parse(fs.readFileSync('navigationItemsText.json', 'utf8'))
const navigationItems = JSON.parse(
	fs.readFileSync('navigationItems.json', 'utf8')
)

const app = express()

app.get('/users', (req, res) => {
	const users = fs.readFileSync('users.json', 'utf-8')

	res.json({
		data: users,
	})
})

app.listen('3000', () => {
	console.log('server was started')
})

// Головне меню
const mainMenu = {
	keyboard: navsText.map(navText => {
		return [{ text: navText.value }]
	}),
	resize_keyboard: true,
}

function getRandomInt(min, max) {
	min = Math.ceil(min)
	max = Math.floor(max)
	return Math.floor(Math.random() * (max - min + 1)) + min
}

async function sendItemDescription(
	chatId,
	itemName,
	itemPrice,
	itemImages,
	itemId,
	category
) {
	const itemMessage = `${itemName}\nЦіна: ${itemPrice} грн`

	// Преобразовываем массив URL-ов фотографий в массив объектов с типом 'photo'
	const media = itemImages.map(photoUrl => ({
		media: `https://545style.com${photoUrl}`,
		type: 'photo',
		caption: itemMessage, // Добавляем название и цену товара
		parse_mode: 'Markdown',
	}))

	// Опции для группы фотографий
	const itemOptions = {
		reply_markup: {
			inline_keyboard: [
				[
					{
						text: 'Купити',
						callback_data: `buy ${category} ${itemId}`,
					},
					{
						text: 'Подивитись більше фоток',
						callback_data: `more_photos ${category} ${itemId}`,
					},
				],
			],
		},
	}

	try {
		// Відправляємо групу фото
		await bot.sendPhoto(chatId, media[0].media)
		// await bot.sendPhoto(chatId, media[0].media, {
		// 	caption: itemMessage,
		// 	...itemOptions,
		// })

		// Отправляем текстовое сообщение
		await bot.sendMessage(chatId, itemMessage, itemOptions)
	} catch (error) {
		console.error('Помилка при відправці групи фото:', error)
	}
}

const state = {}
bot.on('message', async msg => {
	const chatId = msg.chat.id
	console.log(state[chatId])

	if (msg.photo) {
		if (
			!!state[chatId]?.productName &&
			!!state[chatId]?.paymentType &&
			!!state[chatId]?.phoneNumber &&
			!!state[chatId]?.size &&
			!!state[chatId]?.fullName &&
			!!state[chatId]?.city &&
			!!state[chatId]?.mail
		) {
			const photo = msg.photo[msg.photo.length - 1]
			const fileId = photo.file_id
			console.log(1)
			await bot.getFile(fileId).then(async fileInfo => {
				const fileUrl = `https://api.telegram.org/file/bot${token}/${fileInfo.file_path}`

				// Загружаем изображение
				https.get(fileUrl, response => {
					if (response.statusCode !== 200) {
						console.error(
							'Failed to download image. HTTP Status Code:',
							response.statusCode
						)
						return
					}

					let imageData = Buffer.from([])

					// Собираем данные изображения в буфер
					response.on('data', chunk => {
						imageData = Buffer.concat([imageData, chunk])
					})
					console.log(2)

					// Обработка события завершения загрузки изображения
					response.on('end', () => {
						// Обрабатываем изображение с помощью sharp в памяти
						Jimp.read(imageData, async (err, image) => {
							if (!err) {
								console.log(3)

								const processedImageBuffer = await image.getBufferAsync(
									Jimp.AUTO
								)

								// Пересылаем обработанное изображение в другой чат
								bot.sendPhoto(chatForOrdersId, processedImageBuffer, {
									caption: `
																			\n Ім'я: ${state[chatId]?.fullName}
																			\nНомер телефону: ${state[chatId]?.phoneNumber}
																			\nМісто: ${state[chatId]?.city}
																			\nВідділення пошти: ${state[chatId]?.mail}
																			\nТовар: ${state[chatId]?.productName}
                                      \Розмір: ${state[chatId]?.size}
																			\nТип оплати: ${state[chatId]?.paymentType === 'imposed' ? 'наложка' : 'онлайн'}
																			\nUPD: товар замовили за допомогою бота
																	`,
								})
								console.log(4)

								await bot.sendMessage(
									chatId,
									`Ви успішно замовили: ${state[chatId]?.productName}!`
								)
								console.log(5)

								if (
									state[chatId]?.productName ===
									'Тактичні штани 5.45style піксель жіночі'
								) {
									const category = '/futbolky/'

									const clothe = clothes[category].find(
										clothe =>
											clothe.name ===
											'Тактичний лонгслів жіночий 5.45style піксель'
									)

									const itemOptions = {
										reply_markup: {
											inline_keyboard: [
												[
													{
														text: 'Так',
														callback_data: `is_want_induct true ${category} ${clothe.id}`,
													},
													{
														text: 'Ні, повернутись назад',
														callback_data: `is_want_induct false`,
													},
												],
											],
										},
									}

									await bot.sendMessage(
										chatId,
										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
									)

									await bot.sendMessage(
										chatId,
										`Бажаєте ознайомитись з товаром?`,
										itemOptions
									)
								} else if (
									state[chatId]?.productName ===
									'Тактичний утеплений лонгслів 5.45style з місцем під жетон'
								) {
									const category = '/shtany/'

									const clothe = clothes[category].find(
										clothe => clothe.name === 'Штани Soft Shell на флісі чорні'
									)
									const itemOptions = {
										reply_markup: {
											inline_keyboard: [
												[
													{
														text: 'Так',
														callback_data: `is_want_induct true ${category} ${clothe.id}`,
													},
													{
														text: 'Ні, повернутись назад',
														callback_data: `is_want_induct false`,
													},
												],
											],
										},
									}

									await bot.sendMessage(
										chatId,
										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
									)

									await bot.sendMessage(
										chatId,
										`Бажаєте ознайомитись з товаром?`,
										itemOptions
									)
								} else if (
									state[chatId]?.productName ===
									'Штани Soft Shell на флісі чорні'
								) {
									const category = '/futbolky/'

									const clothe = clothes[category].find(
										clothe =>
											clothe.name ===
											'Тактичний утеплений лонгслів 5.45style з місцем під жетон'
									)
									const itemOptions = {
										reply_markup: {
											inline_keyboard: [
												[
													{
														text: 'Так',
														callback_data: `is_want_induct true ${category} ${clothe.id}`,
													},
													{
														text: 'Ні, повернутись назад',
														callback_data: `is_want_induct false`,
													},
												],
											],
										},
									}

									await bot.sendMessage(
										chatId,
										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
									)

									await bot.sendMessage(
										chatId,
										`Бажаєте ознайомитись з товаром?`,
										itemOptions
									)
								} else if (
									state[chatId]?.productName ===
									'Тактичний лонгслів 5.45style синій жіночий'
								) {
									const category = '/shtany/'

									const clothe = clothes[category].find(
										clothe =>
											clothe.name ===
											'Тактичні штани 5.45style темно-сині жіночі'
									)
									const itemOptions = {
										reply_markup: {
											inline_keyboard: [
												[
													{
														text: 'Так',
														callback_data: `is_want_induct true ${category} ${clothe.id}`,
													},
													{
														text: 'Ні, повернутись назад',
														callback_data: `is_want_induct false`,
													},
												],
											],
										},
									}

									await bot.sendMessage(
										chatId,
										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
									)

									await bot.sendMessage(
										chatId,
										`Бажаєте ознайомитись з товаром?`,
										itemOptions
									)
								} else if (
									state[chatId]?.productName ===
									'Тактичний лонгслів 5.45style black із жетоном'
								) {
									const category = '/shtany/'

									const clothe = clothes[category].find(
										clothe =>
											clothe.name === 'Тактичні штани 5.45style чорні жіночі'
									)
									const itemOptions = {
										reply_markup: {
											inline_keyboard: [
												[
													{
														text: 'Так',
														callback_data: `is_want_induct true ${category} ${clothe.id}`,
													},
													{
														text: 'Ні, повернутись назад',
														callback_data: `is_want_induct false`,
													},
												],
											],
										},
									}

									await bot.sendMessage(
										chatId,
										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
									)

									await bot.sendMessage(
										chatId,
										`Бажаєте ознайомитись з товаром?`,
										itemOptions
									)
								} else if (
									state[chatId]?.productName ===
									'Тактичні штани 5.45style чорні жіночі'
								) {
									const category = '/futbolky/'

									const clothe = clothes[category].find(
										clothe =>
											clothe.name ===
											'Тактичний лонгслів 5.45style black із жетоном'
									)

									console.log(clothe)

									const itemOptions = {
										reply_markup: {
											inline_keyboard: [
												[
													{
														text: 'Так',
														callback_data: `is_want_induct true ${category} ${clothe.id}`,
													},
													{
														text: 'Ні, повернутись назад',
														callback_data: `is_want_induct false`,
													},
												],
											],
										},
									}

									await bot.sendMessage(
										chatId,
										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
									)

									await bot.sendMessage(
										chatId,
										`Бажаєте ознайомитись з товаром?`,
										itemOptions
									)
								} else if (
									state[chatId]?.productName ===
									'Тактичні штани 5.45style темно-сині жіночі'
								) {
									const category = '/futbolky/'

									const clothe = clothes[category].find(
										clothe =>
											clothe.name ===
											'Тактичний лонгслів 5.45style синій жіночий'
									)
									const itemOptions = {
										reply_markup: {
											inline_keyboard: [
												[
													{
														text: 'Так',
														callback_data: `is_want_induct true ${category} ${clothe.id}`,
													},
													{
														text: 'Ні, повернутись назад',
														callback_data: `is_want_induct false`,
													},
												],
											],
										},
									}

									await bot.sendMessage(
										chatId,
										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
									)

									await bot.sendMessage(
										chatId,
										`Бажаєте ознайомитись з товаром?`,
										itemOptions
									)
								} else if (
									state[chatId]?.productName ===
									'Тактичний лонгслів 5.45style жіночий black'
								) {
									const category = '/shtany/'

									const clothe = clothes[category].find(
										clothe =>
											clothe.name === 'Тактичні штани 5.45style чорні жіночі'
									)
									const itemOptions = {
										reply_markup: {
											inline_keyboard: [
												[
													{
														text: 'Так',
														callback_data: `is_want_induct true ${category} ${clothe.id}`,
													},
													{
														text: 'Ні, повернутись назад',
														callback_data: `is_want_induct false`,
													},
												],
											],
										},
									}

									await bot.sendMessage(
										chatId,
										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
									)

									await bot.sendMessage(
										chatId,
										`Бажаєте ознайомитись з товаром?`,
										itemOptions
									)
								} else if (
									state[chatId]?.productName ===
									'Тактичні штани 5.45style чорні жіночі'
								) {
									const category = '/futbolky/'

									const clothe = clothes[category].find(
										clothe =>
											clothe.name ===
											'Тактичний лонгслів 5.45style жіночий black'
									)
									const itemOptions = {
										reply_markup: {
											inline_keyboard: [
												[
													{
														text: 'Так',
														callback_data: `is_want_induct true ${category} ${clothe.id}`,
													},
													{
														text: 'Ні, повернутись назад',
														callback_data: `is_want_induct false`,
													},
												],
											],
										},
									}

									await bot.sendMessage(
										chatId,
										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
									)

									await bot.sendMessage(
										chatId,
										`Бажаєте ознайомитись з товаром?`,
										itemOptions
									)
								} else if (
									state[chatId]?.productName === 'Куртка Soft Shell олива'
								) {
									const category = '/shtany/'

									const clothe = clothes[category].find(
										clothe => clothe.name === 'Штани Soft Shell на флісі олива'
									)
									const itemOptions = {
										reply_markup: {
											inline_keyboard: [
												[
													{
														text: 'Так',
														callback_data: `is_want_induct true ${category} ${clothe.id}`,
													},
													{
														text: 'Ні, повернутись назад',
														callback_data: `is_want_induct false`,
													},
												],
											],
										},
									}

									await bot.sendMessage(
										chatId,
										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
									)

									await bot.sendMessage(
										chatId,
										`Бажаєте ознайомитись з товаром?`,
										itemOptions
									)
								} else if (
									state[chatId]?.productName ===
									'Штани Soft Shell на флісі олива'
								) {
									const category = '/kurtky/'

									const clothe = clothes[category].find(
										clothe => clothe.name === 'Куртка Soft Shell олива'
									)
									const itemOptions = {
										reply_markup: {
											inline_keyboard: [
												[
													{
														text: 'Так',
														callback_data: `is_want_induct true ${category} ${clothe.id}`,
													},
													{
														text: 'Ні, повернутись назад',
														callback_data: `is_want_induct false`,
													},
												],
											],
										},
									}

									await bot.sendMessage(
										chatId,
										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
									)

									await bot.sendMessage(
										chatId,
										`Бажаєте ознайомитись з товаром?`,
										itemOptions
									)
								} else if (
									state[chatId]?.productName ===
									'Тактичний лонгслів жіночий 5.45style піксель'
								) {
									const category = '/shtany/'

									const clothe = clothes[category].find(
										clothe =>
											clothe.name === 'Тактичні штани 5.45style піксель жіночі'
									)
									const itemOptions = {
										reply_markup: {
											inline_keyboard: [
												[
													{
														text: 'Так',
														callback_data: `is_want_induct true ${category} ${clothe.id}`,
													},
													{
														text: 'Ні, повернутись назад',
														callback_data: `is_want_induct false`,
													},
												],
											],
										},
									}

									await bot.sendMessage(
										chatId,
										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
									)

									await bot.sendMessage(
										chatId,
										`Бажаєте ознайомитись з товаром?`,
										itemOptions
									)
								} else if (
									state[chatId]?.productName ===
									'Тактичні штани 5.45style піксель жіночі'
								) {
									const category = '/futbolky/'

									const clothe = clothes[category].find(
										clothe =>
											clothe.name ===
											'Тактичний лонгслів жіночий 5.45style піксель'
									)
									const itemOptions = {
										reply_markup: {
											inline_keyboard: [
												[
													{
														text: 'Так',
														callback_data: `is_want_induct true ${category} ${clothe.id}`,
													},
													{
														text: 'Ні, повернутись назад',
														callback_data: `is_want_induct false`,
													},
												],
											],
										},
									}

									await bot.sendMessage(
										chatId,
										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
									)

									await bot.sendMessage(
										chatId,
										`Бажаєте ознайомитись з товаром?`,
										itemOptions
									)
								} else if (
									state[chatId]?.productName === 'Лонслів НГУ жіночий 5.45style'
								) {
									const category = '/shtany/'

									const clothe = clothes[category].find(
										clothe =>
											clothe.name ===
											'Тактичні штани 5.45style жіночі олива (хакі)'
									)
									const itemOptions = {
										reply_markup: {
											inline_keyboard: [
												[
													{
														text: 'Так',
														callback_data: `is_want_induct true ${category} ${clothe.id}`,
													},
													{
														text: 'Ні, повернутись назад',
														callback_data: `is_want_induct false`,
													},
												],
											],
										},
									}

									await bot.sendMessage(
										chatId,
										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
									)

									await bot.sendMessage(
										chatId,
										`Бажаєте ознайомитись з товаром?`,
										itemOptions
									)
								} else if (
									state[chatId]?.productName ===
									'Тактичні штани 5.45style жіночі олива (хакі)'
								) {
									const category = '/futbolky/'

									const clothe = clothes[category].find(
										clothe => clothe.name === 'Лонслів НГУ жіночий 5.45style'
									)
									const itemOptions = {
										reply_markup: {
											inline_keyboard: [
												[
													{
														text: 'Так',
														callback_data: `is_want_induct true ${category} ${clothe.id}`,
													},
													{
														text: 'Ні, повернутись назад',
														callback_data: `is_want_induct false`,
													},
												],
											],
										},
									}

									await bot.sendMessage(
										chatId,
										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
									)

									await bot.sendMessage(
										chatId,
										`Бажаєте ознайомитись з товаром?`,
										itemOptions
									)
								} else if (
									state[chatId]?.productName ===
									'Тактичний лонгслів жіночий 5.45style піксель'
								) {
									const category = '/shtany/'

									const clothe = clothes[category].find(
										clothe =>
											clothe.name === 'Тактичні штани 5.45style піксель жіночі'
									)
									const itemOptions = {
										reply_markup: {
											inline_keyboard: [
												[
													{
														text: 'Так',
														callback_data: `is_want_induct true ${category} ${clothe.id}`,
													},
													{
														text: 'Ні, повернутись назад',
														callback_data: `is_want_induct false`,
													},
												],
											],
										},
									}

									await bot.sendMessage(
										chatId,
										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
									)

									await bot.sendMessage(
										chatId,
										`Бажаєте ознайомитись з товаром?`,
										itemOptions
									)
								} else if (
									state[chatId]?.productName ===
									'Тактичний утеплений лонгслів 5.45style з місцем під жетон'
								) {
									const category = '/shtany/'

									const clothe = clothes[category].find(
										clothe =>
											clothe.name === 'Тактичні штани 5.45style чорні жіночі'
									)
									const itemOptions = {
										reply_markup: {
											inline_keyboard: [
												[
													{
														text: 'Так',
														callback_data: `is_want_induct true ${category} ${clothe.id}`,
													},
													{
														text: 'Ні, повернутись назад',
														callback_data: `is_want_induct false`,
													},
												],
											],
										},
									}

									await bot.sendMessage(
										chatId,
										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
									)

									await bot.sendMessage(
										chatId,
										`Бажаєте ознайомитись з товаром?`,
										itemOptions
									)
								} else if (
									state[chatId]?.productName ===
									'Тактичні штани 5.45style чорні жіночі'
								) {
									const category = '/futbolky/'

									const clothe = clothes[category].find(
										clothe =>
											clothe.name ===
											'Тактичний утеплений лонгслів 5.45style з місцем під жетон'
									)
									const itemOptions = {
										reply_markup: {
											inline_keyboard: [
												[
													{
														text: 'Так',
														callback_data: `is_want_induct true ${category} ${clothe.id}`,
													},
													{
														text: 'Ні, повернутись назад',
														callback_data: `is_want_induct false`,
													},
												],
											],
										},
									}

									await bot.sendMessage(
										chatId,
										`Разом з товаром що ви обрали найчастіше замовлять: ${clothe.name}!`
									)

									await bot.sendMessage(
										chatId,
										`Бажаєте ознайомитись з товаром?`,
										itemOptions
									)
								} else {
									const category = '/holovni-ubory/'
									const isManClothe =
										!state[chatId]?.productName.includes('жіноч')

									const manOrWomanClothes = clothes[category].filter(clothe =>
										!isManClothe
											? clothe.name.includes('жіноч')
											: !clothe.name.includes('жіноч')
									)

									const categoryClothesLength = manOrWomanClothes.length
									const idOfRandomClothe = getRandomInt(
										0,
										categoryClothesLength - 1
									)

									const randomClothe = manOrWomanClothes.find(
										(clothe, i) => i === Number(idOfRandomClothe)
									)

									const itemOptions = {
										reply_markup: {
											inline_keyboard: [
												[
													{
														text: 'Так',
														callback_data: `is_want_induct true ${category} ${randomClothe.id}`,
													},
													{
														text: 'Ні, повернутись назад',
														callback_data: `is_want_induct false`,
													},
												],
											],
										},
									}

									await bot.sendMessage(
										chatId,
										`Разом з товаром що ви обрали найчастіше замовлять: ${randomClothe.name}!`
									)

									await bot.sendMessage(
										chatId,
										`Бажаєте ознайомитись з товаром?`,
										itemOptions
									)
								}
								console.log(6)
								state[chatId] = {}
								return
							} else {
								console.error('Error processing image:', err)
							}
						})
					})
				})
			})
		}
	}

	if (msg.text === '/start') {
		await bot.sendMessage(chatId, 'Вітаємо вас 👋')
	}

	if (msg.text === '/start' || msg.text === 'Назад до головного меню') {
		console.log('state undef 2')
		state[chatId] = {}
		await bot.sendMessage(
			chatId,
			'Виберіть розділ, щоб вивести перелік товарів:',
			{
				reply_markup: mainMenu,
			}
		)
	}

	if (
		!!navsText.find(navText => {
			return navText.value === msg.text
		})
	) {
		console.log('state undef 3')
		state[chatId] = {}

		let indexOfActiveClothe = null

		navsText.forEach((navText, i) => {
			if (navText.value === msg.text) {
				indexOfActiveClothe = i
			}
		})

		state[chatId].clothe = navigationItems[indexOfActiveClothe].value

		// Отправляем inline-клавиатуру для выбора "утепленных" и "неутепленных" кофт
		await bot.sendMessage(chatId, 'Виберіть тип одягу:', {
			reply_markup: {
				inline_keyboard: [
					[
						{ text: 'Утеплені', callback_data: 'warm' },
						{ text: 'Неутеплені', callback_data: 'not_warm' },
					],
				],
			},
		})
	}
})

// Обработка inline-клавиатуры
bot.on('callback_query', async query => {
	const chatId = query.message.chat.id
	const clothingType = query.data
	const clothe = state[chatId].clothe

	// Обработка выбора типа кофт
	if (clothingType === 'warm' || clothingType === 'not_warm') {
		const category = clothe
		const clothesByCategory = clothes[category]
		let isClotheExists = false

		if (!clothesByCategory) {
			return await bot.sendMessage(
				chatId,
				'Таких товарів зараз нема у наявності'
			)
		}

		if (clothingType === 'warm') {
			for (const clothe of clothesByCategory) {
				if (clothe.isWarm) {
					isClotheExists = true
					await sendItemDescription(
						chatId,
						clothe.name,
						clothe.price,
						clothe.imageSrcs,
						clothe.id,
						category
					)
				}
			}
		}

		if (clothingType === 'not_warm') {
			for (const clothe of clothesByCategory) {
				if (!clothe.isWarm) {
					isClotheExists = true

					await sendItemDescription(
						chatId,
						clothe.name,
						clothe.price,
						clothe.imageSrcs,
						clothe.id,
						category
					)
				}
			}
		}

		if (!isClotheExists) {
			return await bot.sendMessage(
				chatId,
				'Таких товарів зараз нема у наявності'
			)
		}

		// bot.sendMessage(
		// 	chatId,
		// 	'Натисніть "Назад до головного меню", щоб повернутися',
		// 	{
		// 		reply_markup: {
		// 			keyboard: [['Назад до головного меню']],
		// 			resize_keyboard: true,
		// 			one_time_keyboard: true,
		// 		},
		// 	}
		// )
	}

	// обработка кнопки buy
	if (clothingType.split(' ')[0] === 'buy') {
		const productCategory = clothingType.split(' ')[1]
		const productId = clothingType.split(' ')[2]
		const clothesByCategory = clothes[productCategory]
		const orderedProduct = clothesByCategory.find(clothe => {
			return Number(clothe.id) === Number(productId)
		})

		state[chatId].productName = orderedProduct.name

		await bot.sendMessage(
			chatId,
			`Ви обрали: "${state[chatId].productName}"`,
			{}
		)
		await bot.sendMessage(chatId, 'Оберіть спосіб платежу:', {
			reply_markup: {
				inline_keyboard: [
					[
						{
							text: 'Накладений',
							callback_data: `payment-type imposed`,
						},
						{
							text: 'Онлайн',
							callback_data: `payment-type online`,
						},
					],
				],
			},
		})
	}
	// обработка типа платежа
	if (clothingType.split(' ')[0] === 'payment-type') {
		const firstSpaceIndex = clothingType.indexOf(' ')
		const paymentType =
			firstSpaceIndex !== -1
				? clothingType.slice(firstSpaceIndex + 1)
				: clothingType

		// const productName = clothingType.split(' ')[1]

		state[chatId].paymentType = paymentType

		bot.sendMessage(chatId, 'Напишіть ваш номер телефону')
	}

	// обработка типа платежа
	if (clothingType.split(' ')[0] === 'more_photos') {
		const productCategory = clothingType.split(' ')[1]
		const productId = clothingType.split(' ')[2]
		const clothesByCategory = clothes[productCategory]
		const orderedProduct = clothesByCategory.find(clothe => {
			return Number(clothe.id) === Number(productId)
		})

		const itemOptions = {
			reply_markup: {
				inline_keyboard: [
					[
						{
							text: 'Купити',
							callback_data: `buy ${productCategory} ${productId}`,
						},
					],
				],
			},
		}

		const media = orderedProduct.imageSrcs.map(photoUrl => ({
			media: `https://545style.com${photoUrl}`,
			type: 'photo',
			caption: '1', // Добавляем название и цену товара
			parse_mode: 'Markdown',
		}))

		await bot.sendMessage(chatId, `Більше фоток для "${orderedProduct.name}"`)
		await bot.sendMediaGroup(chatId, media)
		await bot.sendMessage(
			chatId,
			`Натисніть кнопку "Купити", щоб придбати товар`,
			itemOptions
		)
	}

	if (clothingType.split(' ')[0] === 'is_want_induct') {
		if (eval(clothingType.split(' ')[1])) {
			const productCategory = clothingType.split(' ')[2]
			const productId = clothingType.split(' ')[3]
			const clothesByCategory = clothes[productCategory]
			const orderedProduct = clothesByCategory.find(clothe => {
				return Number(clothe.id) === Number(productId)
			})

			await sendItemDescription(
				chatId,
				orderedProduct.name,
				orderedProduct.price,
				orderedProduct.imageSrcs,
				orderedProduct.id,
				productCategory
			)
		} else {
			bot.sendMessage(chatId, 'Дякуємо за ваше замовлення', {
				reply_markup: mainMenu,
			})
		}
	}
})

// Обработка ответа на запрос данных пользователя
bot.on('text', async msg => {
	const chatId = msg.chat.id
	console.log(state[chatId])

	if (
		!!state[chatId]?.productName &&
		!!state[chatId]?.paymentType &&
		!state[chatId]?.phoneNumber
	) {
		state[chatId].phoneNumber = msg.text

		bot.sendMessage(chatId, `Укажіть розмір`)
		return
	}
	if (
		!!state[chatId]?.productName &&
		!!state[chatId]?.paymentType &&
		!!state[chatId]?.phoneNumber &&
		!state[chatId]?.size
	) {
		state[chatId].size = msg.text

		bot.sendMessage(chatId, `Укажіть ваш ПІБ`)
		return
	}
	if (
		!!state[chatId]?.productName &&
		!!state[chatId]?.paymentType &&
		!!state[chatId]?.phoneNumber &&
		!!state[chatId]?.size &&
		!state[chatId]?.fullName
	) {
		state[chatId].fullName = msg.text

		bot.sendMessage(chatId, `Укажіть ваше місто`)
		return
	}
	if (
		!!state[chatId]?.productName &&
		!!state[chatId]?.paymentType &&
		!!state[chatId]?.phoneNumber &&
		!!state[chatId]?.size &&
		!!state[chatId]?.fullName &&
		!state[chatId]?.city
	) {
		state[chatId].city = msg.text

		bot.sendMessage(chatId, `Укажіть відділення пошти`)
		return
	}
	if (
		!!state[chatId]?.productName &&
		!!state[chatId]?.paymentType &&
		!!state[chatId]?.phoneNumber &&
		!!state[chatId]?.size &&
		!!state[chatId]?.fullName &&
		!!state[chatId]?.city &&
		!state[chatId]?.mail
	) {
		state[chatId].mail = msg.text

		if (state[chatId]?.paymentType === 'imposed') {
			await bot.sendMessage(
				chatId,
				`
			Надішліть передоплату у розмірі 200грн на
			карту: 5375411402901206 Терез А.
			або 
			на IBAN: ФОП Терез Артем Володимирович IBAN UA053220010000026004320012081 ІПН/ЄДРПОУ 3392401775 Акціонерне товариство УНІВЕРСАЛ БАНК МФО 322001 ЄДРПОУ Банку 21133352
			
			Після оплати надішліть фото квитанції у бота!
			`
			)
		} else {
			await bot.sendMessage(
				chatId,
				`
			Надішліть оплату на
			карту: 5375411402901206 Терез А.
			або 
			на IBAN: ФОП Терез Артем Володимирович IBAN UA053220010000026004320012081 ІПН/ЄДРПОУ 3392401775 Акціонерне товариство УНІВЕРСАЛ БАНК МФО 322001 ЄДРПОУ Банку 21133352
			
			Після оплати надішліть фото квитанції у бота!
			`
			)
		}
	}
})
