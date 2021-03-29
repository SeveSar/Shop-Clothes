const mySwiper = new Swiper('.swiper-container', {
	loop: true,

	// Navigation arrows
	navigation: {
		nextEl: '.slider-button-next',
		prevEl: '.slider-button-prev',
	},
});


// cart

const overlay = document.querySelector('#modal-cart');
const btnCart = document.querySelector('.button-cart');
const modalClose = document.querySelector('.modal-close');
const modalCart = document.querySelector('.modal');
const openModal = () => {
	overlay.classList.add('show');
	cart.renderCart();
	setTimeout(() => {
		modalCart.style.transform = "scale(1)";
	},200)
	document.body.style.overflow = "hidden";
}
const closeModal = () => {
	modalCart.style.transform = "scale(0)";
	setTimeout(() => {
		overlay.classList.remove('show');
	},300)
}
btnCart.addEventListener('click', openModal);
overlay.addEventListener('click', (e) => {
	const target = e.target;
	if (target === overlay || target === modalClose) {
		closeModal();
		document.body.style.overflow = "auto";
	}
})

// scrollLink
{
const scrollLinks = document.querySelectorAll('a.scroll-link');
scrollLinks.forEach(item => {
	item.addEventListener('click', (e) => {
		e.preventDefault();
		const id = item.getAttribute('href');
		document.querySelector(id).scrollIntoView({
			behavior: 'smooth',
			block: "start"
		})
	})
})
}

// goods

const more = document.querySelector('.more');
const longGoodsList = document.querySelector('.long-goods-list');

const getGoods = async () => {
	const response = await fetch('db/db.json');
	if (!response.ok) {
		throw TypeError(response.status)
	}
	return await response.json();
}

const createCard = ({id, img, name, label, description, price, category, gender}) => {
	const card = document.createElement('div');
	card.className = "col-lg-3 col-sm-6";
	card.innerHTML = `
		<div class="goods-card">
		${label ? `<span class="label">${label}</span>` : ""}
		<img src="db/${img}" alt="${name}" class="goods-image">
		<h3 class="goods-title">${name}</h3>
		<p class="goods-description">${description}</p>
		<button class="button goods-card-btn add-to-cart" data-id="${id}">
			<span class="button-price">$${price}</span>
		</button>
	</div>
	`
	return card
}
const renderCard = (data) => {
	longGoodsList.textContent = "";
	const cards = data.map(createCard)
	longGoodsList.append(...cards);
	document.body.classList.add('show-goods');
}


// getGoods().then(data => renderCard(data))
more.addEventListener('click', (e) => {
	e.preventDefault();
	getGoods().then(renderCard);
	document.body.scrollIntoView({
		behavior: "smooth",
		block: "start"
	})
})


// Filtered
const navigationLinks = document.querySelectorAll('.navigation-link');

const filtered = (field,value) => {
	getGoods()
			.then(data => {
				return data.filter(good => {
					if (value.toLowerCase() === 'all') {
						return good
					}
					return good[field] === value
				})
			}).then(data => renderCard(data))
}
navigationLinks.forEach(item => {
	item.addEventListener('click', (e) => {
		e.preventDefault();
		const field = item.getAttribute('data-field');
		const value = item.textContent;
		filtered(field,value);
	})
})

// offesrs blocks

const showAcsessoriesBtn = document.querySelectorAll('.show-acsessories');
const showClothingBtn = document.querySelectorAll('.show-clothing');

showAcsessoriesBtn.forEach(item => {
	item.addEventListener('click', (e) => {
		filtered('category','Accessories')
	})
})
showClothingBtn.forEach(item => {
	item.addEventListener('click', (e) => {
		filtered('category','Clothing')
	})
})

// cart
const cartTableGoods = document.querySelector('.cart-table__goods');
const cartCount = document.querySelector('.cart-count');


const cart = {
	cartGoods: [],
	countCart: 0,
	renderCart() {
		cartTableGoods.textContent = "";
		this.cartGoods.forEach(({id, name, price, count}) => {
			const trGood = document.createElement('tr');
			trGood.className = "cart-item";
			trGood.dataset.id = id;
			trGood.innerHTML = `
				<td>${name}</td>
				<td>${price}$</td>
				<td><button class="cart-btn-minus" data-id="${id}">-</button></td>
				<td>${count}</td>
				<td><button class="cart-btn-plus" data-id="${id}">+</button></td>
				<td>${price * count}$</td>
				<td><button class="cart-btn-delete" data-id="${id}">x</button></td>
			`;
			cartTableGoods.append(trGood);
		})
	},
	cartCounter() {
		if (this.countCart !== 0) {
			cartCount.textContent = this.countCart;

		} else {
			cartCount.textContent = "";
		}
	},
	addToCart(id) {
		const gooditem = this.cartGoods.find(item => {
			return item.id === id;
		})
		if (gooditem) {
			this.plusGood(id)
		} else {
			getGoods()
					.then(data => data.find(item => item.id === id))
					.then(({id, price, name}) => {
						this.cartGoods.push({
							id,
							price,
							name,
							count: 1
						});
						this.countCart++;
						this.cartCounter();
					});
		};
	},
	plusGood(id) {
		for (const item of this.cartGoods) {
			if (item.id === id) {
				item.count++;
				this.countCart++;
				this.cartCounter();
				break;
			}
			this.renderCart();
		}
	},
	deleteGood(id) {
		this.cartGoods = this.cartGoods.filter(item => {
			return item.id !== id
		})
		this.renderCart();
	},
	minusGood(id) {
		for (const item of this.cartGoods) {
			if (item.id === id) {
				if (item.count !== 1) {
					item.count--;
					this.countCart--;
					this.cartCounter();
				} else {
					this.cartGoods.pop(item);
					this.countCart--;
					this.cartCounter();
				}
			}
		}
		this.renderCart();
	}

}

document.body.addEventListener('click', (e) => {
	const target = e.target;
	if(target.classList.contains('cart-btn-plus')) {
		cart.plusGood(target.closest('.cart-item').dataset.id);
	}
	if (target.classList.contains("cart-btn-minus")) {
		cart.minusGood(target.closest('.cart-item').dataset.id);
	}
	if (target.classList.contains("cart-btn-delete")) {
		cart.deleteGood(target.closest('.cart-item').dataset.id);
	}

})
document.body.addEventListener('click', (e) => {
	const addtocart = e.target.closest('.add-to-cart');
	if (addtocart) {
		cart.addToCart(addtocart.dataset.id);
		console.log(cart.cartGoods);
	}


})
console.log(cart.cartGoods);




// fixed header

let scrollPos = document.documentElement.scrollTop;
const header = document.querySelector('.header');
const heightH = header.scrollHeight;
checkScrollPos(scrollPos, heightH)
window.addEventListener('scroll', (e) => {
	scrollPos = document.documentElement.scrollTop;
	checkScrollPos(scrollPos, heightH)
})
function checkScrollPos(scrollPos,heightH) {
	if (scrollPos >= heightH) {
		header.classList.add('fixed')
		document.body.classList.add('section-pt');
	} else {
		header.classList.remove('fixed')
		document.body.classList.remove('section-pt');
	}
}