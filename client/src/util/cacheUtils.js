const generateCacheKey = (cardId, total) => `cardPrice_${cardId}_${total}`;

export const getCachedPrice = (cardId, total) => {
	const cacheKey = generateCacheKey(cardId, total);
	const cachedData = localStorage.getItem(cacheKey);
	if (cachedData) {
		const parsedData = JSON.parse(cachedData);
		const isExpired = new Date().getTime() > parsedData.expiry;
		return isExpired ? null : parsedData.data;
	}
	return null;
};

export const setCachedPrice = (
	cardId,
	total,
	prices,
	cacheDuration = 7 * 24 * 60 * 60 * 1000 // 7 days
) => {
	const cacheKey = generateCacheKey(cardId, total);
	const expiry = new Date().getTime() + cacheDuration;
	localStorage.setItem(cacheKey, JSON.stringify({ data: prices, expiry }));
};

export const clearCacheForCard = (cardId, total) => {
	const cacheKey = generateCacheKey(cardId, total);
	localStorage.removeItem(cacheKey);
};
