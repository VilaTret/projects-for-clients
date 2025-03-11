const TelegramBot = require('node-telegram-bot-api')
const https = require('https')
const Jimp = require('jimp')
const express = require('express')
const fs = require('fs')
const jsdom = require('jsdom')
const { JSDOM } = jsdom

// const token = '6965202334:AAEcJYVXE_NehXzEZ2NtjjdIHUT3PEvZGwQ'
// const token = '6085919277:AAGvJfRHmmSVj9FZJFOnhKWaJgJRrc1UwkI'
const token = '7225387110:AAH9KTu9WttDVa9Uc1SYb_13IUnlZsHXGgo'

const bot = new TelegramBot(token, { polling: true })
// const chatForOrdersId = '-1001731459101'
// const chatForOrdersId = '-1002123218064'
const chatForOrdersId = '-1002480234590'

// const chatGroup = -1001786493978
// const chatGroup = -1002109591980
const chatGroup = -1002195286307

// const sheetUrl =
// 	'https://script.google.com/macros/s/AKfycbyvwhwi7imnIR6ECthSmiYPcKPv6qBYKYSsDQ4xqcsGGPlPcHVx5jJaKuCRcLOJ6Gto5A/exec'
// Індитифікатор: AKfycbxqcedfiqMQAsGBa6mjmaTBYJ-8l4SEYvvaw5fW6dxDLPTupj7PkElFDtnGfuvHiWIA
const sheetUrl =
	'https://script.google.com/macros/s/AKfycbxqcedfiqMQAsGBa6mjmaTBYJ-8l4SEYvvaw5fW6dxDLPTupj7PkElFDtnGfuvHiWIA/exec'

const navsText = JSON.parse(fs.readFileSync('navigationItemsText.json', 'utf8'))
const navigationItems = JSON.parse(
	fs.readFileSync('navigationItems.json', 'utf8')
)

const app = express()

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

async function sendPostMessageToUsers(photo, text) {
	try {
		// Чтение данных из файла
		// const users = JSON.parse(fs.readFileSync('users.json', 'utf-8'))

		const usersResponce = await fetch(sheetUrl)
		const users = await usersResponce.json()

		// Создание массива Promise для отправки сообщений параллельно
		const promises = users.map(async user => {
			// const userChatId = user.chatId
			const userChatId = user[0]

			if (userChatId > 0) {
				// Отправка фото
				await bot.sendPhoto(userChatId, photo.file_id, {
					caption: text,
					reply_markup: {
						inline_keyboard: [
							[{ text: 'Відкрити меню', callback_data: 'show_menu' }],
						],
					},
				})
			}
		})

		// Ожидание завершения всех Promise
		await Promise.all(promises)
	} catch (error) {
		console.error('Ошибка при чтении файла:', error)
	}
}

const checkIsUserExists = chatId => {
	const users = JSON.parse(fs.readFileSync('users.json', 'utf-8'))
	const isUserExists = !!users.find(user => user.chatId === chatId)

	if (!isUserExists) {
		const newUsers = [
			...users,
			{
				chatId,
				countOfVisiting: 1,
				isBotBlockedByUser: false,
				botBlockedByUserTime: null,
				actions: [],
			},
		]

		fs.writeFileSync('users.json', JSON.stringify(newUsers))
	}
}

const updateClothes = async () => {
	const getObjectKeys = object => {
		const allKeys = object.reduce((keys, obj) => {
			// Используем Object.keys для получения ключей текущего объекта
			const objKeys = Object.keys(obj)

			// Добавляем ключи текущего объекта к общему списку ключей
			return [...keys, ...objKeys]
		}, [])

		// Теперь переменная allKeys содержит все ключи из массива объектов
		return allKeys
	}

	function checkKeywords(inputString) {
		const keywords = ['утеплен', 'фліс', 'куртк', 'термо']

		for (const keyword of keywords) {
			const regex = new RegExp(keyword, 'i') // 'i' означает регистронезависимый поиск
			if (inputString.match(regex)) {
				return true
			}
		}

		return false
	}

	const findElementsByClass = (htmlString, className) => {
		const dom = new JSDOM(htmlString)
		const document = dom.window.document

		// Находим все элементы с указанным классом
		const elementsNodeList = document.querySelectorAll(`.${className}`)
		const elements = []

		// Получаем значения атрибута href для каждого элемента
		elementsNodeList.forEach(element => {
			elements.push(element.outerHTML)
		})

		return elements
	}
	const findElementByItemProp = (htmlString, itemProp) => {
		const dom = new JSDOM(htmlString)
		const document = dom.window.document

		// Находим все элементы с указанным классом
		const element = document.querySelector(`[itemprop="${itemProp}"]`)
		return element.outerHTML
	}
	const findElementByClassName = (htmlString, className) => {
		const dom = new JSDOM(htmlString)
		const document = dom.window.document

		// Находим все элементы с указанным классом
		const element = document.querySelector(`.${className}`)
		return element.outerHTML
	}

	const getNavigationItemsHrefs = async () => {
		const pageResponse = await fetch('https://545style.com/')
		const pageText = await pageResponse.text()

		const navigationItems = findElementsByClass(
			pageText,
			'products-menu__title-link'
		)

		const matchHrefs2Text = []

		// Создаем новый массив, содержащий только значения href
		const navigationItemsHrefs = navigationItems.map(item => {
			// Используем регулярное выражение для извлечения значения href

			const matchHref = item.match(/href="([^"]+)"/)
			const matchHref2 = item.match(/<a[^>]*>([^<]*)<\/a>/)
			const matchHref2Text = matchHref2[1].replace(/\n/g, '').trim()

			matchHrefs2Text.push(matchHref2Text)

			if (matchHref) {
				return matchHref[1]
				// Если matchHref успешен, используем результат для дальнейших операций
				// const match = matchHref[1].match(/(\/[^\/]+\/)$/)
				// return match ? match[1] : null
			} else {
				// Если matchHref равен null, возвращаем null
				return null
			}
		})

		return { navigationItemsHrefs, matchHrefs2Text }
	}

	const getClothesHrefs = async navigationItems => {
		const clothesHrefs = []

		for (const navigationItem of navigationItems) {
			const pageResponse = await fetch(`https://545style.com/${navigationItem}`)
			const pageText = await pageResponse.text()

			const clothesOnPage = findElementsByClass(pageText, 'catalogCard-image')

			// Создаем новый массив, содержащий только значения href
			const clothesOnPageHrefs = clothesOnPage.map(clotheOnPage => {
				// Используем регулярное выражение для извлечения значения href
				const match = clotheOnPage.match(/href="([^"]+)"/)
				return match ? match[1] : null
			})

			clothesHrefs.push({
				[navigationItem]: clothesOnPageHrefs,
			})
		}

		return clothesHrefs
	}

	const getClothes = async (clothesHrefs, clothesKeys) => {
		const clothes = {}
		let i = 0
		let id = 0

		clothesKeys.forEach(clothesKey => {
			clothes[clothesKey] = []
		})

		for (const clothesHref of clothesHrefs) {
			const hrefsByCategory = clothesHref[clothesKeys[i]]

			for (const href of hrefsByCategory) {
				const pageResponse = await fetch(`https://545style.com${href}`)

				const pageText = await pageResponse.text()

				const clotheImages = findElementsByClass(pageText, 'gallery__photo-img')

				// Создаем новый массив, содержащий только значения src
				const clotheImagesHrefs = clotheImages.map(item => {
					// Используем регулярное выражение для извлечения значения href
					const match = item.match(/src="([^"]+)"/)
					return match ? match[1] : null
				})

				const clothePrice = findElementByItemProp(pageText, 'price')
				const clothePriceMatch = clothePrice.match(/content="([^"]+)"/)
					? clothePrice.match(/content="([^"]+)"/)
					: null

				const clotheName = findElementByClassName(pageText, 'product-title')
				const clotheNameMatch = clotheName.match(/<h1[^>]*>(.*?)<\/h1>/)

				clothes[clothesKeys[i]].push({
					id,
					imageSrcs: clotheImagesHrefs,
					price: Number(clothePriceMatch[1]),
					name: clotheNameMatch[1].trim(),
					isWarm: checkKeywords(clotheNameMatch[1]),
				})
				id += 1
			}
			id = 0
			i += 1
		}

		return clothes
	}

	const initial = async () => {
		const { navigationItemsHrefs: navigationItemsWithIncorrectUrls } =
			await getNavigationItemsHrefs()
		const { matchHrefs2Text: navigationItemsText } =
			await getNavigationItemsHrefs()

		const navigationItems = navigationItemsWithIncorrectUrls.map(item =>
			item.replace('https://545style.com', '')
		)

		const clothesHrefs = await getClothesHrefs(navigationItems)

		const clothesHrefsKeys = getObjectKeys(clothesHrefs)

		const clothes = await getClothes(clothesHrefs, clothesHrefsKeys)

		return { clothes, navigationItemsText, navigationItems }
	}

	const { clothes, navigationItemsText, navigationItems } = await initial()

	fs.writeFileSync('clothes.json', JSON.stringify(clothes))

	fs.writeFileSync(
		'navigationItemsText.json',
		JSON.stringify(
			navigationItemsText.map(navigationItemText => ({
				value: navigationItemText,
			}))
		)
	)
	fs.writeFileSync(
		'navigationItems.json',
		JSON.stringify(
			navigationItems.map(navigationItem => ({
				value: navigationItem,
			}))
		)
	)

	return 'success'
}

const state = {}

// on block bot by user
bot.on('my_chat_member', msg => {
	const status = msg.new_chat_member.status
	const chatId = msg.chat.id

	checkIsUserExists(chatId)
	if (status === 'kicked') {
		const timestamp = msg.date
		const date = new Date(timestamp * 1000)
		const formattedDate = date.toLocaleString()

		const users = JSON.parse(fs.readFileSync('users.json', 'utf-8'))

		const newUsers = users.map(user => {
			if (user.chatId === chatId) {
				return {
					...user,
					isBotBlockedByUser: true,
					botBlockedByUserTime: formattedDate,
				}
			} else {
				return user
			}
		})

		fs.writeFileSync('users.json', JSON.stringify(newUsers))
	}
	if (status === 'member') {
		const chatId = msg.chat.id
		const users = JSON.parse(fs.readFileSync('users.json', 'utf-8'))

		const newUsers = users.map(user => {
			if (user.chatId === chatId) {
				return {
					...user,
					isBotBlockedByUser: false,
					botBlockedByUserTime: null,
				}
			} else {
				return user
			}
		})

		fs.writeFileSync('users.json', JSON.stringify(newUsers))
	}
})

bot.on('message', async msg => {
	const chatId = msg.chat.id
	const clothes = JSON.parse(fs.readFileSync('clothes.json', 'utf8'))

	checkIsUserExists(chatId)

	const users = JSON.parse(fs.readFileSync('users.json', 'utf-8'))

	const timestamp = msg.date
	const date = new Date(timestamp * 1000)

	const formattedDate = date.toLocaleString()

	const newUsers = users.map(user => {
		if (user.chatId === chatId) {
			const actionsLength = user.actions.length

			return {
				...user,
				isBotBlockedByUser: false,
				botBlockedByUserTime: null,
				actions: [...user.actions, { text: msg.text, date: formattedDate }],
				countOfVisiting: user.actions[actionsLength - 1]
					? Number(formattedDate.split('/')[1]) >
					  Number(user.actions[actionsLength - 1].date.split('/')[1])
						? user.countOfVisiting + 1
						: user.countOfVisiting
					: user.countOfVisiting,
			}
		} else {
			return user
		}
	})

	fs.writeFileSync('users.json', JSON.stringify(newUsers))

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

					// Обработка события завершения загрузки изображения
					response.on('end', () => {
						// Обрабатываем изображение с помощью sharp в памяти
						Jimp.read(imageData, async (err, image) => {
							if (!err) {
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
																			\nРозмір: ${state[chatId]?.size}
																			\nТовар: ${state[chatId]?.productName}
																			\nТип оплати: ${state[chatId]?.paymentType === 'imposed' ? 'наложка' : 'онлайн'}
																			\nUPD: товар замовили за допомогою бота
																	`,
								})

								await bot.sendMessage(
									chatId,
									`Ви успішно замовили: ${state[chatId]?.productName}!`
								)

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
		// send message bot
		await bot.sendMessage(chatId, 'Вітаємо вас 👋')
	}

	if (msg.text === '/start' || msg.text === 'Назад до головного меню') {
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
	console.log(query)
	const clothes = JSON.parse(fs.readFileSync('clothes.json', 'utf8'))

	const chatId = query.message.chat.id
	checkIsUserExists(chatId)

	const users = JSON.parse(fs.readFileSync('users.json', 'utf-8'))

	const timestamp = query.message.date
	const date = new Date(timestamp * 1000)

	const formattedDate = date.toLocaleString()

	const newUsers = users.map(user => {
		if (user.chatId === chatId) {
			const actionsLength = user.actions.length

			return {
				...user,
				isBotBlockedByUser: false,
				botBlockedByUserTime: null,
				actions: [
					...user.actions,
					{
						text: `${query.message.text} ${query?.data}`,
						date: formattedDate,
					},
				],
				countOfVisiting: user.actions[actionsLength - 1]
					? Number(formattedDate.split('/')[1]) >
					  Number(user.actions[actionsLength - 1].date.split('/')[1])
						? user.countOfVisiting + 1
						: user.countOfVisiting
					: user.countOfVisiting,
			}
		} else {
			return user
		}
	})

	fs.writeFileSync('users.json', JSON.stringify(newUsers))

	const clothingType = query.data
	const clothe = state[chatId].clothe

	if (clothingType === 'show_menu') {
		const messageText = 'Перед вами меню товарів'
		const options = {
			reply_markup: mainMenu,
		}

		bot.sendMessage(chatId, messageText, options)
	}

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
bot.on('text', async msg => {})

bot.on('channel_post', msg => {
	const chatId = msg.chat.id

	if (chatId === chatGroup) {
		if (!!msg.photo && !!msg.caption) {
			sendPostMessageToUsers(msg.photo[0], msg.caption)
		}

		return
	}
})

app.get('/users', (req, res) => {
	const users = fs.readFileSync('users.json', 'utf-8')

	res.json({
		data: users,
	})
})

app.get('/users/refreshSheet', async (req, res) => {
	// send users to sheet and refresh file

	const users = JSON.parse(fs.readFileSync('users.json', 'utf-8'))

	await fetch(sheetUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(users), // Ваш объект данных
	})
		.then(response => response.text())
		.then(data => {
			fs.writeFileSync('users.json', `[]`)
		})

	res.send('end')
})

app.get('/test', (req, res) => {
	const users = JSON.parse(fs.readFileSync('users.json', 'utf-8'))
	res.json(JSON.stringify(users))
})

app.get('/test2', (req, res) => {
	const clothes = JSON.parse(fs.readFileSync('clothes.json', 'utf-8'))
	res.json(JSON.stringify(clothes))
})

// update clothes
app.get('/clothes', async (req, res) => {
	const updateClothesReponce = await updateClothes()
	return res.send(updateClothesReponce)
})

app.get("/", (req, res) => res.send("Express on Vercel"));

app.listen('3000', () => {
	console.log('server was started')
})

module.exports = app;
