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

  // Determine category and priority based on your kiosk system keywords
  let category = "Functional"
  let priority: TestCaseGenerationResult["priority"] = "Medium"

  // Login related tests
  if (lowerSummary.includes("login") || lowerSummary.includes("password") || lowerSummary.includes("authentication")) {
    category = "Login"
    priority = "High"
  }
  // Dashboard related tests
  else if (
    lowerSummary.includes("dashboard") ||
    lowerSummary.includes("main screen") ||
    lowerSummary.includes("home")
  ) {
    category = "Dashboard"
    priority = "Medium"
  }
  // Cash Dispenser related tests
  else if (
    lowerSummary.includes("cash") ||
    lowerSummary.includes("dispenser") ||
    lowerSummary.includes("cassette") ||
    lowerSummary.includes("bills")
  ) {
    category = "Cash Dispenser"
    priority = "High"
  }
  // Tickets related tests
  else if (lowerSummary.includes("ticket") || lowerSummary.includes("scan") || lowerSummary.includes("qr")) {
    category = "Tickets"
    priority = "Medium"
  }
  // Settings related tests
  else if (
    lowerSummary.includes("settings") ||
    lowerSummary.includes("configuration") ||
    lowerSummary.includes("terminal")
  ) {
    category = "Settings"
    priority = "Medium"
  }
  // Machine Register related tests
  else if (lowerSummary.includes("machine") || lowerSummary.includes("register") || lowerSummary.includes("sentry")) {
    category = "Machine Register"
    priority = "Medium"
  }
  // Daily Report related tests
  else if (lowerSummary.includes("report") || lowerSummary.includes("daily") || lowerSummary.includes("email")) {
    category = "Daily Report"
    priority = "Low"
  }
  // Hardware related tests
  else if (
    lowerSummary.includes("hardware") ||
    lowerSummary.includes("printer") ||
    lowerSummary.includes("camera") ||
    lowerSummary.includes("cdu")
  ) {
    category = "Hardware"
    priority = "High"
  }
  // Security related tests
  else if (lowerSummary.includes("security") || lowerSummary.includes("account") || lowerSummary.includes("user")) {
    category = "Security"
    priority = "High"
  }

  // Generate detailed steps based on category and your kiosk system patterns
  let steps = ""
  let expected = ""

  if (category === "Login") {
    steps = `1. Launch the kiosk application
2. Verify login page is displayed
3. Test the specific login scenario: ${summary}
4. Enter credentials as required
5. Click "Login" button
6. Observe system response
7. Verify redirection or error handling
8. Check session management`
    expected = `Login functionality should work correctly for ${summary} with proper authentication, error handling, and user redirection to appropriate dashboard or error messages`
  } else if (category === "Dashboard") {
    steps = `1. Login to the admin system successfully
2. Navigate to the Dashboard page
3. Verify dashboard elements are loaded
4. Test the specific dashboard feature: ${summary}
5. Check all dashboard components (buttons, displays, status indicators)
6. Verify data accuracy and real-time updates
7. Test navigation to other modules
8. Verify hardware status indicators`
    expected = `Dashboard should display correctly for ${summary} with accurate data, functional buttons, proper hardware status indicators, and smooth navigation`
  } else if (category === "Cash Dispenser") {
    steps = `1. Login to admin system
2. Navigate to Cash Dispenser module
3. Verify cassette status and configuration
4. Test the cash dispenser functionality: ${summary}
5. Check cassette limits and bill counts
6. Verify reject bin status
7. Test deposit report functionality
8. Check hardware communication`
    expected = `Cash dispenser functionality should work correctly for ${summary} with proper cassette management, accurate bill counting, and reliable hardware communication`
  } else if (category === "Tickets") {
    steps = `1. Access the admin system
2. Navigate to Tickets module
3. Verify ticket scanning functionality
4. Test the ticket feature: ${summary}
5. Check ticket validation and processing
6. Verify terminal ID filtering
7. Test date range filtering
8. Check ticket status updates`
    expected = `Ticket functionality should work properly for ${summary} with accurate scanning, proper validation, and correct filtering options`
  } else if (category === "Settings") {
    steps = `1. Login to admin system
2. Navigate to Settings module
3. Access the relevant settings tab
4. Test the settings functionality: ${summary}
5. Modify configuration values as needed
6. Save changes and verify persistence
7. Test validation rules
8. Verify system behavior after changes`
    expected = `Settings functionality should work correctly for ${summary} with proper validation, data persistence, and immediate system updates`
  } else if (category === "Machine Register") {
    steps = `1. Access admin system
2. Navigate to Machine Register module
3. Test machine registration functionality: ${summary}
4. Verify sentry integration options
5. Test QR code scanning
6. Check terminal name assignment
7. Verify machine list updates
8. Test clear functionality if applicable`
    expected = `Machine registration should work properly for ${summary} with accurate QR scanning, proper sentry integration, and correct machine list management`
  } else if (category === "Daily Report") {
    steps = `1. Login to admin system
2. Navigate to Daily Report module
3. Verify report data display
4. Test the report functionality: ${summary}
5. Check data accuracy and completeness
6. Test email functionality if applicable
7. Verify date filtering
8. Check report formatting`
    expected = `Daily report functionality should work correctly for ${summary} with accurate data display, proper email delivery, and correct formatting`
  } else if (category === "Hardware") {
    steps = `1. Access admin system
2. Check hardware status indicators
3. Test the hardware functionality: ${summary}
4. Verify device communication
5. Check status indicators (green/red)
6. Test device responses
7. Verify error handling
8. Check diagnostic information`
    expected = `Hardware functionality should work properly for ${summary} with accurate status indicators, reliable communication, and proper error handling`
  } else if (category === "Security") {
    steps = `1. Access admin system
2. Navigate to Security/Accounts settings
3. Test the security feature: ${summary}
4. Verify authentication mechanisms
5. Test password policies
6. Check user management functions
7. Verify access controls
8. Test security validations`
    expected = `Security functionality should work correctly for ${summary} with proper authentication, secure password handling, and appropriate access controls`
  } else {
    // Default functional test for kiosk system
    steps = `1. Login to the kiosk admin system
2. Navigate to the relevant module
3. Verify initial state and prerequisites
4. Execute the main functionality: ${summary}
5. Test normal operation scenarios
6. Verify data accuracy and system responses
7. Test error handling and edge cases
8. Check integration with other system components`
    expected = `System should function correctly for ${summary} with proper data handling, accurate responses, and reliable integration with kiosk hardware and software components`
  }

  return {
    scenario: `Verify that ${summary} works correctly in the kiosk admin system`,
    steps,
    expected,
    priority,
    category,
  }
}

function generateEnhancedBugReport(summary: string): BugReportGenerationResult {
  const lowerSummary = summary.toLowerCase()

  // Determine category, priority, and severity based on your kiosk system
  let category = "Functional"
  let priority: BugReportGenerationResult["priority"] = "Medium"
  let severity: BugReportGenerationResult["severity"] = "Major"
  const environment = "Kiosk Admin System - Production Environment"

  // Critical kiosk issues
  if (lowerSummary.includes("crash") || lowerSummary.includes("freeze") || lowerSummary.includes("hang")) {
    category = "Crash"
    priority = "Critical"
    severity = "Blocker"
  }
  // Cash handling issues (highest priority for kiosk)
  else if (
    lowerSummary.includes("cash") ||
    lowerSummary.includes("dispenser") ||
    lowerSummary.includes("bills") ||
    lowerSummary.includes("cassette")
  ) {
    category = "Cash Handling"
    priority = "Critical"
    severity = "Critical"
  }
  // Login/Authentication issues
  else if (
    lowerSummary.includes("login") ||
    lowerSummary.includes("password") ||
    lowerSummary.includes("authentication")
  ) {
    category = "Authentication"
    priority = "High"
    severity = "Major"
  }
  // Hardware communication issues
  else if (
    lowerSummary.includes("hardware") ||
    lowerSummary.includes("printer") ||
    lowerSummary.includes("camera") ||
    lowerSummary.includes("cdu")
  ) {
    category = "Hardware"
    priority = "High"
    severity = "Major"
  }
  // UI/Display issues
  else if (
    lowerSummary.includes("display") ||
    lowerSummary.includes("screen") ||
    lowerSummary.includes("button") ||
    lowerSummary.includes("ui")
  ) {
    category = "UI"
    priority = "Medium"
    severity = "Major"
  }
  // Data/Report issues
  else if (lowerSummary.includes("data") || lowerSummary.includes("report") || lowerSummary.includes("calculation")) {
    category = "Data"
    priority = "High"
    severity = "Major"
  }
  // Settings/Configuration issues
  else if (
    lowerSummary.includes("settings") ||
    lowerSummary.includes("configuration") ||
    lowerSummary.includes("save")
  ) {
    category = "Configuration"
    priority = "Medium"
    severity = "Major"
  }

  // Generate detailed description and steps based on your kiosk system
  let description = ""
  let steps = ""
  let expected = ""
  let actual = ""

  if (category === "Cash Handling") {
    description = `Critical cash handling malfunction when ${summary}. This directly impacts the core kiosk functionality, potentially causing financial discrepancies, customer dissatisfaction, and operational disruption. The issue affects cash dispensing accuracy and system reliability.`
    steps = `1. Login to the kiosk admin system
2. Navigate to Cash Dispenser module
3. Verify cassette status and configuration
4. Attempt the cash operation: ${summary}
5. Monitor cassette behavior and bill counting
6. Check reject bin status and error logs
7. Verify deposit report accuracy
8. Test hardware communication with CDU`
    expected =
      "Cash dispensing should work accurately with proper bill counting, correct cassette management, and reliable hardware communication"
    actual = "Cash handling fails, causing incorrect bill counts, cassette errors, or complete dispensing failure"
  } else if (category === "Authentication") {
    description = `Authentication system failure when ${summary}. This prevents authorized access to the admin system, blocking critical kiosk management operations and potentially causing security vulnerabilities.`
    steps = `1. Launch the kiosk admin application
2. Attempt to access login screen
3. Try the authentication scenario: ${summary}
4. Enter credentials as required
5. Click login and observe response
6. Check error messages and system behavior
7. Verify session management
8. Test different authentication methods if available`
    expected =
      "Authentication should work correctly with proper credential validation, secure session management, and appropriate error handling"
    actual = "Authentication fails, preventing access to admin system or showing incorrect error messages"
  } else if (category === "Hardware") {
    description = `Hardware communication failure when ${summary}. This affects kiosk operation reliability, potentially causing service interruptions and preventing proper device monitoring and control.`
    steps = `1. Access kiosk admin system
2. Navigate to hardware status section
3. Check device communication: ${summary}
4. Monitor status indicators (green/red lights)
5. Test device responses and commands
6. Check diagnostic information
7. Verify error reporting
8. Test device reset functionality if available`
    expected =
      "Hardware should communicate properly with accurate status indicators, reliable device responses, and proper error reporting"
    actual =
      "Hardware communication fails, showing incorrect status, unresponsive devices, or missing diagnostic information"
  } else if (category === "UI") {
    description = `User interface malfunction when ${summary}. This affects admin usability, potentially preventing efficient kiosk management and causing operator confusion or errors.`
    steps = `1. Login to kiosk admin system
2. Navigate to the affected screen/module
3. Perform the UI action: ${summary}
4. Observe visual elements and responses
5. Test button functionality and navigation
6. Check data display accuracy
7. Verify responsive behavior
8. Test across different screen resolutions if applicable`
    expected =
      "UI elements should display correctly, respond appropriately to user interactions, and provide clear visual feedback"
    actual = "UI elements are misaligned, unresponsive, or displaying incorrect information"
  } else {
    // Default kiosk system bug
    description = `Functional issue occurs when ${summary}. This affects kiosk admin system operation, potentially disrupting management workflows and impacting service quality.`
    steps = `1. Login to kiosk admin system
2. Navigate to the relevant module
3. Set up necessary preconditions
4. Attempt to perform: ${summary}
5. Observe system behavior and responses
6. Check for error messages or unexpected results
7. Test related functionality for side effects
8. Verify data integrity and system state`
    expected = "System should function correctly according to kiosk admin specifications and operational requirements"
    actual = "System does not work as expected, preventing proper kiosk management operations"
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
