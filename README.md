# GitHub Copilot Orchestra

> **A multi-agent orchestration system for structured, test-driven software development with AI assistance**

## What is GitHub Copilot Orchestra?

The "GitHub Copilot Orchestra" pattern transformed how I build with AI agents. Instead of juggling context and constantly switching modes, the Orchestra pattern provides a structured workflow that coordinates specialized AI subagents through a complete AI development cycle for adding a feature or making a change: planning → implementation → review → commit.

The system solves a critical challenge in AI-assisted development: maintaining code quality and test coverage while moving quickly. By enforcing Test-Driven Development (TDD) conventions and implementing quality gates at every phase, you get the speed of AI coding with the rigor of professional software engineering.

## Key Features

- **🎭 Multi-Agent Workflow** - Conductor agent orchestrates specialized Planning, Implementation, and Code Review subagents, each optimized for their specific role.
- **✅ TDD Enforcement** - Strict Test Driven Development: write failing tests, seeing them fail, writing minimal code to pass, and verifying success before proceeding.
- **🔍 Quality Gates** - Automated code review after each phase ensures standards are met before moving forward.
- **📋 Documentation Trail** - Comprehensive plan files and phase completion records create an audit trail for reviewing all work completed.
- **⏸️ Mandatory Pause Points** - Built-in stops for plan approval and phase commits keep you in control of the development process.
- **🔄 Iterative Cycles** - Each implementation phase follows the complete cycle: implement → review → commit before proceeding to the next phase.

## Architecture Overview

The Orchestra system consists of four specialized agents:

- **Conductor Agent** - The orchestrator that manages the full development cycle. It researches plans via the Planning subagent, delegates coding work to the Implement subagents, enforces quality gates with the Code Review subagents, and handles all user interactions and pause points. Uses Claude Sonnet 4.5 by default

- **Planning Subagent** - Performs comprehensive research and context gathering. Analyzes the codebase, identifies relevant files and patterns, and returns structured findings to the Conductor agent to inform plan creation. Uses Claude Sonnet 4.5 by default.

- **Implementation Subagent** - Executes individual phases of the plan, following strict TDD conventions. Writes failing tests first, sees them fail, implements minimal code to make them pass, and reports completion back to the Conductor agent. Uses Claude Haiku 4.5 by default.

- **Code Review Subagent** - Validates implementations against acceptance criteria. Uses git to review uncommitted code. It checks test coverage, code quality, and adherence to best practices, and returns structured reviews (APPROVED/NEEDS_REVISION/FAILED) back to the Conductor. The Conductor will then use the review to either spin up another Implement subagent to fix issues or prompt the user to review, commit, and then continue to the next phase. Uses Claude Sonnet 4.5 by default.

## Prerequisites

Before using GitHub Copilot Orchestra, ensure you have:

- **VS Code Insiders** - Required for custom chat modes feature that enables subagents and handing off to them.
  - Download from: https://code.visualstudio.com/insiders/

- **GitHub Copilot Subscription** - Active subscription required for AI-powered agents
  - Individual or Business plan
  - GitHub Copilot Chat extension installed and enabled

- **Git** - Version control is integral to the workflow
  - Used for commit workflow at end of each phase
  - Recommended: Basic familiarity with git commands
