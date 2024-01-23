console.log("hello");

import { getInput } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { exec } from "@actions/exec";

async function run() {
	const token = getInput("github-token");
	const octokit = getOctokit(token);

	let output = "";
	await exec("git", ["rev-parse", "HEAD"], {
		listeners: {
			stdout: (data) => {
				output = data.toString();
			},
			stderr: (data) => {
				console.log(`stderr: ${data.toString()}`);
			},
		},
	});

	const sha = output.trim();

	console.log(context.payload.workflow_run);

	const wf = await octokit.rest.actions.getWorkflowRun({
		owner: context.repo.owner,
		repo: context.repo.repo,
		run_id: context.payload.workflow_run.id,
	});

	console.log(JSON.stringify(wf.data, null, 2));

	octokit.rest.repos.createCommitStatus({
		owner: context.repo.owner,
		repo: context.repo.repo,
		sha,
		state: "success",
		description: "This is a passing test",
		context: "check/passing",
		target_url: "https://google.com",
	});

	octokit.rest.repos.createCommitStatus({
		owner: context.repo.owner,
		repo: context.repo.repo,
		sha,
		state: "failure",
		description: "This is a failing test",
		context: "check/failing",
		target_url: "https://google.com",
	});

	octokit.rest.repos.createCommitStatus({
		owner: context.repo.owner,
		repo: context.repo.repo,
		sha,
		state: "error",
		description: "This is an error test",
		context: "check/error",
		target_url: "https://google.com",
	});

	octokit.rest.repos.createCommitStatus({
		owner: context.repo.owner,
		repo: context.repo.repo,
		sha,
		state: "pending",
		description: "This is a pending test",
		context: "check/pending",
		target_url: "https://google.com",
	});
}

run();

// error, failure, pending, success
