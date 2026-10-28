"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useMarket } from "@/lib/blackmarket/client"
import { MARKET_ROOT } from "@/lib/blackmarket/catalog"
import {
  getCultChatArchive,
  getCultChatMembers,
  type CultCallEntry,
  type CultChatConversation,
  type CultChatMessage,
} from "@/lib/cult-chats"
import { addClue, getGameState, saveGameState } from "@/lib/game-state"
import s from "./cult-chat-system.module.css"

const BROTHERHOOD = "bratstvoto-na-tretoto-probuzhdane"
const VAULT_KEY = "0417-CAG"
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

interface Props {
  cultName: string
  cultSlug: string
  sourceRoute: string
}

type View = "chats" | "calls"

export function CultChatSystem({ cultName, cultSlug, sourceRoute }: Props) {
  const archive = useMemo(() => getCultChatArchive(cultSlug), [cultSlug])
  const member = useMemo(() => getCultChatMembers(archive)[0], [archive])
  const { market, unlocked: marketUnlocked, act } = useMarket()
  const hasPatch = marketUnlocked && market.patches.includes("password-v1")

  const [loggedIn, setLoggedIn] = useState(false)
  const [username, setUsername] = useState(archive.access === "password" ? "GothGirl" : archive.owner.handle)
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [activeId, setActiveId] = useState(archive.conversations[0]?.id ?? "")
  const [view, setView] = useState<View>("chats")
  const [saved, setSaved] = useState<string[]>([])
  const [recovered, setRecovered] = useState<string[]>([])
  const [recovering, setRecovering] = useState(false)
  const [recoveryProgress, setRecoveryProgress] = useState(0)
  const [vaultUnlocked, setVaultUnlocked] = useState(false)
  const [vaultKey, setVaultKey] = useState("")
  const [vaultError, setVaultError] = useState("")
  const [crackBusy, setCrackBusy] = useState(false)
  const [crackLines, setCrackLines] = useState<string[]>([])
  const [vaultBusy, setVaultBusy] = useState(false)
  const [vaultProgress, setVaultProgress] = useState(0)

  useEffect(() => {
    const gs = getGameState()
    setSaved(gs.clues.map((clue) => clue.id))
    setRecovered(archive.conversations.filter((conversation) => gs.tokens[`chat-recovered-${cultSlug}-${conversation.id}`]).map((conversation) => conversation.id))
    setVaultUnlocked(Boolean(gs.tokens["cult-call-vault-unlocked"]))
    setLoggedIn(false)
    setUsername(archive.access === "password" ? "GothGirl" : archive.owner.handle)
    setPassword("")
    setLoginError("")
    setActiveId(archive.conversations[0]?.id ?? "")
    setView("chats")
    setCrackLines([])
    setVaultError("")
  }, [archive, cultSlug])

  const activeConversation = archive.conversations.find((conversation) => conversation.id === activeId) ?? archive.conversations[0]
  const activeRecovered = activeConversation ? recovered.includes(activeConversation.id) : false
  const deletedCount = activeConversation?.messages.filter((message) => message.deleted).length ?? 0

  function rememberToken(token: string) {
    const gs = getGameState()
    saveGameState({ ...gs, tokens: { ...gs.tokens, [token]: true } })
  }

  function saveMessage(conversation: CultChatConversation, message: CultChatMessage) {
    const id = `chat-${cultSlug}-${conversation.id}-${message.id}`
    if (saved.includes(id) || (message.deleted && !activeRecovered)) return
    const text = message.deleted && message.recoveredText ? message.recoveredText : message.text
    saveGameState(addClue(getGameState(), {
      id,
      title: `[CHAT] ${archive.owner.handle} // ${conversation.title}`,
      text: `[${message.time}] ${message.author}: ${text}`,
      sourceRoute,
      confidence: message.highlighted ? 5 : 3,
      status: "unverified",
    }))
    setSaved((current) => [...current, id])
  }

  function saveCall(call: CultCallEntry) {
    const id = `call-log-${call.id}`
    if (saved.includes(id)) return
    saveGameState(addClue(getGameState(), {
      id,
      title: `[CALL LOG] ${call.timestamp.slice(11, 16)} // ${call.contact}`,
      text: call.clue ?? `${call.timestamp}: ${call.direction} ${call.number}, ${call.duration}. ${call.note}`,
      sourceRoute,
      confidence: call.flagged ? 5 : 3,
      status: "unverified",
    }))
    setSaved((current) => [...current, id])
  }

  function saveGpsToken() {
    if (!archive.gpsToken) return
    const id = `chat-gps-${archive.gpsToken.id}`
    if (saved.includes(id)) return
    saveGameState(addClue(getGameState(), {
      id,
      title: `[GPS TOKEN FRAGMENT] ${archive.gpsToken.id}`,
      text: archive.gpsToken.clue,
      sourceRoute,
      confidence: 2,
      status: "suspicious",
    }))
    setSaved((current) => [...current, id])
  }

  async function runCredentialCrack() {
    if (!hasPatch || crackBusy) return
    setCrackBusy(true)
    setLoginError("")
    setCrackLines([])
    try {
      const stages = [
        "mount dump_13-10.img --read-only",
        "locate user:GothGirl / revision chain: 04",
        "rebuild salted block / gpu dictionary: velvet-mask",
        "verify checksum against chat gateway",
      ]
      for (const line of stages) {
        setCrackLines((current) => [...current, line])
        await wait(360)
      }
      const data = await act({ action: "password" })
      setUsername(String(data.username))
      setPassword(String(data.password))
      setCrackLines((current) => [...current, `MATCH / ${data.source}`, "credential recovered → fields populated"])
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Модулът прекъсна.")
    } finally {
      setCrackBusy(false)
    }
  }

  function login() {
    if (archive.access === "snapshot") {
      setLoggedIn(true)
      return
    }
    if (username.trim().toLowerCase() === member.username.toLowerCase() && password === member.password) {
      setLoggedIn(true)
      setLoginError("")
      return
    }
    setLoginError("ACCESS DENIED / потребителят или актуалната парола не съвпадат.")
  }

  async function recoverConversation() {
    if (!activeConversation || !hasPatch || recovering) return
    setRecovering(true)
    setRecoveryProgress(7)
    for (const value of [19, 38, 61, 83, 100]) {
      await wait(300)
      setRecoveryProgress(value)
    }
    const token = `chat-recovered-${cultSlug}-${activeConversation.id}`
    rememberToken(token)
    setRecovered((current) => [...current, activeConversation.id])
    setRecovering(false)
  }

  function unlockVaultManually() {
    if (vaultKey.trim().toUpperCase() !== VAULT_KEY) {
      setVaultError("KEY REJECTED / vault index остава криптиран.")
      return
    }
    rememberToken("cult-call-vault-unlocked")
    setVaultUnlocked(true)
    setVaultError("")
  }

  async function crackVault() {
    if (!hasPatch || vaultBusy) return
    setVaultBusy(true)
    setVaultError("")
    setVaultProgress(4)
    for (const value of [13, 27, 48, 72, 91, 100]) {
      await wait(330)
      setVaultProgress(value)
    }
    setVaultKey(VAULT_KEY)
    rememberToken("cult-call-vault-unlocked")
    setVaultUnlocked(true)
    setVaultBusy(false)
  }

  return (
    <section className={s.system} id="chat-system">
      <div className={s.sectionHead}>
        <div>
          <span>02 / SECURE NODE</span>
          <h2>MEMBER ARCHIVE</h2>
        </div>
        <div className={s.nodeStatus}>
          <i /> MIRROR ONLINE
        </div>
      </div>

      <div className={s.pathbar}>
        <span>mirror://cult/{cultSlug}/profile/{archive.owner.handle}</span>
        <span>{archive.access === "password" ? "LIVE GATE" : "CAPTURED SESSION"}</span>
      </div>

      {!loggedIn ? (
        <AccessGate
          cultName={cultName}
          archive={archive}
          member={member}
          username={username}
          password={password}
          setUsername={setUsername}
          setPassword={setPassword}
          login={login}
          loginError={loginError}
          hasPatch={hasPatch}
          marketUnlocked={marketUnlocked}
          crackBusy={crackBusy}
          crackLines={crackLines}
          runCredentialCrack={runCredentialCrack}
        />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={s.archiveShell}>
          <div className={s.sessionBar}>
            <div className={s.identity}>
              <div className={s.avatar}>{archive.owner.handle.slice(0, 2).toUpperCase()}</div>
              <div>
                <span>SESSION IDENTITY</span>
                <strong>{archive.owner.handle}</strong>
                <small>{member.role} / {archive.owner.displayName}</small>
              </div>
            </div>
            <div className={s.sessionMeta}>
              <span><i className={s.liveDot} /> ENCRYPTED</span>
              <span>1 PROFILE</span>
              <button type="button" onClick={() => setLoggedIn(false)}>DISCONNECT</button>
            </div>
          </div>

          {archive.callLog && (
            <div className={s.viewTabs}>
              <button type="button" className={view === "chats" ? s.activeTab : ""} onClick={() => setView("chats")}>
                <span>01</span> CHAT INDEX <b>{archive.conversations.length}</b>
              </button>
              <button type="button" className={view === "calls" ? s.activeTab : ""} onClick={() => setView("calls")}>
                <span>02</span> CALL VAULT <b>{vaultUnlocked ? archive.callLog.length : "LOCK"}</b>
              </button>
            </div>
          )}

          {view === "chats" ? (
            <div className={s.chatGrid}>
              <aside className={s.threadList}>
                <div className={s.listLabel}>THREAD INDEX / {archive.conversations.length}</div>
                {archive.conversations.map((conversation, index) => {
                  const isActive = conversation.id === activeConversation?.id
                  const isDeleted = conversation.messages.some((message) => message.deleted)
                  return (
                    <button key={conversation.id} type="button" className={isActive ? s.activeThread : ""} onClick={() => setActiveId(conversation.id)}>
                      <span className={s.threadIndex}>{String(index + 1).padStart(2, "0")}</span>
                      <span className={s.threadCopy}>
                        <strong>{conversation.title}</strong>
                        <small>{conversation.kind === "group" ? `${conversation.participants.length} members` : conversation.participants.join(" ↔ ")}</small>
                        <em>{conversation.summary}</em>
                      </span>
                      <span className={s.threadTail}>
                        <small>{conversation.lastActivity.slice(11)}</small>
                        {isDeleted && !recovered.includes(conversation.id) ? <b className={s.deletedBadge}>DEL</b> : conversation.unread > 0 ? <b>{conversation.unread}</b> : null}
                      </span>
                    </button>
                  )
                })}
              </aside>

              <main className={s.messagePanel}>
                {activeConversation && (
                  <>
                    <header className={s.threadHeader}>
                      <div>
                        <span>{activeConversation.channel ?? "encrypted/channel"}</span>
                        <h3>{activeConversation.title}</h3>
                        <p>{activeConversation.participants.join("  /  ")}</p>
                      </div>
                      <div className={s.integrity}>
                        <span>INTEGRITY</span>
                        <strong>{activeRecovered && deletedCount ? "86% / RECOVERED" : activeConversation.integrity ?? "--"}</strong>
                      </div>
                    </header>

                    {deletedCount > 0 && !activeRecovered && (
                      <div className={s.recoveryBox}>
                        <div>
                          <span>ORPHANED SECTORS DETECTED</span>
                          <strong>{deletedCount} изтрити payload-а / headers intact</strong>
                          <p>Авторите и часовете са запазени. Съдържанието изисква sector reconstruction.</p>
                        </div>
                        {hasPatch ? (
                          <button type="button" onClick={recoverConversation} disabled={recovering}>
                            {recovering ? `RECOVERING ${recoveryProgress}%` : "RUN RECOVERY"}
                          </button>
                        ) : (
                          <Link href={`${MARKET_ROOT}/services/bruteforce`}>НУЖЕН Е PASSWORD-V1 ↗</Link>
                        )}
                        {recovering && <div className={s.progress}><i style={{ width: `${recoveryProgress}%` }} /></div>}
                      </div>
                    )}

                    <div className={s.messages}>
                      <AnimatePresence mode="popLayout">
                        {activeConversation.messages.map((message) => {
                          const isMine = message.author === archive.owner.handle
                          const isHidden = message.deleted && !activeRecovered
                          const clueId = `chat-${cultSlug}-${activeConversation.id}-${message.id}`
                          const messageText = message.deleted && activeRecovered ? message.recoveredText : message.text
                          return (
                            <motion.article
                              layout
                              key={message.id}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`${s.message} ${isMine ? s.mine : ""} ${message.highlighted && !isHidden ? s.flaggedMessage : ""} ${isHidden ? s.erased : ""}`}
                            >
                              <div className={s.messageMeta}>
                                <strong>{isHidden ? "sender::hash" : message.author}</strong>
                                <span>{message.time}</span>
                              </div>
                              <p>{messageText}</p>
                              <div className={s.messageFoot}>
                                <span>{isHidden ? `sector ${message.id} / payload=00` : message.highlighted ? "FLAGGED / EVIDENCE CANDIDATE" : `msg://${message.id}`}</span>
                                {!isHidden && (
                                  <button type="button" onClick={() => saveMessage(activeConversation, message)} disabled={saved.includes(clueId)}>
                                    {saved.includes(clueId) ? "SAVED ✓" : "SAVE CLUE"}
                                  </button>
                                )}
                              </div>
                            </motion.article>
                          )
                        })}
                      </AnimatePresence>
                    </div>
                  </>
                )}
              </main>
            </div>
          ) : (
            <CallVault
              archive={archive}
              hasPatch={hasPatch}
              marketUnlocked={marketUnlocked}
              vaultUnlocked={vaultUnlocked}
              vaultKey={vaultKey}
              setVaultKey={setVaultKey}
              vaultError={vaultError}
              vaultBusy={vaultBusy}
              vaultProgress={vaultProgress}
              unlockVaultManually={unlockVaultManually}
              crackVault={crackVault}
              saved={saved}
              saveCall={saveCall}
              saveGpsToken={saveGpsToken}
            />
          )}
        </motion.div>
      )}
    </section>
  )
}

interface AccessGateProps {
  cultName: string
  archive: ReturnType<typeof getCultChatArchive>
  member: ReturnType<typeof getCultChatMembers>[number]
  username: string
  password: string
  setUsername: (value: string) => void
  setPassword: (value: string) => void
  login: () => void
  loginError: string
  hasPatch: boolean
  marketUnlocked: boolean
  crackBusy: boolean
  crackLines: string[]
  runCredentialCrack: () => void
}

function AccessGate(props: AccessGateProps) {
  const isPassword = props.archive.access === "password"
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={s.gateGrid}>
      <div className={s.profileCard}>
        <div className={s.cardEyebrow}>{isPassword ? "TARGET ACCOUNT" : "CAPTURED IDENTITY"}</div>
        <div className={s.bigAvatar}>{props.archive.owner.handle.slice(0, 2).toUpperCase()}</div>
        <span className={s.accessPill}>{isPassword ? "PASSWORD REQUIRED" : "READ-ONLY IMAGE"}</span>
        <h3>{props.archive.owner.handle}</h3>
        <p>{props.archive.owner.displayName} / {props.member.role}</p>
        <dl>
          <div><dt>ORGANIZATION</dt><dd>{props.cultName}</dd></div>
          <div><dt>VISIBLE PROFILES</dt><dd>01 / 01</dd></div>
          <div><dt>CAPTURE</dt><dd>{props.archive.captureNote}</dd></div>
        </dl>
      </div>

      <div className={s.loginCard}>
        <div className={s.loginTop}>
          <span>{isPassword ? "CREDENTIAL GATE" : "SESSION MOUNT"}</span>
          <i className={isPassword ? s.redLight : s.greenLight} />
        </div>
        {isPassword ? (
          <>
            <label>
              <span>USERNAME</span>
              <input value={props.username} onChange={(event) => props.setUsername(event.target.value)} autoComplete="off" />
            </label>
            <label>
              <span>CURRENT PASSWORD</span>
              <input type="password" value={props.password} onChange={(event) => props.setPassword(event.target.value)} onKeyDown={(event) => event.key === "Enter" && props.login()} autoComplete="off" placeholder="Старата парола от dump-а не работи" />
            </label>
            {props.loginError && <div className={s.error}>{props.loginError}</div>}
            <button type="button" className={s.primaryButton} onClick={props.login}>DECRYPT SESSION</button>
            <div className={s.or}><span>ИЛИ</span></div>
            <div className={s.patchBox}>
              <div>
                <span>BLACKMARKET MODULE</span>
                <strong>BRUTEFORCE / password-v1</strong>
                <p>Офлайн възстановяване на последната ревизия. Работи само върху игровия dump.</p>
              </div>
              {props.hasPatch ? (
                <button type="button" onClick={props.runCredentialCrack} disabled={props.crackBusy}>
                  {props.crackBusy ? "CRACKING…" : "RUN MODULE"}
                </button>
              ) : (
                <Link href={`${MARKET_ROOT}/services/bruteforce`}>
                  {props.marketUnlocked ? "КУПИ / АКТИВИРАЙ ↗" : "ОТКЛЮЧИ BLACKMARKET ↗"}
                </Link>
              )}
            </div>
            {props.crackLines.length > 0 && (
              <div className={s.terminalLines}>
                {props.crackLines.map((line, index) => <div key={`${line}-${index}`}><span>{index === props.crackLines.length - 1 ? ">" : "$"}</span> {line}</div>)}
              </div>
            )}
          </>
        ) : (
          <>
            <div className={s.snapshotInfo}>
              <span>SESSION OWNER</span>
              <strong>{props.archive.owner.handle}</strong>
              <p>Това е единственият прихванат профил от организацията. Контактите вътре са участници в разговори, не допълнителни достъпни акаунти.</p>
            </div>
            <button type="button" className={s.primaryButton} onClick={props.login}>MOUNT CAPTURED SESSION</button>
          </>
        )}
      </div>
    </motion.div>
  )
}

interface CallVaultProps {
  archive: ReturnType<typeof getCultChatArchive>
  hasPatch: boolean
  marketUnlocked: boolean
  vaultUnlocked: boolean
  vaultKey: string
  setVaultKey: (value: string) => void
  vaultError: string
  vaultBusy: boolean
  vaultProgress: number
  unlockVaultManually: () => void
  crackVault: () => void
  saved: string[]
  saveCall: (call: CultCallEntry) => void
  saveGpsToken: () => void
}

function CallVault(props: CallVaultProps) {
  if (!props.vaultUnlocked) {
    return (
      <div className={s.vaultGate}>
        <div className={s.lockGlyph}><span>×</span></div>
        <span className={s.vaultEyebrow}>SECONDARY ENCRYPTED INDEX</span>
        <h3>CALL VAULT // LOCKED</h3>
        <p>Телефонният лог не използва паролата на профила. Въведи отделния vault key или използвай закупения модул.</p>
        <div className={s.vaultInput}>
          <input type="password" value={props.vaultKey} onChange={(event) => props.setVaultKey(event.target.value)} onKeyDown={(event) => event.key === "Enter" && props.unlockVaultManually()} placeholder="VAULT KEY" />
          <button type="button" onClick={props.unlockVaultManually}>ENTER</button>
        </div>
        {props.vaultError && <div className={s.error}>{props.vaultError}</div>}
        <div className={s.or}><span>OFFLINE ATTACK</span></div>
        {props.hasPatch ? (
          <button type="button" className={s.vaultCrack} onClick={props.crackVault} disabled={props.vaultBusy}>
            <span>password-v1 / callvault profile</span>
            <strong>{props.vaultBusy ? `BRUTEFORCE ${props.vaultProgress}%` : "BRUTEFORCE VAULT KEY"}</strong>
          </button>
        ) : (
          <Link className={s.vaultCrack} href={`${MARKET_ROOT}/services/bruteforce`}>
            <span>password-v1 / not installed</span>
            <strong>{props.marketUnlocked ? "GET SOFTWARE ↗" : "UNLOCK BLACKMARKET ↗"}</strong>
          </Link>
        )}
        {props.vaultBusy && <div className={s.progress}><i style={{ width: `${props.vaultProgress}%` }} /></div>}
      </div>
    )
  }

  return (
    <div className={s.callVault}>
      <header className={s.callHead}>
        <div><span>DECRYPTED INDEX / SIM-03</span><h3>CALL LOG // GOTHGIRL</h3></div>
        <div><b>{props.archive.callLog?.length ?? 0}</b><span>records</span></div>
      </header>
      <div className={s.callTableWrap}>
        <table className={s.callTable}>
          <thead><tr><th>DATE / TIME</th><th>DIR</th><th>NUMBER / CONTACT</th><th>DURATION</th><th>CELL / NOTE</th><th /></tr></thead>
          <tbody>
            {props.archive.callLog?.map((call) => {
              const clueId = `call-log-${call.id}`
              return (
                <tr key={call.id} className={call.flagged ? s.flaggedCall : ""}>
                  <td><code>{call.timestamp}</code><small>{call.id}</small></td>
                  <td><span className={`${s.direction} ${s[call.direction.toLowerCase()]}`}>{call.direction}</span></td>
                  <td><strong>{call.number}</strong><small>{call.contact}</small></td>
                  <td><code>{call.duration}</code></td>
                  <td><strong>{call.cell}</strong><small>{call.note}</small></td>
                  <td><button type="button" onClick={() => props.saveCall(call)} disabled={props.saved.includes(clueId)}>{props.saved.includes(clueId) ? "✓" : "SAVE"}</button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {props.archive.gpsToken && (
        <section className={s.tokenCard}>
          <div className={s.tokenStripe}>EXTRACTED PAYLOAD / CROSS-ORG SIGNATURE</div>
          <div className={s.tokenGrid}>
            <div>
              <span>TOKEN FRAGMENT</span>
              <h4>{props.archive.gpsToken.id}</h4>
              <code>{props.archive.gpsToken.fragment}</code>
            </div>
            <dl>
              <div><dt>ISSUER</dt><dd>{props.archive.gpsToken.issuer}</dd></div>
              <div><dt>SUBJECT</dt><dd>{props.archive.gpsToken.subject}</dd></div>
              <div><dt>COORDINATES</dt><dd>{props.archive.gpsToken.coordinates}</dd></div>
              <div><dt>TIMESTAMP</dt><dd>{props.archive.gpsToken.timestamp}</dd></div>
            </dl>
          </div>
          <div className={s.integrityMeter}>
            <span>CRYPTO INTEGRITY</span>
            <div><i style={{ width: `${props.archive.gpsToken.integrity}%` }} /></div>
            <strong>{props.archive.gpsToken.integrity}%</strong>
          </div>
          <p>{props.archive.gpsToken.note}</p>
          <button type="button" onClick={props.saveGpsToken} disabled={props.saved.includes(`chat-gps-${props.archive.gpsToken.id}`)}>
            {props.saved.includes(`chat-gps-${props.archive.gpsToken.id}`) ? "CLUE SAVED ✓" : "SAVE GPS TOKEN FRAGMENT"}
          </button>
        </section>
      )}
    </div>
  )
}
