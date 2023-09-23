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

	octokit.rest.repos.createCommitStatus({
		owner: context.repo.owner,
		repo: context.repo.repo,
		sha,
		state: "success",
		description: "This is a passing test",
		context: "check/passing",
	});

	octokit.rest.repos.createCommitStatus({
		owner: context.repo.owner,
		repo: context.repo.repo,
		sha,
		state: "failure",
		description: "This is a failing test",
		context: "check/failing",
	});

	octokit.rest.repos.createCommitStatus({
		owner: context.repo.owner,
		repo: context.repo.repo,
		sha,
		state: "error",
		description: "This is an error test",
		context: "check/error",
	});

	octokit.rest.repos.createCommitStatus({
		owner: context.repo.owner,
		repo: context.repo.repo,
		sha,
		state: "pending",
		description: "This is a pending test",
		context: "check/pending",
	});
}

run();

// error, failure, pending, success
