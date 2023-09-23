console.log("hello");

import { getInput } from "@actions/core";
import { context, getOctokit } from "@actions/github";

async function run() {
	const token = getInput("token");
	const octokit = getOctokit(token);

	octokit.rest.repos.createCommitStatus({
		owner: context.repo.owner,
		repo: context.repo.repo,
		sha: context.sha,
		state: "success",
		description: "This is a passing test",
	});

	octokit.rest.repos.createCommitStatus({
		owner: context.repo.owner,
		repo: context.repo.repo,
		sha: context.sha,
		state: "failure",
		description: "This is a failing test",
	});

	octokit.rest.repos.createCommitStatus({
		owner: context.repo.owner,
		repo: context.repo.repo,
		sha: context.sha,
		state: "error",
		description: "This is an error test",
	});

	octokit.rest.repos.createCommitStatus({
		owner: context.repo.owner,
		repo: context.repo.repo,
		sha: context.sha,
		state: "pending",
		description: "This is a pending test",
	});
}

run();

// error, failure, pending, success
