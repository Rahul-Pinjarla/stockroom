# Miivo take-home: Stockroom

Thanks for taking the time to do this. Plan for **3 to 4 hours**. We do not expect you to finish everything. We care more about how you prioritise, how you find root causes and how you explain your decisions than about a complete list.

You may use any tools you normally use, including AI assistants. After you submit, we meet for a live session on your pull requests. We review your code with you, and you make a change to it during the call. Make sure you understand and agree with all the code you submit.

## The work

All work is in the [issues](https://github.com/ssnxd/stockroom/issues):

- **Bug reports** ([label: bug](https://github.com/ssnxd/stockroom/issues?q=is%3Aissue+label%3Abug)). These came from the store team. They describe what people saw, not what is wrong in the code. #9 is a bonus.
- **Feature: partial refunds** (#1).

For each bug report, fix it or explain why you did not, on the issue or in a pull request. When you fix one, find the root cause and add a test that would have caught it, where a test makes sense.

## How to submit

1. Fork this repository and clone your fork.
2. Work on branches, not on `main`. Use one branch per issue, or group small related fixes.
3. Open pull requests from your fork to `ssnxd/stockroom` `main`:
   - Link the issue in the description, for example `Fixes #4`.
   - Say what the root cause was, how you fixed it and how you tested it.
   - Keep CI green. It runs the type check, the tests and the web build on every pull request.
   - Keep the refunds feature in its own pull request.
4. Add a `DECISIONS.md` in the refunds pull request:
   - The decisions you made for the refund feature, and why.
   - What you would do next with more time, including any other problems you noticed.
5. Send us the links to your pull requests when you are done.

Small, focused commits help us follow your work. Do not spend time on authentication, deployment or cross-browser polish.

Setup instructions are in the [README](README.md).
