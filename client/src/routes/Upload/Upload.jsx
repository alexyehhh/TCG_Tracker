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
	const [files, setFiles] = useState([]);
	const [matches, setMatches] = useState([]);
	const [error, setError] = useState('');
	const navigate = useNavigate(); // Use useNavigate to redirect to pokemoncards.jsx

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
		const previewFiles = droppedFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file),
        }));
		setFiles((prevFiles) => [...prevFiles, ...previewFiles]);
	};

	const handleChange = (e) => {
		const uploadedFiles = Array.from(e.target.files);
		const previewFiles = uploadedFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file),
        }));
		setFiles((prevFiles) => [...prevFiles, ...previewFiles]);
	};

	const removeFile = (indexToRemove) => {
		setFiles((prevFiles) => {
            // revokes object URL to release memory
            URL.revokeObjectURL(prevFiles[indexToRemove].preview);
            return prevFiles.filter((_, index) => index !== indexToRemove);
        });
	};

	const handleUpload = async () => {
		if (files.length === 0) {
			setError("Please select an image first.");
			return;
		}
	
		const formData = new FormData();
		formData.append('file', files[0].file);
	
		try {
			console.log("Starting upload...");
			// console.log("Form Data:", formData);

			const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/recognizeCard`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			});
			console.log("Server response:", response.data);
			// setMatches(response.data.matches);
			const { matches, searchQuery } = response.data; 
			setError('');
			setMatches(matches || []);

			// Redirect to PokemonCards page with search query
			navigate(`/pokemon-cards?name=${encodeURIComponent(searchQuery)}`);

		} catch (err) {
			console.error("Error uploading image:", err.response ? err.response.data : err.message);
			setError(err.response && err.response.data.error ? err.response.data.error : 'Failed to recognize card. Please try again.');
		}
	};

	return (
		<div className={styles.container}>
			<PokemonBackground />
			<nav className={styles.navbar}>
				<ul className={styles.navLinks}>
					<li><Link to='/'>Search</Link></li>
					<li><Link to='/collection'>Collection</Link></li>
					<li><Link to='/bulk-grading'>Bulk Grading</Link></li>
					<li><Link to='/upload'>Upload</Link></li>
				</ul>
			</nav>

			<main className={styles.main}>
				<div className={styles.uploadContainer}>
					<div
						className={`${styles.dropzone} ${dragActive ? styles.dragActive : ''}`}
						onDragEnter={handleDrag}
						onDragLeave={handleDrag}
						onDragOver={handleDrag}
						onDrop={handleDrop}
					>
						<Upload size={48} className={styles.uploadIcon} />
						<h2 className={styles.uploadTitle}>Upload Pokemon Cards</h2>
						<p className={styles.uploadText}>Drag and drop your files here or click to browse</p>
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
							{files.map((fileObj, index) => (
								<div key={index} className={styles.fileItem}>
									<img src={fileObj.preview} alt={`Preview ${index + 1}`} className={styles.imagePreview} />
									<span>{fileObj.file.name}</span>
									<button onClick={() => removeFile(index)} className={styles.removeButton} aria-label='Remove file'>
										<X size={16} />
									</button>
								</div>
							))}
							<button onClick={handleUpload} className={styles.uploadButton}>Process Card</button>
						</div>
					)}

					{error && <p style={{ color: 'red' }}>{error}</p>}

					{matches.length > 0 && (
						<div className={styles.matches}>
							<h3>Potential Matches</h3>
							{matches.map((match, index) => (
								<div key={index} className={styles.matchItem}>
									<p>{match.name} - {match.set.name}</p>
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
