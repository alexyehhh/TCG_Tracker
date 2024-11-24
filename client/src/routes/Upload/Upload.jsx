// Upload.jsx
import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './Upload.module.css';
import { Link } from 'react-router-dom';
import PokemonBackground from '../../components/PokemonBackground/PokemonBackground';
import axios from 'axios';

const UploadPage = () => {
	const [dragActive, setDragActive] = useState(false);
	const [file, setFile] = useState(null); // Only allow one file
	const [matches, setMatches] = useState([]);
	const [error, setError] = useState('');
	const navigate = useNavigate();

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

		const droppedFile = e.dataTransfer.files[0]; // Only take the first file
		const previewFile = {
			file: droppedFile,
			preview: URL.createObjectURL(droppedFile),
		};
		// Replace existing file with new file
		if (file) {
			URL.revokeObjectURL(file.preview); // Revoke URL of the old preview
		}
		setFile(previewFile);
	};

	const handleChange = (e) => {
		const uploadedFile = e.target.files[0]; // Only take the first file
		const previewFile = {
			file: uploadedFile,
			preview: URL.createObjectURL(uploadedFile),
		};
		// Replace existing file with new file
		if (file) {
			URL.revokeObjectURL(file.preview); // Revoke URL of the old preview
		}
		setFile(previewFile);
	};

	const removeFile = () => {
		if (file) {
			URL.revokeObjectURL(file.preview); // Revoke URL to release memory
			setFile(null); // Reset the file state
		}
	};

	const handleUpload = async () => {
		if (!file) {
			setError('Please select an image first.');
			return;
		}

		const formData = new FormData();
		formData.append('file', file.file);

		try {
			console.log('Starting upload...');
			const response = await axios.post(
				`${import.meta.env.VITE_API_URL}/api/recognizeCard`,
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				}
			);
			console.log('Server response:', response.data);
			const { matches, searchQuery } = response.data;
			setError('');
			setMatches(matches || []);

			// Redirect to PokemonCards page with search query
			navigate(`/pokemon-cards?name=${encodeURIComponent(searchQuery)}`);
		} catch (err) {
			console.error(
				'Error uploading image:',
				err.response ? err.response.data : err.message
			);
			setError(
				err.response && err.response.data.error
					? err.response.data.error
					: 'Failed to recognize card. Please try again.'
			);
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
						<Link to='/bulk-grading'>Bulk Grading</Link>
					</li>
					<li>
						<Link to='/upload'>Upload</Link>
					</li>
					<li>
						<Link to='/help'>Help</Link>
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
							Drag and drop your file here or click to browse
						</p>
						<input
							type='file'
							className={styles.fileInput}
							onChange={handleChange}
							accept='image/*'
						/>
					</div>

					{file && (
						<div className={styles.fileList}>
							<h3 className={styles.fileListTitle}>Uploaded File</h3>
							<div className={styles.fileItem}>
								<img
									src={file.preview}
									alt='Preview'
									className={styles.imagePreview}
								/>
								<span>{file.file.name}</span>
								<button
									onClick={removeFile}
									className={styles.removeButton}
									aria-label='Remove file'>
									<X size={16} />
								</button>
							</div>
							<div className={styles.buttonContainer}>
								<button onClick={handleUpload} className={styles.uploadButton}>
									Search for Card
								</button>
							</div>
						</div>
					)}

					{error && <p style={{ color: 'red' }}>{error}</p>}

					{matches.length > 0 && (
						<div className={styles.matches}>
							<h3>Potential Matches</h3>
							{matches.map((match, index) => (
								<div key={index} className={styles.matchItem}>
									<p>
										{match.name} - {match.set.name}
									</p>
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
