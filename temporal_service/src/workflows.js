const { proxyActivities, sleep } = require("@temporalio/workflow");

const { getActiveStoriesCount } = proxyActivities({
	startToCloseTimeout: "30 seconds",
	retry: {
		maximumAttempts: 3,
	},
});

async function audioProcessingWorkflow(input) {
	const { user_id: userId, project_id: projectId } = input;
	const maxChecks = 36;
	const checkIntervalMs = 10000;

	for (let i = 0; i < maxChecks; i += 1) {
		const activeStoriesCount = await getActiveStoriesCount(userId, projectId);
		if (typeof activeStoriesCount === "number" && activeStoriesCount > 0) {
			return {
				status: "completed",
				user_id: userId,
				project_id: projectId,
				active_stories: activeStoriesCount,
				checks: i + 1,
			};
		}
		await sleep(checkIntervalMs);
	}

	return {
		status: "timeout",
		user_id: userId,
		project_id: projectId,
		message: "Stories were not generated within workflow timeout window.",
		checks: maxChecks,
	};
}

module.exports = { audioProcessingWorkflow };
