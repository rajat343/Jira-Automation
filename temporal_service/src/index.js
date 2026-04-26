require("dotenv").config();
const express = require("express");
const { getTemporalClient } = require("./temporalClient");

const app = express();
app.use(express.json());

const port = process.env.PORT || 8082;
const taskQueue =
	process.env.TEMPORAL_TASK_QUEUE || "audio-processing-task-queue";

app.get("/health-check", async (req, res) => {
	try {
		await getTemporalClient();
		res.status(200).json({ status: "ok", temporal_connected: true });
	} catch (error) {
		res.status(500).json({
			status: "error",
			temporal_connected: false,
			message: error.message,
		});
	}
});

app.post("/workflows/audio-processing/start", async (req, res) => {
	try {
		const { user_id: userId, project_id: projectId } = req.body;
		if (!userId || !projectId) {
			return res.status(400).json({
				message: "user_id and project_id are required",
			});
		}

		const client = await getTemporalClient();
		const workflowId = `audio-processing-${userId}-${projectId}-${Date.now()}`;
		await client.workflow.start("audioProcessingWorkflow", {
			taskQueue,
			workflowId,
			args: [{ user_id: userId, project_id: projectId }],
		});

		res.status(202).json({
			message: "Workflow started successfully",
			workflow_id: workflowId,
			task_queue: taskQueue,
		});
	} catch (error) {
		console.error("Failed to start workflow:", error);
		res.status(500).json({
			message: "Failed to start workflow",
			error: error.message,
		});
	}
});

app.get("/workflows/:workflowId/status", async (req, res) => {
	try {
		const client = await getTemporalClient();
		const handle = client.workflow.getHandle(req.params.workflowId);
		const description = await handle.describe();
		res.status(200).json({
			workflow_id: req.params.workflowId,
			status: description.status.name || description.status,
			task_queue: description.taskQueue,
		});
	} catch (error) {
		res.status(404).json({
			message: "Workflow not found",
			error: error.message,
		});
	}
});

app.listen(port, () => {
	console.log(`Temporal service API running on port ${port}`);
});
