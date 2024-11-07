import { useCallback } from 'react';
// Cache duration configuration
export const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

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

	generatePriceCacheKey: (cardName, cardNumber, setTotal, grade) => {
		return `price_${cardName}_${cardNumber}_${setTotal}_${grade}`;
	},
};

// Custom hook for card caching
export const useCardCache = (cardId) => {
	// Check if cached data is still valid
	const isValidCache = (cachedData) => {
		if (!cachedData) return false;
		const now = new Date().getTime();
		return now - cachedData.timestamp < CACHE_DURATION;
	};

	const getCachedData = useCallback(() => {
		const cached = localStorage.getItem(`card_${cardId}`);
		if (!cached) return null;

		const parsedCache = JSON.parse(cached);
		if (!isValidCache(parsedCache)) {
			localStorage.removeItem(`card_${cardId}`);
			return null;
		}
		return parsedCache.data;
	}, [cardId]);

	const setCachedData = useCallback(
		(data) => {
			const cacheData = {
				data,
				timestamp: new Date().getTime(),
			};
			localStorage.setItem(`card_${cardId}`, JSON.stringify(cacheData));
		},
		[cardId]
	);

	const getCacheMetadata = useCallback(() => {
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
	}, [cardId]);

	return { getCachedData, setCachedData, getCacheMetadata };
};

// Custom hook for price caching
export const usePriceCache = (cardName, cardNumber, setTotal, grade) => {
	const cacheKey = cacheUtils.generatePriceCacheKey(
		cardName,
		cardNumber,
		setTotal,
		grade
	);

	const getCachedPrice = () => {
		const cached = localStorage.getItem(cacheKey);
		if (cached) {
			const { price, timestamp } = JSON.parse(cached);
			// Cache valid for 24 hours
			if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
				return price;
			}
		}
		return null;
	};

	const setCachedPrice = (price) => {
		localStorage.setItem(
			cacheKey,
			JSON.stringify({ price, timestamp: Date.now() })
		);
	};

	return { getCachedPrice, setCachedPrice };
};
