const jsdom = require('jsdom')
const { JSDOM } = jsdom
const fs = require('fs')

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
			console.log(href)
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

initial().then(({ clothes, navigationItemsText, navigationItems }) => {
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
})
