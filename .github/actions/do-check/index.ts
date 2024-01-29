import { getInput } from "@actions/core";
import { context, getOctokit } from "@actions/github";

async function run() {
	const token = getInput("token");
	const pr = getInput("pr");
	const sha = getInput("sha");
	const result = getInput("result");
	const name = getInput("name");
	const init = getInput("init");
	const changes = getInput("changes");
	const type = getInput("type") || "[]";

	console.log({ token, pr, sha });
	const octokit = getOctokit(token);

	console.log(context);

	console.log(JSON.stringify(JSON.parse(changes), null, 2));
	console.log({ type });
	let _workflow_name = name || context.workflow || "Unknown Workflow";

	const workflow_run = await octokit.rest.actions.getWorkflowRun({
		owner: context.repo.owner,
		repo: context.repo.repo,
		run_id: context.runId,
	});
	console.log({ workflow_run });

	if (init === "true") {
		const has_changes = JSON.parse(changes).includes(type);

		// `gradio`, `python-client`, `js`, `js-client`, `functional`

		if (type == "gradio" || type == "python-client") {
			["3.8", "3.10"].forEach((version) => {
				create_commit_status(
					octokit,
					sha,
					has_changes ? "pending" : "success",
					`test / python ${version} ${type == "gradio" ? "" : "/ client"}`,
					has_changes ? "running checks" : "no changes detected - skipped",
					workflow_run.data.html_url,
				);
			});
		} else {
			create_commit_status(
				octokit,
				sha,
				has_changes ? "pending" : "success",
				_workflow_name,
				has_changes ? "running checks" : "no changes detected - skipped",
				workflow_run.data.html_url,
			);
		}
	}

	let state: "pending" | "success" | "failure" | "error" = "pending";

	if (!result) {
		state = "failure";
	}

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

	console.log({ state, result, _workflow_name });

	// console.log(JSON.stringify(workflow_run, null, 2));

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

	// }
}

run();

function create_commit_status(
	octokit: ReturnType<typeof getOctokit>,
	sha: string,
	state: "pending" | "success" | "failure" | "error",
	_workflow_name: string,
	description: string,
	target_url?: string,
) {
	octokit.rest.repos.createCommitStatus({
		owner: context.repo.owner,
		repo: context.repo.repo,
		sha,
		state,
		description,
		context: _workflow_name,
		target_url,
	});
}

// error, failure, pending, success
// success, failure, cancelled, or skipped
