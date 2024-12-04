// Upload.jsx
import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './Upload.module.css';
import { Link } from 'react-router-dom';
import PokemonBackground from '../../components/PokemonBackground/PokemonBackground';
import axios from 'axios';

// component definition for the upload page
const UploadPage = () => {
	const [dragActive, setDragActive] = useState(false); // indicates if a file is being dragged over the drop area
	const [file, setFile] = useState(null); // stores the selected file but only one is allowed
	const [matches, setMatches] = useState([]); // stores the matched results from the server
	const [error, setError] = useState(''); // stores error messages for user feedback
	const navigate = useNavigate(); // navigation instance for programmatic route changes
  
	// handle drag events
	const handleDrag = (e) => {
	  e.preventDefault(); // prevent default behavior
	  e.stopPropagation(); // stop event propagation
	  if (e.type === 'dragenter' || e.type === 'dragover') {
		setDragActive(true); // set dragActive to true if a file is dragged over
	  } else if (e.type === 'dragleave') {
		setDragActive(false); // set dragActive to false if the drag leaves the area
	  }
	};
  
	// handle file drop event
	const handleDrop = (e) => {
	  e.preventDefault(); // prevent default behavior
	  e.stopPropagation();
	  setDragActive(false); // reset dragActive state
  
	  // get the first file from the dropped files
	  const droppedFile = e.dataTransfer.files[0];
	  const previewFile = {
		file: droppedFile, // actual file object
		preview: URL.createObjectURL(droppedFile), // url for previewing the image
	  };
  
	  // replace the current file if one already exists
	  if (file) {
		URL.revokeObjectURL(file.preview); // remove the URL of the previous preview to free memory
	  }
	  setFile(previewFile); // update state with the new file
	};
  
	// handle file input change
	const handleChange = (e) => {
	  // get the first file from the input
	  const uploadedFile = e.target.files[0];
	  const previewFile = {
		file: uploadedFile,
		preview: URL.createObjectURL(uploadedFile), // create a preview URL
	  };
  
	  // replace the current file if one already exists
	  if (file) {
		URL.revokeObjectURL(file.preview); // remove the URL of the previous preview
	  }
	  setFile(previewFile); // update state with the new file
	};
  
	// remove the current file from the state
	const removeFile = () => {
	  if (file) {
		URL.revokeObjectURL(file.preview); // remove the URL of the current file preview
		setFile(null); // clear the file state
	  }
	};
  
	// handle file upload to the server
	const handleUpload = async () => {
	  // check if a file is selected
	  if (!file) {
		setError('Please select an image first.'); // show error if no file is selected
		return;
	  }
  
	  // prepare the file data for upload
	  const formData = new FormData();
	  formData.append('file', file.file); // append the file to the form data
  
	  try {
		console.log('Starting upload...');
		// send the file to the server using an API request
		const response = await axios.post(
		  `${import.meta.env.VITE_API_URL}/api/recognizeCard`, // endpoint for card recognition
		  formData,
		  {
			headers: {
			  'Content-Type': 'multipart/form-data', // specify the content type
			},
		  }
		);
  
		console.log('Server response:', response.data);
		const { matches, searchQuery } = response.data; // get response data
		setError(''); // clear any previous errors
		setMatches(matches || []); // update matches state with the response
  
		// go to the PokemonCards page with the search query as a parameter
		navigate(`/pokemon-cards?name=${encodeURIComponent(searchQuery)}`);
	  } catch (err) {
		// handle errors from the upload process
		console.error(
		  'Error uploading image:',
		  err.response ? err.response.data : err.message // log detailed error information
		);
  
		// display error message to the user
		setError(
		  err.response && err.response.data.error
			? err.response.data.error //  server-provided error message if available
			: 'Failed to recognize card. Please try again.' // fallback error message
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
