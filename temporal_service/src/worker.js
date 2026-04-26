require("dotenv").config();
const { Worker } = require("@temporalio/worker");
const activities = require("./activities");

async function runWorker() {
	const taskQueue =
		process.env.TEMPORAL_TASK_QUEUE || "audio-processing-task-queue";

	const worker = await Worker.create({
		workflowsPath: require.resolve("./workflows"),
		activities,
		taskQueue,
	});

	console.log(`Temporal worker started on task queue: ${taskQueue}`);
	await worker.run();
}

runWorker().catch((error) => {
	console.error("Temporal worker failed to start:", error);
	process.exit(1);
});
