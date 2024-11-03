async function getEbayAccessToken() {
	const clientId = process.env.EBAY_CLIENT_ID;
	const clientSecret = process.env.EBAY_CLIENT_SECRET;

	try {
		const response = await fetch(
			'https://api.ebay.com/identity/v1/oauth2/token',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					Authorization: `Basic ${Buffer.from(
						`${clientId}:${clientSecret}`
					).toString('base64')}`,
				},
				body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
			}
		);

		if (!response.ok) {
			const errorText = await response.text();
			let errorData;
			try {
				errorData = JSON.parse(errorText);
			} catch (e) {
				errorData = errorText;
			}
			console.error('Error fetching access token:', response.status, errorData);
			throw new Error(`Failed to fetch token: ${JSON.stringify(errorData)}`);
		}

		const data = await response.json();

		if (!data.access_token) {
			console.error('Access token not found in the response:', data);
			throw new Error('Access token not found in response');
		}

		const expiresAt = Date.now() + data.expires_in * 1000;
		return {
			token: data.access_token,
			expiresAt,
		};
	} catch (error) {
		console.error('Error getting eBay access token:', error);
		throw error;
	}
}

let tokenCache = null;

async function getValidToken() {
	if (tokenCache && Date.now() < tokenCache.expiresAt - 60000) {
		return tokenCache.token;
	}

	const newToken = await getEbayAccessToken();
	tokenCache = newToken;
	return newToken.token;
}

module.exports = { getValidToken };
