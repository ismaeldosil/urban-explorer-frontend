# CI/CD Workflow Diagram

## Workflow Execution Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub Push/PR Event                         │
│               (to main or develop branch)                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────┐
│                  Trigger CI Workflow                            │
└────────────────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┬───────────────┐
         │               │               │               │
         ▼               ▼               ▼               ▼
    ┌────────┐      ┌────────┐     ┌────────┐     ┌────────┐
    │ Build  │      │  Lint  │     │  Test  │     │Coverage│
    │  Job   │      │  Job   │     │  Job   │     │  Check │
    └────────┘      └────────┘     └────────┘     └────────┘
         │               │               │               │
         │               │               │               │
    [Parallel]      [Parallel]     [Parallel]      [Needs Test]
         │               │               │               │
         ▼               ▼               ▼               ▼
    ┌────────┐      ┌────────┐     ┌────────┐     ┌────────┐
    │  Pass  │      │  Pass  │     │  Pass  │     │  Pass  │
    │  Fail  │      │  Fail  │     │  Fail  │     │  Fail  │
    └────────┘      └────────┘     └────────┘     └────────┘
         │               │               │               │
         └───────────────┴───────────────┴───────────────┘
                         │
                         ▼
                ┌────────────────┐
                │ Workflow Status│
                │  ✅ Success    │
                │  ❌ Failure    │
                └────────────────┘
```

## Job Details

### 1. Build Job
```
┌─────────────────────────────────────────┐
│          Build Job (Parallel)           │
├─────────────────────────────────────────┤
│ 1. Checkout Code                        │
│ 2. Setup Node.js 20 + Cache             │
│ 3. Install Dependencies (npm ci)        │
│ 4. Build Application (npm run build)   │
│ 5. Upload Build Artifacts               │
│    - Path: www/                         │
│    - Retention: 7 days                  │
└─────────────────────────────────────────┘
         │
         ▼
    ✅ Success → Build artifacts available
    ❌ Failure → Build errors logged
```

### 2. Lint Job
```
┌─────────────────────────────────────────┐
│          Lint Job (Parallel)            │
├─────────────────────────────────────────┤
│ 1. Checkout Code                        │
│ 2. Setup Node.js 20 + Cache             │
│ 3. Install Dependencies (npm ci)        │
│ 4. Run ESLint (npm run lint)            │
└─────────────────────────────────────────┘
         │
         ▼
    ✅ Success → Code meets quality standards
    ❌ Failure → Lint errors to fix
```

### 3. Test Job
```
┌─────────────────────────────────────────┐
│       Test & Coverage (Parallel)        │
├─────────────────────────────────────────┤
│ 1. Checkout Code                        │
│ 2. Setup Node.js 20 + Cache             │
│ 3. Install Dependencies (npm ci)        │
│ 4. Run Tests (npm run test:ci)          │
│    - ChromeHeadless                     │
│    - Coverage enabled                   │
│ 5. Upload Coverage Reports              │
│    - Path: coverage/                    │
│    - Retention: 30 days                 │
│ 6. Check Coverage Threshold             │
│    - Fail if < 80%                      │
│ 7. Comment on PR (if PR event)          │
│    - Coverage table                     │
│    - Pass/Fail status                   │
└─────────────────────────────────────────┘
         │
         ▼
    ✅ Success → Tests pass, coverage ≥ 80%
    ❌ Failure → Test failures or low coverage
```

### 4. Coverage Check Job
```
┌─────────────────────────────────────────┐
│    Coverage Threshold (Sequential)      │
├─────────────────────────────────────────┤
│ Depends on: Test Job                    │
│                                         │
│ 1. Checkout Code                        │
│ 2. Download Coverage Artifacts          │
│ 3. Verify All Metrics ≥ 80%:            │
│    - Lines                              │
│    - Statements                         │
│    - Functions                          │
│    - Branches                           │
└─────────────────────────────────────────┘
         │
         ▼
    ✅ Success → All metrics ≥ 80%
    ❌ Failure → One or more metrics < 80%
```

## Coverage Report Example

When a PR is created, the workflow adds a comment:

```markdown
## Coverage Report

| Metric | Percentage | Covered / Total |
|--------|------------|-----------------|
| Lines | 85.2% | 523 / 614 |
| Statements | 84.7% | 612 / 723 |
| Functions | 82.3% | 147 / 178 |
| Branches | 81.5% | 163 / 200 |

✅ Coverage meets 80% threshold
```

## Caching Strategy

```
┌─────────────────────────────────────────┐
│         npm Cache Strategy              │
├─────────────────────────────────────────┤
│ Cache Key: OS + package-lock.json hash  │
│ Cache Path: ~/.npm                      │
│                                         │
│ First Run:                              │
│   npm ci → 2-3 minutes                  │
│   Cache saved                           │
│                                         │
│ Subsequent Runs:                        │
│   Cache restored → 10-30 seconds        │
│   npm ci (validates cache)              │
│                                         │
│ Speed Improvement: ~90% faster          │
└─────────────────────────────────────────┘
```

## Artifact Management

```
┌─────────────────────────────────────────┐
│            Build Artifacts              │
├─────────────────────────────────────────┤
│ Name: build-artifacts                   │
│ Path: www/                              │
│ Retention: 7 days                       │
│ Use: Deployment verification            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│          Coverage Artifacts             │
├─────────────────────────────────────────┤
│ Name: coverage-report                   │
│ Path: coverage/                         │
│ Retention: 30 days                      │
│ Use: Coverage analysis, reporting       │
└─────────────────────────────────────────┘
```

## Typical Workflow Timeline

```
0:00  ┌─ Workflow triggered
0:05  ├─ Jobs start (parallel)
      │  ├─ Build Job: 2-3 min
      │  ├─ Lint Job: 1-2 min
      │  └─ Test Job: 2-4 min
0:45  ├─ Parallel jobs complete
0:50  └─ Coverage check complete
      
Total Time: ~1-5 minutes (depending on cache)
```

## Success Criteria

All of these must be true for workflow to pass:

- ✅ Build completes without errors
- ✅ No ESLint violations
- ✅ All tests pass
- ✅ Lines coverage ≥ 80%
- ✅ Statements coverage ≥ 80%
- ✅ Functions coverage ≥ 80%
- ✅ Branches coverage ≥ 80%

## Failure Handling

```
Build Failure:
├─ TypeScript compilation errors
├─ Missing dependencies
└─ Configuration issues

Lint Failure:
├─ ESLint rule violations
├─ Code style issues
└─ Import/export errors

Test Failure:
├─ Unit test failures
├─ Timeout errors
└─ Coverage below threshold

Coverage Failure:
├─ Lines < 80%
├─ Statements < 80%
├─ Functions < 80%
└─ Branches < 80%
```

## Environment

- **OS**: Ubuntu Latest
- **Node.js**: 20.x
- **Package Manager**: npm (with ci)
- **Browser**: ChromeHeadless (for tests)

---

**Last Updated**: 2025-12-05
