// const {
// 	collection,
// 	doc,
// 	getDoc,
// 	setDoc,
// 	deleteDoc,
// } = require('firebase/firestore');
// const { db } = require('./firebase');
const express = require('express');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3001;

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});

// app.get('/:user/:id', async(req, res) =>{
// 	const docRef = doc(collection(doc(collection(db, 'test_space'), req.params.user), "cards"), req.params.id)
// 	const docSnap = await getDoc(docRef)
// 	if (docSnap.exists()){
// 		console.log(docSnap.data())
// 		res.status(200).json({method:"GET", status:"200", content_type:"json", body: docSnap.data()})
// 	}else{
// 		console.log("doesn't exist")
// 		res.status(404).json({method:"GET", status:"404", content_type:"json", body:"doesnt exist"})
// 	}
// })

// app.post('/:user/:id', async(req, res) =>{
// 	const docRef = doc(collection(doc(collection(db, 'test_space'), req.params.user), "cards"), req.params.id)
// 	const docSnap = await getDoc(docRef)
// 	if (docSnap.exists()){
// 		res.status(200).json({method:"POST", status:"200", content_type:"json", body: "card already exists"})
// 	}else{
// 		await setDoc(docRef, {
// 			name: req.params.id
// 		});
// 		res.status(201).json({method:"POST", status:"201", content_type:"json", body: "card created"})

// 	}
// })

// app.put('/:user/:id', async(req, res) =>{
// 	const docRef = doc(collection(doc(collection(db, 'test_space'), req.params.user), "cards"), req.params.id)
// 	const docSnap = await getDoc(docRef)
// 	if (docSnap.exists()){
// 		await setDoc(docRef, {
// 			name: req.params.id,
// 			hp: 150 //test value
// 		});
// 		res.status(200).json({method:"PUT", status:"200", content_type:"json", body: "updated"})
// 	}else{
// 		res.status(404).json({method:"PUT", status:"404", content_type:"json", body: "Doesn't exist"})
// 	}
// })

// app.delete('/:user/:id', async(req, res) => {
// 	const docRef = doc(collection(doc(collection(db, 'test_space'), req.params.user), "cards"), req.params.id)
//     const docSnap = await getDoc(docRef)
//     if (docSnap.exists()){
//     	await deleteDoc(docRef)
// 		res.status(200).json({method:"DELETE", status:"200", content_type:"json", body:"deleted"})
//     }else{
// 		res.status(404).json({method:"DELETE", status:"404", content_type:"json", body:"doesnt exist"})
// 	}
// })
