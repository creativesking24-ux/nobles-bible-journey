import { useEffect, useState } from 'react'
import { Smartphone } from 'lucide-react'
import {
  bibleComUrl,
  isMobileBrowser,
  openInYouVersionApp,
  youVersionAppUrl,
} from '../lib/youversion/refs'

interface OpenInBibleAppProps {
  /** USFM-style ref e.g. ROM.1 */
  passageRef: string
  versionId?: string
  abbreviation?: string
  /** Force show even on desktop */
  alwaysShow?: boolean
  className?: string
}

/**
 * Opens the current passage in the YouVersion Bible app.
 * On mobile (app installed): uses universal / app links.
 * On desktop: opens bible.com (or still show button if alwaysShow).
 */
export function OpenInBibleApp({
  passageRef,
  versionId = '3034',
  abbreviation = 'BSB',
  alwaysShow = false,
  className = '',
}: OpenInBibleAppProps) {
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    setMobile(isMobileBrowser())
  }, [])

  if (!alwaysShow && !mobile) return null
  if (!passageRef) return null

  const web = bibleComUrl(passageRef, versionId, abbreviation)
  const appScheme = youVersionAppUrl(passageRef, versionId)

  return (
    <div className={`space-y-2 ${className}`}>
      <button
        type="button"
        onClick={() =>
          openInYouVersionApp({
            ref: passageRef,
            versionId,
            abbreviation,
          })
        }
        className="btn-primary"
      >
        <Smartphone className="h-5 w-5" />
        Open in Bible App
      </button>

      {/* Visible fallbacks — some browsers block JS redirects to custom schemes */}
      <div className="flex flex-col gap-1.5 sm:flex-row">
        <a
          href={web}
          className="btn-ghost flex-1 !py-2.5 text-center text-xs"
          // Let OS route universal link → YouVersion app
        >
          Open via bible.com link
        </a>
        <a
          href={appScheme}
          className="btn-ghost flex-1 !py-2.5 text-center text-xs"
        >
          Open via youversion://
        </a>
      </div>
      <p className="text-center text-[10px] text-parchment-muted">
        Uses the free YouVersion Bible app if installed
      </p>
    </div>
  )
}
