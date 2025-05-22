module.exports = {
  // Project configuration
  project: {
    name: "scalerrs-portal",
    description: "Scalerrs Portal application",
    rootDir: "./",
  },
  
  // AI provider configuration
  aiProviders: {
    default: "anthropic", // Set your preferred default provider
    // You can configure multiple providers
    anthropic: {
      // Configuration will use the ANTHROPIC_API_KEY from environment
      model: "claude-3-opus-20240229", // or your preferred Claude model
    },
    openai: {
      // Configuration will use the OPENAI_API_KEY from environment
      model: "gpt-4-turbo", // or your preferred OpenAI model
    },
  },
  
  // Task configuration
  tasks: {
    outputDir: "./tasks", // Where task outputs will be saved
    templateDir: "./task-templates", // Optional templates for tasks
  },
  
  // Code generation settings
  codeGeneration: {
    language: "typescript",
    framework: "react",
    styling: "tailwind",
    testFramework: "jest",
  },
  
  // Project-specific rules
  rules: {
    // Add any project-specific rules or guidelines
    followTailwindPatterns: true,
    useTypeScript: true,
    componentStructure: "functional",
  }
}; 