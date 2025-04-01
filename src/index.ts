/**
 * Main entry point for the application
 */

/**
 * Greet a person
 * @param name Name of the person to greet
 * @returns Greeting message
 */
export function greet(name: string): string {
  return `Hello, ${name}!`;
}

// Example usage
if (require.main === module) {
  console.log(greet('World'));
}
