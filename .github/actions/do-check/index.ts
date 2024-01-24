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

	let _workflow_name = context.workflow || "Unknown Workflow";

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

	if (result === "pending") {
		const runs = [
			"test / js",
			"test / visual",
			"test / python",
			"test / functional",
			"build / js",
			"build / python",
			"deploy / js",
			"deploy / python",
		];

		await Promise.all(
			runs.map((run) =>
				octokit.rest.repos.createCommitStatus({
					owner: context.repo.owner,
					repo: context.repo.repo,
					sha,
					state: "pending",
					description: "Running checks",
					context: run,
					target_url: "https://google.com",
				}),
			),
		);
	} else {
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
}

run();

// error, failure, pending, success
// success, failure, cancelled, or skipped
