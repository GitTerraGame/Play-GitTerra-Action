export default async function addGitterraPRComment({ github, context }) {
  const { owner, repo } = context.repo;
  const mergeCommitSha = context.sha; // The SHA of the commit that triggered the push

  console.log(`Starting process for commit SHA: ${mergeCommitSha}`);

  // --- Step 1: Find Merged Pull Request ---
  console.log(`Searching for PRs merged with commit SHA: ${mergeCommitSha}`);

  const pulls = await github.rest.pulls.list({
    owner,
    repo,
    state: "closed",
    base: context.ref.replace("refs/heads/", ""),
    sort: "updated",
    direction: "desc",
    per_page: 10,
  });

  let prNumber = null;
  let prTitle = null;

  for (const pull of pulls.data) {
    if (pull.merged_at && pull.merge_commit_sha === mergeCommitSha) {
      prNumber = pull.number;
      prTitle = pull.title;
      console.log(`Found merged PR #${prNumber}: ${prTitle}`);
      break;
    }
  }

  if (!prNumber) {
    console.log(
      "No merged Pull Request found for this push event matching the commit SHA. Exiting."
    );
    // Exit the script if no PR is found, as subsequent steps depend on it.
    return;
  }

  // --- Step 2: Get GitHub Pages Site Information ---
  let githubPagesUrl = null;

  try {
    const { data: pagesInfo } = await github.rest.repos.getPages({
      owner,
      repo,
    });
    githubPagesUrl = pagesInfo.html_url;
    console.log(`GitHub Pages URL fetched: ${githubPagesUrl}`);
  } catch (error) {
    console.error(`Failed to get GitHub Pages info: ${error.message}`);
    // Fall back to constructing the URL manually if API call fails.
    const repoOwnerLower = owner.toLowerCase();
    const repoNameLower = repo.toLowerCase();
    githubPagesUrl = `https://${repoOwnerLower}.github.io/${repoNameLower}/`;
    console.log(`Falling back to constructed URL: ${githubPagesUrl}`);
  }

  // --- Step 3: Prepare Comment ---
  const commentBody = `[<img src="${githubPagesUrl}map.png" height="150"/>](${githubPagesUrl})
            GitTerra map of your world is ready: ${githubPagesUrl}`;

  console.log(`Prepared comment for PR #${prNumber}`);

  // --- Step 4: Add comment to Pull Request ---
  await github.rest.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: prNumber,
    body: commentBody,
  });

  console.log(`Comment added to PR #${prNumber}.`);
}
