import { getInput } from "@actions/core";
import { context, getOctokit } from "@actions/github";

async function run() {
	const token = getInput("token");
	const pr = getInput("pr");
	const sha = getInput("sha");
	const result = getInput("result");
	const name = getInput("name");

	console.log({ token, pr, sha });
	const octokit = getOctokit(token);

	console.log(context);

	let _workflow_name = name || context.workflow || "Unknown Workflow";

	let state: "pending" | "success" | "failure" | "error" = "pending";

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

	if (result === "pending") {
		state = "pending";
	}

	console.log({ state, result, _workflow_name });

	const workflow_run = await octokit.rest.actions.getWorkflowRun({
		owner: context.repo.owner,
		repo: context.repo.repo,
		run_id: context.runId,
	});

	console.log(JSON.stringify(workflow_run, null, 2));

	// if (result === "pending") {
	// 	const workflows = await octokit.rest.actions.listRepoWorkflows({
	// 		owner: context.repo.owner,
	// 		repo: context.repo.repo,
	// 	});
	// 	const runs = [
	// 		"test / functional",
	// 		"test / visual",
	// 		"test / js",
	// 		"test / python 3.8",
	// 		"test / python 3.10",
	// 		"test / windows / python 3.8",
	// 		"test / windows / python 3.10",
	// 		"build / js",
	// 		"build / python",
	// 		"deploy / website",
	// 		"deploy / publish",
	// 	];

	// 	// const urls = await Promise.all(
	// 	// 	runs.map((run) =>{
	// 	// 		const x = workflows.data.workflows.find((workflow) => workflow.name === run),
	// 	// 		return {
	// 	// 			name: run,
	// 	// 			url: x ? x.html_url : null
	// 	// 		};
	// 	// 	}

	// 	// );

	// 	await Promise.all(
	// 		runs.map((run) =>
	// 			octokit.rest.repos.createCommitStatus({
	// 				owner: context.repo.owner,
	// 				repo: context.repo.repo,
	// 				sha,
	// 				state: "pending",
	// 				description: "Running checks",
	// 				context: run,
	// 				target_url: "https://google.com",
	// 			}),
	// 		),
	// 	);
	// } else {
	octokit.rest.repos.createCommitStatus({
		owner: context.repo.owner,
		repo: context.repo.repo,
		sha,
		state,
		description: "This is a passing test",
		context: _workflow_name,
		target_url: "https://google.com",
	});
	// }
}

run();

// error, failure, pending, success
// success, failure, cancelled, or skipped
