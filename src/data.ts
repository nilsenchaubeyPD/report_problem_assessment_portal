export type CategoryId = 'content' | 'submission' | 'platform' | 'proctoring' | 'others'

export interface Category {
  id: CategoryId
  label: string
}

/** Desktop / tablet categories (Figma: "reason-chips"). */
export const DESKTOP_CATEGORIES: Category[] = [
  { id: 'content', label: 'Content Issue' },
  { id: 'submission', label: 'Submission Issue' },
  { id: 'platform', label: 'Platform Issue' },
  { id: 'proctoring', label: 'Proctoring Issue' },
  { id: 'others', label: 'Others Issue' },
]

/**
 * Mobile: Proctoring is removed (no camera / mic / screen-share on mobile) and
 * "Others" is not part of the mobile design notes, so it is left out as well.
 */
export const MOBILE_CATEGORIES: Category[] = DESKTOP_CATEGORIES.filter(
  (c) => c.id === 'content' || c.id === 'submission' || c.id === 'platform',
)

/**
 * Single-select issue types per category.
 * Content Issue list is copied from the Figma dropdown frame. The other lists
 * are derived from the report reasons in the PRD data table and the beta build
 * (not drawn in Figma) – confirm with Product before launch.
 */
export const ISSUE_TYPES: Record<CategoryId, string[]> = {
  content: [
    'Wrong or incorrect question',
    'Spelling/grammar error',
    'Wrong answer options or expected output',
    'Image not loading',
    'Multiple correct answers',
    'Other content issue',
  ],
  submission: [
    'Submit button not working',
    'Wrong output for correct code',
    'Run/submit timed out',
    "Couldn't move between questions",
    "Can't select option",
    'Other submission issue',
  ],
  platform: [
    'Page loading slowly, crashed or blank',
    'Code editor not working',
    'Timer issue',
    "Couldn't start the assessment",
    'Internet issue',
    'Other platform issue',
  ],
  proctoring: [
    'Camera/mic not working',
    'Permission not working',
    'Face/speech detection issue',
    'Screen-share issue',
    'Other proctoring issue',
  ],
  // "In other issue there will be no Issue Type" (Figma QA note)
  others: [],
}

/** Mobile submission list is reduced to three options (Figma dev note). */
export const MOBILE_SUBMISSION_TYPES = [
  "Can't select option",
  'Submit button not working',
  'Other submission issue',
]

export const MAX_DETAILS = 500

export type DemoOutcome = 'success' | 'server' | 'offline'

export interface ReportPayload {
  category: CategoryId
  issueType: string | null
  details: string
  screenshot: string | null
  submittedAt: string
}
