import pokemon from 'pokemontcgsdk'

pokemon.configure({apiKey: '5205ff00-f5bd-4e0d-b263-c8c7d0ffbc64'})

// pokemon.card.find('base1-4')
// .then(card => {
//     console.log(card.name) // "Charizard"
// })

async function convert(id) {
    // const c = Card.find(id);
    let cname = '';
    const card = await pokemon.card.find(id);
    cname = card.name
    // console.log(card.name)
    // pokemon.card.find(id)
    // .then(card => {
    //     console.log(card.name)
    //     cname = cname.concat(card.name) // "Charizard"
    // })
    const setAndNum = id.split('-');
    const s = setAndNum[0];
    const n = setAndNum[1];

    // const ctotal = Set.find(s).total;
    let ctotal = 0;
    // console.log(s)
    const set = await pokemon.set.find(s);
    // console.log(set.total)
    ctotal = set.total

    const out = cname + " " + n + "/" + ctotal.toString();
    return out
}

// convert('xy1-1').then(result => console.log(result));