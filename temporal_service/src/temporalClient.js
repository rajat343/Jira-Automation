const { Connection, Client } = require("@temporalio/client");

let temporalClient = null;

async function getTemporalClient() {
	if (temporalClient) {
		return temporalClient;
	}

	const address = process.env.TEMPORAL_ADDRESS || "localhost:7233";
	const namespace = process.env.TEMPORAL_NAMESPACE || "default";
	const connection = await Connection.connect({ address });
	temporalClient = new Client({ connection, namespace });
	return temporalClient;
}

module.exports = { getTemporalClient };
