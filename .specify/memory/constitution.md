<!--
Sync Impact Report:
- Version change: 1.3.0 -> 1.4.0
- Modified principles: None
- Added sections: 
  - VI. Data & File Standards
- Removed sections: None
- Templates requiring updates: None (This is a domain-specific operational rule that naturally propagates through spec/task requirements)
- Follow-up TODOs: None
-->
# pastexams Constitution

## Core Principles

### I. Code Quality & Best Practices

Follow established best practices and strictly adhere to the project's configured ESLint rules (`eslint.config.mjs`) to maintain code quality and consistency across the codebase. Every single piece of code generated MUST follow these rules—for example, every function MUST have an explicit return type.
Rationale: Strict linting catches errors early and enforces a uniform, type-safe coding style across all human and AI-generated code.

### II. Version Control Protocol

Adhere to strict naming conventions for branches and commit messages:

- **Branch Naming**: Format new branches using category prefixes (e.g., `feature/Carousel`, `fix/eslint`).
- **Commit Messages**: Use semantic prefixes such as `feat:` for new features (e.g., `feat: HomeScreen Catalog`) and `fix:` for bug resolutions (e.g., `fix: Navbar bug`). Ensure all commit messages are descriptive and structured.
  Rationale: Standardized branch and commit naming facilitates automated changelog generation, easier history tracing, and organized collaborative workflows.

### III. Responsive Design & UI

All user interfaces must be fully responsive across mobile, tablet, and desktop devices.

- Utilize **shadcn** and **heroui** as the primary libraries for building UI components.
- Avoid building complex custom UI elements from scratch if a suitable component exists in these libraries.
  Rationale: A consistent, mobile-friendly user experience is critical, and leveraging established component libraries speeds up development while ensuring accessibility and robustness.

### IV. Dependency Management

Prioritize the community's most widely used and proven libraries for any new dependencies.

- If a specific, lesser-known library is required for a feature, you must consult and justify its inclusion before adoption.
  Rationale: Mainstream libraries have better support, security, and longevity, reducing long-term maintenance burden.

### V. Testing & Verification

Run tests after every successful implementation of a task and check for errors before marking the task complete.
Rationale: Continuous testing prevents regressions and ensures system stability as new features are added.

### VI. Data & File Standards

The uploaded file format MUST strictly follow the naming convention: `year_semester_coursename_professorname_midorfinal` (e.g., `2026_Spring_微積分 Calculus_林宏祥_Final`).
Rationale: Enforcing a rigid and consistent file naming structure ensures that downloaded documents are easily identifiable and systematically organized without collisions, improving the overall user and contributor experience.

## Governance

Amendments to this constitution require documentation, approval, and a version bump. All pull requests and code reviews must verify compliance with the Core Principles outlined above.

**Version**: 1.4.0 | **Ratified**: 2026-05-08 | **Last Amended**: 2026-05-08
