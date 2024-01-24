import { getInput } from "@actions/core";
import { context, getOctokit } from "@actions/github";

async function run() {
	const token = getInput("token");
	const pr = getInput("pr");
	const sha = getInput("sha");
	const octokit = getOctokit(token);

	if (context.eventName === "workflow_run") {
	}

	console.log(context.payload.workflow_run);

	const conclusion = context.payload.workflow_run.conclusion;

	const wf = await octokit.rest.actions.getWorkflowRun({
		owner: context.repo.owner,
		repo: context.repo.repo,
		run_id: context.payload.workflow_run.id,
	});

	console.log(JSON.stringify(wf.data, null, 2));

	// const _workflow_name = wf.data.name || "Unknown Workflow";
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

	// octokit.rest.repos.createCommitStatus({
	// 	owner: context.repo.owner,
	// 	repo: context.repo.repo,
	// 	sha,
	// 	state: "failure",
	// 	description: "This is a failing test",
	// 	context: "check/failing",
	// 	target_url: "https://google.com",
	// });

	// octokit.rest.repos.createCommitStatus({
	// 	owner: context.repo.owner,
	// 	repo: context.repo.repo,
	// 	sha,
	// 	state: "error",
	// 	description: "This is an error test",
	// 	context: "check/error",
	// 	target_url: "https://google.com",
	// });

	// octokit.rest.repos.createCommitStatus({
	// 	owner: context.repo.owner,
	// 	repo: context.repo.repo,
	// 	sha,
	// 	state: "pending",
	// 	description: "This is a pending test",
	// 	context: "check/pending",
	// 	target_url: "https://google.com",
	// });
}

run();

// error, failure, pending, success
