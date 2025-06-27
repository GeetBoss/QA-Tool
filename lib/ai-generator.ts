import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export interface TestCaseGenerationResult {
  scenario: string
  steps: string
  expected: string
  priority: "Low" | "Medium" | "High" | "Critical"
  category: string
}

export interface BugReportGenerationResult {
  description: string
  steps: string
  expected: string
  actual: string
  priority: "Low" | "Medium" | "High" | "Critical"
  severity: "Minor" | "Major" | "Critical" | "Blocker"
  category: string
  environment: string
}

// Check if OpenAI API key is available
const isAIAvailable = () => {
  return typeof process !== "undefined" && process.env?.OPENAI_API_KEY
}

export async function generateTestCaseWithAI(summary: string): Promise<TestCaseGenerationResult> {
  // If no API key, use enhanced fallback
  if (!isAIAvailable()) {
    console.log("OpenAI API key not found, using enhanced fallback generation")
    return generateEnhancedTestCase(summary)
  }

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `You are an expert QA engineer who creates comprehensive test cases. Generate detailed test case information based on the provided summary.

Return your response as a JSON object with the following structure:
{
  "scenario": "Clear test scenario description",
  "steps": "Detailed step-by-step testing instructions (numbered list)",
  "expected": "Expected result description",
  "priority": "Low|Medium|High|Critical",
  "category": "Functional|UI/UX|Performance|Security|Integration|Payment|API|Database|Mobile|Web"
}

Guidelines:
- Make steps specific and actionable
- Include preconditions and setup steps
- Consider edge cases and error scenarios
- Set appropriate priority based on business impact
- Choose the most relevant category
- Write in professional QA language`,
      prompt: `Generate a comprehensive test case for: "${summary}"

Consider the context and create realistic testing steps that a QA engineer would actually perform. Include any necessary setup, execution, and verification steps.`,
    })

    const result = JSON.parse(text) as TestCaseGenerationResult
    return result
  } catch (error) {
    console.error("AI generation failed:", error)
    // Fallback to enhanced generation
    return generateEnhancedTestCase(summary)
  }
}

export async function generateBugReportWithAI(summary: string): Promise<BugReportGenerationResult> {
  // If no API key, use enhanced fallback
  if (!isAIAvailable()) {
    console.log("OpenAI API key not found, using enhanced fallback generation")
    return generateEnhancedBugReport(summary)
  }

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `You are an expert QA engineer who writes detailed bug reports. Generate comprehensive bug report information based on the provided summary.

Return your response as a JSON object with the following structure:
{
  "description": "Detailed bug description with impact analysis",
  "steps": "Step-by-step reproduction instructions (numbered list)",
  "expected": "What should happen (expected behavior)",
  "actual": "What actually happens (observed behavior)",
  "priority": "Low|Medium|High|Critical",
  "severity": "Minor|Major|Critical|Blocker",
  "category": "Crash|UI|Performance|Security|Payment|Data|Network|Integration|Functional",
  "environment": "Most likely environment where this would occur"
}

Guidelines:
- Write clear reproduction steps that anyone can follow
- Explain the business impact in the description
- Set priority based on business impact
- Set severity based on technical impact
- Choose appropriate category and environment
- Use professional bug reporting language`,
      prompt: `Generate a comprehensive bug report for: "${summary}"

Create realistic reproduction steps and analyze the potential impact. Consider what environment this bug would most likely occur in and how it affects users.`,
    })

    const result = JSON.parse(text) as BugReportGenerationResult
    return result
  } catch (error) {
    console.error("AI generation failed:", error)
    // Fallback to enhanced generation
    return generateEnhancedBugReport(summary)
  }
}

// Enhanced fallback functions with better logic
function generateEnhancedTestCase(summary: string): TestCaseGenerationResult {
  const lowerSummary = summary.toLowerCase()

  // Determine category and priority based on keywords
  let category = "Functional"
  let priority: TestCaseGenerationResult["priority"] = "Medium"

  if (lowerSummary.includes("payment") || lowerSummary.includes("transaction") || lowerSummary.includes("money")) {
    category = "Payment"
    priority = "High"
  } else if (
    lowerSummary.includes("ui") ||
    lowerSummary.includes("display") ||
    lowerSummary.includes("screen") ||
    lowerSummary.includes("button")
  ) {
    category = "UI/UX"
    priority = "Medium"
  } else if (lowerSummary.includes("security") || lowerSummary.includes("login") || lowerSummary.includes("auth")) {
    category = "Security"
    priority = "High"
  } else if (lowerSummary.includes("performance") || lowerSummary.includes("speed") || lowerSummary.includes("load")) {
    category = "Performance"
    priority = "Medium"
  } else if (lowerSummary.includes("api") || lowerSummary.includes("service") || lowerSummary.includes("integration")) {
    category = "API"
    priority = "High"
  } else if (lowerSummary.includes("database") || lowerSummary.includes("data")) {
    category = "Database"
    priority = "High"
  }

  // Generate detailed steps based on category
  let steps = ""
  let expected = ""

  if (category === "Payment") {
    steps = `1. Navigate to the payment section of the application
2. Verify payment options are displayed correctly
3. Select appropriate payment method for: ${summary}
4. Enter valid payment information
5. Proceed with payment processing
6. Verify transaction completion
7. Check receipt generation and email confirmation
8. Validate payment status in user account`
    expected = `Payment processing should complete successfully for ${summary} with proper confirmation, receipt generation, and account updates`
  } else if (category === "UI/UX") {
    steps = `1. Navigate to the relevant screen/component
2. Verify initial UI state for: ${summary}
3. Test all interactive elements (buttons, links, forms)
4. Verify responsive design across different screen sizes
5. Test accessibility features (keyboard navigation, screen readers)
6. Validate visual consistency with design specifications
7. Test user workflow and navigation paths
8. Verify error states and user feedback`
    expected = `UI elements should display correctly, be fully functional, and provide good user experience for ${summary}`
  } else if (category === "Security") {
    steps = `1. Set up test environment with security monitoring
2. Identify security-related functionality: ${summary}
3. Test authentication and authorization mechanisms
4. Attempt unauthorized access scenarios
5. Verify data encryption and protection measures
6. Test input validation and sanitization
7. Check for security vulnerabilities (XSS, SQL injection, etc.)
8. Validate security headers and configurations`
    expected = `Security measures should properly protect against threats and ensure ${summary} meets security requirements`
  } else if (category === "Performance") {
    steps = `1. Set up performance monitoring tools
2. Establish baseline performance metrics
3. Execute performance test for: ${summary}
4. Monitor response times and resource usage
5. Test under various load conditions
6. Identify performance bottlenecks
7. Verify system stability under stress
8. Document performance metrics and recommendations`
    expected = `System should perform efficiently within acceptable limits for ${summary} under normal and peak load conditions`
  } else if (category === "API") {
    steps = `1. Set up API testing environment
2. Verify API endpoint availability for: ${summary}
3. Test API request/response formats
4. Validate data integrity and structure
5. Test error handling and status codes
6. Verify authentication and authorization
7. Test rate limiting and throttling
8. Document API behavior and responses`
    expected = `API should function correctly for ${summary} with proper data exchange, error handling, and security measures`
  } else if (category === "Database") {
    steps = `1. Set up database testing environment
2. Verify database connectivity and access
3. Test data operations related to: ${summary}
4. Validate data integrity and constraints
5. Test transaction handling and rollback
6. Verify data security and access controls
7. Test backup and recovery procedures
8. Monitor database performance and optimization`
    expected = `Database operations should work correctly for ${summary} with proper data integrity, security, and performance`
  } else {
    // Default functional test
    steps = `1. Navigate to the relevant section of the application
2. Verify initial state and prerequisites
3. Execute the main functionality: ${summary}
4. Test normal use case scenarios
5. Test edge cases and boundary conditions
6. Verify error handling and user feedback
7. Test integration with other system components
8. Validate final state and cleanup`
    expected = `System should function correctly and meet all requirements for ${summary} with proper error handling and user feedback`
  }

  return {
    scenario: `Verify that ${summary} works correctly and meets all functional requirements`,
    steps,
    expected,
    priority,
    category,
  }
}

function generateEnhancedBugReport(summary: string): BugReportGenerationResult {
  const lowerSummary = summary.toLowerCase()

  // Determine category, priority, and severity based on keywords
  let category = "Functional"
  let priority: BugReportGenerationResult["priority"] = "Medium"
  let severity: BugReportGenerationResult["severity"] = "Major"
  let environment = "Production Environment"

  if (lowerSummary.includes("crash") || lowerSummary.includes("freeze") || lowerSummary.includes("hang")) {
    category = "Crash"
    priority = "Critical"
    severity = "Blocker"
  } else if (
    lowerSummary.includes("payment") ||
    lowerSummary.includes("transaction") ||
    lowerSummary.includes("money")
  ) {
    category = "Payment"
    priority = "Critical"
    severity = "Critical"
  } else if (
    lowerSummary.includes("ui") ||
    lowerSummary.includes("display") ||
    lowerSummary.includes("visual") ||
    lowerSummary.includes("layout")
  ) {
    category = "UI"
    priority = "Medium"
    severity = "Major"
  } else if (
    lowerSummary.includes("performance") ||
    lowerSummary.includes("slow") ||
    lowerSummary.includes("timeout")
  ) {
    category = "Performance"
    priority = "High"
    severity = "Major"
  } else if (
    lowerSummary.includes("security") ||
    lowerSummary.includes("unauthorized") ||
    lowerSummary.includes("breach")
  ) {
    category = "Security"
    priority = "Critical"
    severity = "Critical"
  } else if (
    lowerSummary.includes("data") ||
    lowerSummary.includes("database") ||
    lowerSummary.includes("corruption")
  ) {
    category = "Data"
    priority = "High"
    severity = "Critical"
  } else if (lowerSummary.includes("network") || lowerSummary.includes("connection") || lowerSummary.includes("api")) {
    category = "Network"
    priority = "High"
    severity = "Major"
  }

  // Select appropriate environment based on keywords
  if (lowerSummary.includes("mobile") || lowerSummary.includes("ios") || lowerSummary.includes("android")) {
    environment = "Mobile Application Environment"
  } else if (lowerSummary.includes("web") || lowerSummary.includes("browser")) {
    environment = "Web Browser Environment"
  } else if (lowerSummary.includes("kiosk")) {
    environment = "Kiosk Build 1.13.34_V_E450_prod"
  }

  // Generate detailed description and steps
  let description = ""
  let steps = ""
  let expected = ""
  let actual = ""

  if (category === "Crash") {
    description = `Critical system failure occurs when ${summary}. This results in application termination, potential data loss, and severe disruption to user workflow. The crash affects system stability and user confidence.`
    steps = `1. Launch the application in a clean state
2. Navigate to the relevant section
3. Perform the action that triggers: ${summary}
4. Observe application behavior and system response
5. Note any error messages or logs before crash
6. Attempt to reproduce the crash consistently
7. Check system logs and crash dumps
8. Verify data integrity after crash recovery`
    expected = "Application should continue running normally without any crashes or unexpected terminations"
    actual = "Application crashes unexpectedly, potentially causing data loss and disrupting user workflow"
  } else if (category === "Payment") {
    description = `Payment processing failure when ${summary}. This prevents users from completing transactions, directly impacts revenue, and affects customer satisfaction. The issue may involve payment gateway integration, validation logic, or transaction processing.`
    steps = `1. Navigate to the payment section
2. Select items/services for purchase
3. Proceed to payment processing
4. Attempt the specific scenario: ${summary}
5. Observe payment processing behavior
6. Check transaction status and confirmations
7. Verify payment gateway responses
8. Test with different payment methods if applicable`
    expected = "Payment should be processed successfully with proper confirmation and receipt generation"
    actual = "Payment processing fails, preventing transaction completion and potentially causing revenue loss"
  } else if (category === "UI") {
    description = `User interface malfunction when ${summary}. This affects user experience, usability, and may prevent users from completing their intended actions. The issue impacts visual presentation and user interaction.`
    steps = `1. Navigate to the affected screen or component
2. Observe the initial UI state
3. Perform actions related to: ${summary}
4. Note visual inconsistencies or malfunctions
5. Test across different browsers/devices if applicable
6. Verify responsive design behavior
7. Check accessibility features
8. Document visual evidence with screenshots`
    expected =
      "UI elements should display correctly, be properly aligned, and respond appropriately to user interactions"
    actual = "UI elements are misaligned, missing, or not responding correctly to user interactions"
  } else if (category === "Performance") {
    description = `Performance degradation occurs when ${summary}. This results in slow response times, poor user experience, and potential system overload. The issue affects system efficiency and user satisfaction.`
    steps = `1. Set up performance monitoring tools
2. Establish baseline performance metrics
3. Execute the scenario: ${summary}
4. Monitor response times and resource usage
5. Test under different load conditions
6. Identify performance bottlenecks
7. Compare with expected performance standards
8. Document performance metrics and impact`
    expected = "System should respond within acceptable time limits and maintain good performance"
    actual = "System responds slowly, times out, or shows degraded performance affecting user experience"
  } else {
    // Default functional bug
    description = `Functional issue occurs when ${summary}. This prevents the system from working as designed and affects user ability to complete their intended tasks. The issue impacts core functionality and user workflow.`
    steps = `1. Navigate to the relevant section of the application
2. Set up necessary preconditions
3. Attempt to perform: ${summary}
4. Observe system behavior and responses
5. Note any error messages or unexpected results
6. Try alternative approaches or workarounds
7. Test related functionality for side effects
8. Document the complete failure scenario`
    expected = "System should function correctly according to specifications and user expectations"
    actual = "System does not work as expected, preventing users from completing their intended actions"
  }

  return {
    description,
    steps,
    expected,
    actual,
    priority,
    severity,
    category,
    environment,
  }
}
