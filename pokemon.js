'use strict';

/**
 * POKEMOM API 
 * Handle the usage of the PokeAPI (DOCS: https://pokeapi.co/)
 * 
 * Public Methods:
 *     1. getPKMList: Returns a JSON containing a list of Pokemons.
 */ 
const pkmAPI = (function() {
	const MAX_PKM_TO_LOAD = 251;
	const BASE_URL = "https://pokeapi.co/api/v2/pokemon/"

	const getPKMList = async () => {
		let results = [];
		let GET_PKM_LIST_ENDPOINT = `${BASE_URL}?limit=${MAX_PKM_TO_LOAD}`;
		
		try {
			let response = await fetch(GET_PKM_LIST_ENDPOINT);
			let jsonResponse = await response.json();
			results = jsonResponse.results;
			results = results.map(pkm => {
				pkm.url = pkm.url.replace(BASE_URL, "").replace("/", "");

				return {
					num: pkm.url,
					name: pkm.name

				};
			})
		} catch (error) {
			console.error("PokeAPI is Down");
		}

		return results;
	};

	const getPKMSprite = async (id) => {
		let result = {};
		let GET_PKM_DETAILS =`${BASE_URL}${id}`;
		
		try {
			let response = await fetch(GET_PKM_DETAILS);
			let jsonResponse = await response.json();
			  
			result ={sprite: jsonResponse.sprites.front_default};

		} catch (error) {
			console.error("PokeAPI is Down");
		}

		return result;
	};

	const getEvoChain = async (id) => {
		let result = {};
		let GET_PKM_EVO_CHAIN =`https://pokeapi.co/api/v2/evolution-chain/${id}`;
		
		try {
			let response = await fetch(GET_PKM_EVO_CHAIN);
			let jsonResponse = await response.json();

			let evo =jsonResponse.chain.evolves_to;

		} catch (error) {
			console.error("PokeAPI is Down");
		}

		return result;
	};

	return {
		getPKMList,
		getPKMSprite,
		getEvoChain
	}

})();


/**
 * LOCAL STORAGE MANAGER 
 * Handle the usage of the Local Storage
 * 
 * Public Methods:
 *     1.  savePKMList: Saves the String (JSON Array) of the Pokemon list to the Local Storage.
 *     2.  retrievePKMList: Returns an array of Objects of the Pokemon list from the Local Storage.
 */ 
const localStorageManager = (function() {
	const PKM_LIST_KEY = "pkm_list";

	const savePKMList = (list) => {
		pushToLocalStorage(PKM_LIST_KEY, list);
	};

	const retrievePKMList = () => {
		return pullFromlocalStorage(PKM_LIST_KEY);
	};

	const pullFromlocalStorage = (id) => {
		let results = [];
		let list = window.localStorage.getItem(id);

		if(list) {
			try {
				results = JSON.parse(list);
			} catch (error) {
				console.error(`An error ocurred while parsing the id ${id} list from the Local Storage`);
			}
		}

		return results;
	};

	const pushToLocalStorage = (id, element) => {
		window.localStorage.setItem(id, JSON.stringify(element));
	};

	return {
		savePKMList,
		retrievePKMList
	}

})();


/**
 * DOM MANIPULATIONS
 * Handle the manipulations of the DOM
 * 
 * Public Methods:
 *     1. startApplication: Initializes the retrieval of the list and sets up the listeners.	
 */ 
const domAPI = (function(localStorageManager, pkmAPI) {
	const PKM_LIST_SELECTOR = "pkm-list";

	const generateList = (pkmList) => {
		let list = document.getElementById(PKM_LIST_SELECTOR);
		if(list) {
			list.innerHTML = "";
			pkmList.forEach(pkm => {
				
				let spanDescription = document.createElement("span");
				spanDescription.textContent = `#${pkm.num} - ${pkm.name}`;
				spanDescription.classList.add("pokemon-description");

				let buttons = document.createElement("div");
				let btnSelect = document.createElement("button");
				btnSelect.textContent="Select Pokemon";
				btnSelect.classList.add("btn", "btn-primary");


				let btnViewDetails = document.createElement("button");
				btnViewDetails.textContent="View Details";
				btnViewDetails.classList.add("btn","btn-primary");
				btnViewDetails.addEventListener("click", e=> {
					$('.modal-title').text(`#${pkm.num} - ${pkm.name}`);
					pkmAPI.getPKMSprite(pkm.num).then(result => {
						$('.sprite').attr('src', result.sprite);		
					});
					$('.modal').modal('toggle');
					document.getElementById('btnEvoChain').setAttribute('data-pokemon-id', pkm.num);
				});

				let domLI =  document.createElement("li");
				domLI.setAttribute("data-pkm-selected", false);
				domLI.setAttribute("data-pkm-num", pkm.num);
				domLI.setAttribute("data-pkm-name", pkm.name);
				domLI.classList.add("list-group-item", "pokemon-element");

				domLI.appendChild(spanDescription);
				domLI.appendChild(buttons);

				buttons.appendChild(btnViewDetails);
				buttons.appendChild(btnSelect);
				list.appendChild(domLI);	
			});
		}
	};

	const startListeners = () => {
		document.getElementById('btnEvoChain').addEventListener('click', e=>{
			pkmAPI.getEvoChain(e.target.getAttribute('data-pokemon-id')).then(result => {
				let evoChain = document.getElementById('evolutionChain');
				result.forEach(sprite =>{
					let domLI = document.createElement('li');
					let img = document.createElement('img');
					img.setAttribute('src', sprite.url);
					domLI.appendChild(img);
					evoChain.appendChild(domLI);
				});
				
			});
		});
	};

	const startApplication = () => {
		pkmAPI.getPKMList()
		.then( list => {
			localStorageManager.savePKMList(list);
			let results = localStorageManager.retrievePKMList();
			generateList(results);
			startListeners();
		});	
	};

	return {
		startApplication
	}

})(localStorageManager, pkmAPI);

// Initializer
document.addEventListener("DOMContentLoaded", function() {
	domAPI.startApplication();
});