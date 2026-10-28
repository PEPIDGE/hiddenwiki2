"use client"

import {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { ChevronDown, ChevronRight, Copy, FileCode2, Folder, ShieldCheck } from "lucide-react"
import { usePathname } from "next/navigation"
import s from "./source-inspector.module.css"

type InspectorTab = "elements" | "sources"

interface SourceInspectorProps {
  scopeRef: RefObject<HTMLElement | null>
}

interface ResourceEntry {
  type: string
  path: string
}

interface Snapshot {
  html: string
  resources: ResourceEntry[]
  capturedAt: string
  elements: number
  truncated: boolean
  error: boolean
}

interface VirtualFile {
  id: string
  name: string
  path: string
  language: string
  content: string
}

const BLOCKED_TAGS = "script,style,link,meta,noscript,template,iframe,object,embed"
const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
])
const URL_ATTRIBUTES = new Set(["action", "formaction", "href", "poster", "src"])
const MAX_NODES = 3_500
const MAX_SOURCE_LENGTH = 240_000
const UPDATE_DELAY_MS = 280

const EMPTY_SNAPSHOT: Snapshot = {
  html: "<!-- Waiting for the current page DOM… -->",
  resources: [],
  capturedAt: "",
  elements: 0,
  truncated: false,
  error: false,
}

function escapeText(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
}

function escapeAttribute(value: string): string {
  return escapeText(value).replaceAll('"', "&quot;")
}

function byteLength(value: string): number {
  try {
    return new TextEncoder().encode(value).byteLength
  } catch {
    return value.length
  }
}

function isUnsafeUrl(value: string): boolean {
  const normalized = value.trim().replace(/[\u0000-\u0020]+/g, "").toLowerCase()
  return normalized.startsWith("javascript:") || normalized.startsWith("data:text/html")
}

function sanitizeClone(root: HTMLElement): HTMLElement {
  const clone = root.cloneNode(true) as HTMLElement
  clone.querySelectorAll(BLOCKED_TAGS).forEach((node) => node.remove())
  clone.querySelectorAll("[data-source-inspector]").forEach((node) => node.remove())

  for (const element of [clone, ...Array.from(clone.querySelectorAll("*"))]) {
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase()
      const value = attribute.value

      if (
        name.startsWith("on") ||
        name === "nonce" ||
        name === "srcdoc" ||
        name === "integrity" ||
        name.includes("csrf") ||
        name.includes("auth-token") ||
        name.includes("session-token") ||
        (URL_ATTRIBUTES.has(name) && isUnsafeUrl(value))
      ) {
        element.removeAttribute(attribute.name)
      } else if (value.length > 2_048) {
        element.setAttribute(attribute.name, `${value.slice(0, 2_048)}…[truncated]`)
      }
    }

    if (element instanceof HTMLInputElement) {
      const type = element.type.toLowerCase()
      if (type === "password" || type === "hidden") {
        element.removeAttribute("value")
        element.setAttribute("data-value", "[redacted]")
      }
    }
  }

  return clone
}

function serializeElement(root: HTMLElement): { html: string; nodes: number; truncated: boolean } {
  let nodes = 0
  let truncated = false

  const walk = (node: Node, depth: number, preserveWhitespace = false): string[] => {
    if (truncated) return []
    nodes += 1
    if (nodes > MAX_NODES) {
      truncated = true
      return [`${"  ".repeat(depth)}<!-- snapshot truncated safely: node limit reached -->`]
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const raw = node.textContent ?? ""
      const text = preserveWhitespace ? raw.slice(0, 12_000) : raw.replace(/\s+/g, " ").trim()
      if (!text) return []
      return [`${"  ".repeat(depth)}${escapeText(text)}`]
    }

    if (node.nodeType === Node.COMMENT_NODE) {
      const comment = (node.textContent ?? "").replaceAll("-->", "--&gt;").slice(0, 12_000)
      return comment ? [`${"  ".repeat(depth)}<!-- ${comment} -->`] : []
    }

    if (!(node instanceof Element)) return []

    const tag = node.tagName.toLowerCase()
    const attributes = Array.from(node.attributes)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((attribute) => ` ${attribute.name}="${escapeAttribute(attribute.value)}"`)
      .join("")
    const indent = "  ".repeat(depth)
    const opening = `${indent}<${tag}${attributes}>`

    if (VOID_TAGS.has(tag)) return [opening]

    const keepWhitespace = preserveWhitespace || tag === "pre" || tag === "code" || tag === "textarea"
    const children = Array.from(node.childNodes)
    if (children.length === 0) return [`${opening}</${tag}>`]

    if (children.length === 1 && children[0].nodeType === Node.TEXT_NODE && !keepWhitespace) {
      const text = (children[0].textContent ?? "").replace(/\s+/g, " ").trim()
      if (text.length <= 140) return [`${opening}${escapeText(text)}</${tag}>`]
    }

    const lines = [opening]
    for (const child of children) lines.push(...walk(child, depth + 1, keepWhitespace))
    lines.push(`${indent}</${tag}>`)
    return lines
  }

  const result = walk(root, 2).join("\n")
  if (result.length <= MAX_SOURCE_LENGTH) return { html: result, nodes, truncated }

  return {
    html: `${result.slice(0, MAX_SOURCE_LENGTH)}\n    <!-- snapshot truncated safely: size limit reached -->`,
    nodes,
    truncated: true,
  }
}

function collectResources(root: HTMLElement): ResourceEntry[] {
  const resources = new Map<string, ResourceEntry>()
  const selectors = [
    ["a[href]", "href", "document"],
    ["img[src]", "src", "image"],
    ["video[src]", "src", "video"],
    ["audio[src]", "src", "audio"],
    ["source[src]", "src", "media"],
  ] as const

  for (const [selector, attribute, type] of selectors) {
    for (const element of Array.from(root.querySelectorAll(selector))) {
      const raw = element.getAttribute(attribute)?.trim()
      if (!raw || raw.startsWith("#") || raw.startsWith("data:") || raw.startsWith("blob:") || isUnsafeUrl(raw)) continue
      try {
        const url = new URL(raw, window.location.origin)
        url.username = ""
        url.password = ""
        url.search = ""
        url.hash = ""
        const path = url.origin === window.location.origin ? url.pathname : `${url.origin}${url.pathname}`
        resources.set(`${type}:${path}`, { type, path })
        if (resources.size >= 200) return Array.from(resources.values())
      } catch {
        // A malformed resource is omitted without affecting the page or snapshot.
      }
    }
  }

  return Array.from(resources.values()).sort((a, b) => a.path.localeCompare(b.path))
}

function captureSnapshot(scope: HTMLElement | null, pathname: string): Snapshot {
  try {
    if (!scope) return EMPTY_SNAPSHOT
    const roots = scope.querySelectorAll<HTMLElement>("[data-page-source-root]")
    const liveRoot = roots[roots.length - 1]
    if (!liveRoot) return EMPTY_SNAPSHOT

    const cleanRoot = sanitizeClone(liveRoot)
    const serialized = serializeElement(cleanRoot)
    const title = escapeText(document.title || "HIDDEN WIKI")
    const route = escapeAttribute(pathname || "/")
    const html = [
      "<!doctype html>",
      '<html lang="bg">',
      "  <head>",
      '    <meta charset="utf-8">',
      '    <meta name="source-mode" content="read-only">',
      `    <title>${title}</title>`,
      "  </head>",
      `  <body data-route="${route}">`,
      serialized.html,
      "  </body>",
      "</html>",
    ].join("\n")

    return {
      html,
      resources: collectResources(cleanRoot),
      capturedAt: new Date().toISOString(),
      elements: cleanRoot.querySelectorAll("*").length + 1,
      truncated: serialized.truncated,
      error: false,
    }
  } catch {
    return {
      ...EMPTY_SNAPSHOT,
      html: "<!-- Source unavailable. The page continued in safe mode. -->",
      capturedAt: new Date().toISOString(),
      error: true,
    }
  }
}

function routeFileName(pathname: string): string {
  if (pathname === "/") return "index"
  const clean = pathname.replace(/^\/hidden-wiki\/?/, "").replace(/[^a-z0-9-]+/gi, "-").replace(/^-|-$/g, "")
  return clean || "index"
}

function isInsideInspector(target: Node): boolean {
  const element = target instanceof Element ? target : target.parentElement
  return Boolean(element?.closest("[data-source-inspector]"))
}

export function SourceInspector({ scopeRef }: SourceInspectorProps) {
  const pathname = usePathname() ?? "/"
  const [tab, setTab] = useState<InspectorTab>("elements")
  const [open, setOpen] = useState(true)
  const [snapshot, setSnapshot] = useState<Snapshot>(EMPTY_SNAPSHOT)
  const [selectedFile, setSelectedFile] = useState("page-html")
  const [copied, setCopied] = useState(false)
  const updateTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const refresh = useCallback(() => {
    setSnapshot(captureSnapshot(scopeRef.current, pathname))
  }, [pathname, scopeRef])

  useEffect(() => {
    const scope = scopeRef.current
    if (!scope) return

    if (typeof MutationObserver === "undefined") {
      refresh()
      return
    }

    const scheduleRefresh = () => {
      if (updateTimer.current) return
      updateTimer.current = setTimeout(() => {
        updateTimer.current = null
        refresh()
      }, UPDATE_DELAY_MS)
    }

    const observer = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => !isInsideInspector(mutation.target))) scheduleRefresh()
    })
    observer.observe(scope, { attributes: true, childList: true, characterData: true, subtree: true })

    const frame = requestAnimationFrame(refresh)
    const settledCapture = setTimeout(refresh, 450)

    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(settledCapture)
      if (updateTimer.current) clearTimeout(updateTimer.current)
      updateTimer.current = null
      observer.disconnect()
    }
  }, [pathname, refresh, scopeRef])

  const files = useMemo<VirtualFile[]>(() => {
    const filename = routeFileName(pathname)
    const metadata = {
      site: "HIDDEN WIKI",
      route: pathname,
      title: typeof document === "undefined" ? "HIDDEN WIKI" : document.title,
      capturedAt: snapshot.capturedAt || null,
      elementCount: snapshot.elements,
      sourceBytes: byteLength(snapshot.html),
      mode: "read-only DOM snapshot",
      executable: false,
      truncated: snapshot.truncated,
    }
    const resources = {
      route: pathname,
      count: snapshot.resources.length,
      fetched: false,
      resources: snapshot.resources,
    }

    return [
      {
        id: "page-html",
        name: `${filename}.html`,
        path: `/pages/${filename}.html`,
        language: "HTML",
        content: snapshot.html,
      },
      {
        id: "metadata-json",
        name: "metadata.json",
        path: "/page/metadata.json",
        language: "JSON",
        content: JSON.stringify(metadata, null, 2),
      },
      {
        id: "resources-json",
        name: "resources.json",
        path: "/assets/resources.json",
        language: "JSON",
        content: JSON.stringify(resources, null, 2),
      },
      {
        id: "security-txt",
        name: "security.txt",
        path: "/system/security.txt",
        language: "TEXT",
        content: [
          "HIDDEN WIKI / SAFE SOURCE VIEW",
          "mode: read-only",
          "execution: disabled",
          "network-fetch: disabled",
          "scripts: omitted",
          "event-handlers: omitted",
          "embedded-documents: omitted",
          "sensitive-form-values: redacted",
          "",
          "These are generated virtual files, not a server filesystem.",
        ].join("\n"),
      },
    ]
  }, [pathname, snapshot])

  const activeFile = files.find((file) => file.id === selectedFile) ?? files[0]
  const visibleContent = tab === "elements" ? snapshot.html : activeFile.content

  const copySource = async () => {
    try {
      await navigator.clipboard.writeText(visibleContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 1_200)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className={s.inspector} data-source-inspector aria-label="Read-only page source inspector">
      <div className={s.header}>
        <button type="button" className={s.collapse} onClick={() => setOpen((value) => !value)} aria-label={open ? "Свий source inspector" : "Отвори source inspector"}>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        <div className={s.tabs} role="tablist" aria-label="Source inspector tabs">
          <button type="button" role="tab" aria-selected={tab === "elements"} data-active={tab === "elements" ? "" : undefined} onClick={() => { setTab("elements"); setOpen(true) }}>
            ELEMENTS
          </button>
          <button type="button" role="tab" aria-selected={tab === "sources"} data-active={tab === "sources" ? "" : undefined} onClick={() => { setTab("sources"); setOpen(true) }}>
            SOURCES
          </button>
        </div>

        <div className={s.status} data-error={snapshot.error ? "" : undefined}>
          <ShieldCheck size={12} />
          {snapshot.error ? "SAFE MODE" : "LIVE · READ ONLY"}
        </div>
        <span className={s.route}>{pathname}</span>
        <button type="button" className={s.copy} onClick={() => void copySource()} disabled={!open}>
          <Copy size={12} /> {copied ? "COPIED" : "COPY"}
        </button>
      </div>

      {open && (
        <div className={s.body} role="tabpanel">
          {tab === "elements" ? (
            <div className={s.elementsPane}>
              <div className={s.toolbar}>
                <span>{snapshot.elements.toLocaleString("en-US")} ELEMENTS</span>
                <span>{byteLength(snapshot.html).toLocaleString("en-US")} BYTES</span>
                <span>HTML · SCRIPT-FREE</span>
                {snapshot.truncated && <b>SAFE LIMIT APPLIED</b>}
              </div>
              <pre className={s.code} tabIndex={0}><code>{snapshot.html}</code></pre>
            </div>
          ) : (
            <div className={s.sourcesPane}>
              <aside className={s.fileTree} aria-label="Generated source files">
                <div className={s.treeRoot}><Folder size={13} /> HIDDEN-WIKI</div>
                {files.map((file) => (
                  <button
                    type="button"
                    key={file.id}
                    data-active={activeFile.id === file.id ? "" : undefined}
                    onClick={() => setSelectedFile(file.id)}
                    title={file.path}
                  >
                    <FileCode2 size={12} />
                    <span>{file.name}</span>
                  </button>
                ))}
              </aside>
              <div className={s.fileViewer}>
                <div className={s.fileBar}>
                  <span>{activeFile.path}</span>
                  <b>{activeFile.language} · VIRTUAL</b>
                </div>
                <pre className={s.code} tabIndex={0}><code>{activeFile.content}</code></pre>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
