import { getInput } from "@actions/core";
import { context, getOctokit } from "@actions/github";

async function run() {
	const token = getInput("token");
	const pr = getInput("pr");
	const sha = getInput("sha");
	const result = getInput("result");

	console.log({ token, pr, sha });
	const octokit = getOctokit(token);

	console.log(context);

	const _workflow_name = context.workflow || "Unknown Workflow";
	const _status = context.payload.workflow_run.status;

	let state: "pending" | "success" | "failure" | "error" = "pending";

	if (_status === "completed") {
		if (result === "success") {
			state = "success";
		} else if (result === "failure") {
			state = "failure";
		} else if (result === "cancelled") {
			state = "pending";
		} else if (result === "skipped") {
			state = "success";
		} else {
			state = "error";
		}
	}

	if (_status === "queued" || _status === "in_progress") {
		state = "pending";
	}

	console.log({ state, _status, result, _workflow_name });

	octokit.rest.repos.createCommitStatus({
		owner: context.repo.owner,
		repo: context.repo.repo,
		sha,
		state,
		description: "This is a passing test",
		context: _workflow_name,
		target_url: "https://google.com",
	});
}

run();

// error, failure, pending, success
// success, failure, cancelled, or skipped
