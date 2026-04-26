const axios = require("axios");

async function getActiveStoriesCount(userId, projectId) {
	const storyServiceBaseUrl = process.env.STORY_SERVICE_BASE_URL;
	if (!storyServiceBaseUrl) {
		throw new Error("STORY_SERVICE_BASE_URL is not configured.");
	}

	const response = await axios.get(
		`${storyServiceBaseUrl}/api/getActiveStories`,
		{
			params: {
				user_id: userId,
				project_id: projectId,
			},
		}
	);

	const activeStories = response?.data?.activeStories;
	if (Array.isArray(activeStories)) {
		return activeStories.length;
	}
	if (typeof activeStories === "number") {
		return activeStories;
	}
	return 0;
}

module.exports = { getActiveStoriesCount };
