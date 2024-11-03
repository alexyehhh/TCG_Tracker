// Cache duration configuration
export const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds (can be adjusted)

// General cache utilities
export const cacheUtils = {
	clearAllCardCache: () => {
		const keys = Object.keys(localStorage);
		keys.forEach((key) => {
			if (key.startsWith('card_') || key.startsWith('price_')) {
				localStorage.removeItem(key);
			}
		});
	},

	clearCardCache: (cardId) => {
		localStorage.removeItem(`card_${cardId}`);
		// Also clear associated price caches
		const keys = Object.keys(localStorage);
		keys.forEach((key) => {
			if (key.startsWith(`price_`) && key.includes(cardId)) {
				localStorage.removeItem(key);
			}
		});
	},

	getCacheExpiryDate: (timestamp) => {
		return new Date(timestamp + CACHE_DURATION).toLocaleDateString();
	},

	getRemainingCacheTime: (timestamp) => {
		const now = new Date().getTime();
		const remaining = timestamp + CACHE_DURATION - now;
		const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
		const hours = Math.floor(
			(remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
		);
		return { days, hours };
	},
};

// Custom hook for card caching
export const useCardCache = (cardId) => {
	// Helper function to check if cached data is still valid
	const isValidCache = (cachedData) => {
		if (!cachedData) return false;
		const now = new Date().getTime();
		return now - cachedData.timestamp < CACHE_DURATION;
	};

	// Helper function to get cached data
	const getCachedData = () => {
		const cached = localStorage.getItem(`card_${cardId}`);
		if (!cached) return null;

		const parsedCache = JSON.parse(cached);
		if (!isValidCache(parsedCache)) {
			localStorage.removeItem(`card_${cardId}`);
			return null;
		}
		return parsedCache.data;
	};

	// Helper function to set cached data
	const setCachedData = (data) => {
		const cacheData = {
			data,
			timestamp: new Date().getTime(),
		};
		localStorage.setItem(`card_${cardId}`, JSON.stringify(cacheData));
	};

	// Get cache metadata
	const getCacheMetadata = () => {
		const cached = localStorage.getItem(`card_${cardId}`);
		if (!cached) return null;

		const parsedCache = JSON.parse(cached);
		const { timestamp } = parsedCache;
		const { days, hours } = cacheUtils.getRemainingCacheTime(timestamp);
		const expiryDate = cacheUtils.getCacheExpiryDate(timestamp);

		return {
			expiryDate,
			remainingDays: days,
			remainingHours: hours,
		};
	};

	return { getCachedData, setCachedData, getCacheMetadata };
};

// Custom hook for price caching
export const usePriceCache = (cardName, grade) => {
	const cacheKey = `price_${cardName}_${grade}`;

	// Helper function to check if cached price is still valid
	const isValidCache = (cachedData) => {
		if (!cachedData) return false;
		const now = new Date().getTime();
		return now - cachedData.timestamp < CACHE_DURATION;
	};

	// Helper function to get cached price
	const getCachedPrice = () => {
		const cached = localStorage.getItem(cacheKey);
		if (!cached) return null;

		const parsedCache = JSON.parse(cached);
		if (!isValidCache(parsedCache)) {
			localStorage.removeItem(cacheKey);
			return null;
		}
		return parsedCache.price;
	};

	// Helper function to set cached price
	const setCachedPrice = (price) => {
		const cacheData = {
			price,
			timestamp: new Date().getTime(),
		};
		localStorage.setItem(cacheKey, JSON.stringify(cacheData));
	};

	// Get cache metadata
	const getPriceCacheMetadata = () => {
		const cached = localStorage.getItem(cacheKey);
		if (!cached) return null;

		const parsedCache = JSON.parse(cached);
		const { timestamp } = parsedCache;
		const { days, hours } = cacheUtils.getRemainingCacheTime(timestamp);
		const expiryDate = cacheUtils.getCacheExpiryDate(timestamp);

		return {
			expiryDate,
			remainingDays: days,
			remainingHours: hours,
		};
	};

	return { getCachedPrice, setCachedPrice, getPriceCacheMetadata };
};
