# TaskMaster AI Setup

TaskMaster AI has been set up in this project to help with task management and code generation.

## Prerequisites

To use TaskMaster AI, you need to have the following API keys set up in your Cursor editor:

- ANTHROPIC_API_KEY (recommended)
- OPENAI_API_KEY
- Other optional providers: PERPLEXITY_API_KEY, GOOGLE_API_KEY, MISTRAL_API_KEY, etc.

## Configuration

The TaskMaster AI configuration is in `taskmaster.config.js` in the root directory. You can modify this file to change the AI providers, project settings, and code generation preferences.

## Usage

### Starting TaskMaster AI

In Cursor, you can use TaskMaster AI by:

1. Opening the Command Palette (Ctrl+Shift+P or Cmd+Shift+P)
2. Typing "Start TaskMaster AI"
3. Selecting the option to start TaskMaster AI

### Creating Tasks

You can create tasks using:

```
task-master-ai create-task "Build a new dashboard component"
```

### Using Templates

We have set up templates in the `task-templates` directory:

- `component.md` - For creating React components
- `feature.md` - For implementing new features

To use a template:

```
task-master-ai create-task --template component "Create a DataTable component"
```

### Task Output

All task outputs will be saved in the `tasks` directory.

## Additional Commands

- `task-master-ai help` - Show help information
- `task-master-ai list-tasks` - List all tasks
- `task-master-ai analyze-code` - Analyze code in a file or directory

## Best Practices

1. Be specific in your task descriptions
2. Use templates for consistent task structure
3. Follow the project's coding guidelines in the task implementation
4. Review AI-generated code before committing 