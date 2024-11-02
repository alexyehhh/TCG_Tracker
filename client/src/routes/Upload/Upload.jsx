// UploadPage.jsx
import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import styles from './Upload.module.css';
import { Link } from 'react-router-dom';
import PokemonBackground from '../../components/PokemonBackground/PokemonBackground';

const UploadPage = () => {
	const [dragActive, setDragActive] = useState(false);
	const [files, setFiles] = useState([]);

	const handleDrag = (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === 'dragenter' || e.type === 'dragover') {
			setDragActive(true);
		} else if (e.type === 'dragleave') {
			setDragActive(false);
		}
	};

	const handleDrop = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);

		const droppedFiles = Array.from(e.dataTransfer.files);
		setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
	};

	const handleChange = (e) => {
		const uploadedFiles = Array.from(e.target.files);
		setFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
	};

	const removeFile = (indexToRemove) => {
		setFiles((prevFiles) =>
			prevFiles.filter((_, index) => index !== indexToRemove)
		);
	};

	// Add a card to user collection
	const addCardToCollection = async (userId, cardData) => {
		try {
			const cardsCollectionRef = collection(db, 'users', userId, 'cards');
			await addDoc(cardsCollectionRef, {
				...cardData,
				addedAt: new Date(),
				lastUpdated: new Date(),
			});
		} catch (error) {
			console.error('Error adding card:', error);
			throw error;
		}
	};

	return (
		<div className={styles.container}>
			<PokemonBackground />
			<nav className={styles.navbar}>
				<ul className={styles.navLinks}>
					<li>
						<Link to='/'>Search</Link>
					</li>
					<li>
						<Link to='/collection'>Collection</Link>
					</li>
					<li>
						<Link to='/upload'>Upload</Link>
					</li>
				</ul>
			</nav>

			<main className={styles.main}>
				<div className={styles.uploadContainer}>
					<div
						className={`${styles.dropzone} ${
							dragActive ? styles.dragActive : ''
						}`}
						onDragEnter={handleDrag}
						onDragLeave={handleDrag}
						onDragOver={handleDrag}
						onDrop={handleDrop}>
						<Upload size={48} className={styles.uploadIcon} />
						<h2 className={styles.uploadTitle}>Upload Pokemon Cards</h2>
						<p className={styles.uploadText}>
							Drag and drop your files here or click to browse
						</p>
						<input
							type='file'
							className={styles.fileInput}
							multiple
							onChange={handleChange}
							accept='image/*'
						/>
					</div>

					{files.length > 0 && (
						<div className={styles.fileList}>
							<h3 className={styles.fileListTitle}>Uploaded Files</h3>
							{files.map((file, index) => (
								<div key={index} className={styles.fileItem}>
									<span>{file.name}</span>
									<button
										onClick={() => removeFile(index)}
										className={styles.removeButton}
										aria-label='Remove file'>
										<X size={16} />
									</button>
								</div>
							))}
						</div>
					)}
				</div>
			</main>
		</div>
	);
};

export default UploadPage;
