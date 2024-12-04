import pokemon from 'pokemontcgsdk';

const pokemonApi = process.env.POKEMON_KEY;
pokemon.configure({ apiKey: pokemonApi });

async function convert(id) {
	let cname = '';
	const card = await pokemon.card.find(id);
	cname = card.name;
	const setAndNum = id.split('-');
	const s = setAndNum[0];
	const n = setAndNum[1];

	let ctotal = 0;
	const set = await pokemon.set.find(s);
	ctotal = set.total;

	const out = cname + ' ' + n + '/' + ctotal.toString();
	return out;
}
