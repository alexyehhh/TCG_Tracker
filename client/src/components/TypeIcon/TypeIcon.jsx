import Colorless from '../../assets/images/colorlessEnergy.png';
import Darkness from '../../assets/images/darkEnergy.png';
import Dragon from '../../assets/images/dragonEnergy.png';
import Lightning from '../../assets/images/lightningEnergy.png';
import Fairy from '../../assets/images/fairyEnergy.png';
import Fighting from '../../assets/images/fightingEnergy.png';
import Fire from '../../assets/images/fireEnergy.png';
import Grass from '../../assets/images/grassEnergy.png';
import Metal from '../../assets/images/metalEnergy.png';
import Psychic from '../../assets/images/psychicEnergy.png';
import Water from '../../assets/images/waterEnergy.png';

import styles from './TypeIcon.module.css';

const TypeIcon = ({ type }) => {
	const typeToImage = {
		Colorless: Colorless,
		Darkness: Darkness,
		Dragon: Dragon,
		Lightning: Lightning,
		Fairy: Fairy,
		Fighting: Fighting,
		Fire: Fire,
		Grass: Grass,
		Metal: Metal,
		Psychic: Psychic,
		Water: Water,
	};

	const imagePath = typeToImage[type] || '/images/colorlessEnergy.png';

	return (
		<img src={imagePath} alt={`${type} energy`} className={styles.typeIcon} />
	);
};

export default TypeIcon;
