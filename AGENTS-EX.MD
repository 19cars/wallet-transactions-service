## Project Context

- Language/runtime: nodejs 20+, nestjs lts,
- How to run locally: npm run dev
- How to run test: npm run test

## Code Style

- Naming conventions, comments policy, formatting rules.
- Prefer Streams/filters; avoid imperative loops when possible.
- Use Objects.requiredNonNul(...) / StringUtils.isBlank(...) checks.

## Dependencies

- Allowed libraries (version or ranges).
- Disallowed or deprecated libs.

## Testing & Quality

- Use AssertJ (no bare JUnit assertions).
- Minimum coverage: 85%
- Lint/QA: how to run (e.g., Sonar, SpotBugs).

## API && Security

- Auth required by default (JWT/session/OAuth).
- Error model: problem+json; status codes; logging policy.

## Git && CI

- Conventional Commits.
- CI must run tests and static analysis before merge.
