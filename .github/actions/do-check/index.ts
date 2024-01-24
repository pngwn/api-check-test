import { getInput } from "@actions/core";
import { context, getOctokit } from "@actions/github";

async function run() {
	const token = getInput("token");
	const pr = getInput("pr");
	const sha = getInput("sha");

	console.log({ token, pr, sha });
	const octokit = getOctokit(token);

	if (context.eventName === "workflow_run") {
	}

	console.log(context);

	const conclusion = context.payload.workflow_run.conclusion;

	const _workflow_name =
		context.payload.workflow_run.name || "Unknown Workflow";
	const _status = context.payload.workflow_run.status;

	let state: "pending" | "success" | "failure" | "error" = "pending";

	if (_status === "completed") {
		if (conclusion === "success") {
			state = "success";
		} else if (conclusion === "failure") {
			state = "failure";
		} else if (conclusion === "cancelled") {
			state = "pending";
		} else if (conclusion === "skipped") {
			state = "success";
		} else if (conclusion === "timed_out") {
			state = "failure";
		} else {
			state = "error";
		}
	}

	if (_status === "queued" || _status === "in_progress") {
		state = "pending";
	}

	console.log({ state, _status, conclusion, _workflow_name });

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
