'use client'

import { useMemo, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, CircleHelp, Command, Crosshair, Database, Gauge, Menu, Network, RotateCcw, Server, ShieldCheck, Terminal, Trophy, X, Zap } from 'lucide-react'

type Category = 'All topics' | 'Active Directory' | 'Networking' | 'PowerShell' | 'Security'
type Question = {
  id: number
  category: Exclude<Category, 'All topics'>
  difficulty: 'FOUNDATION' | 'INTERMEDIATE' | 'ADVANCED'
  prompt: string
  answers: string[]
  correct: number
  explanation: string
  command?: string
}

const questions: Question[] = [
  { id: 1, category: 'Active Directory', difficulty: 'FOUNDATION', prompt: 'Which command-line tool is used to query and troubleshoot DNS records from a Windows client?', answers: ['ipconfig', 'nslookup', 'netstat', 'gpresult'], correct: 1, explanation: 'nslookup queries DNS servers and can verify name resolution, record types, and authoritative responses.', command: 'nslookup dc01.corp.local' },
  { id: 2, category: 'Active Directory', difficulty: 'INTERMEDIATE', prompt: 'What is the primary purpose of an Organizational Unit (OU) in Active Directory?', answers: ['To store DNS zone files', 'To create a new forest', 'To organize objects and delegate administration', 'To encrypt user passwords'], correct: 2, explanation: 'OUs provide a logical container for users, computers, and groups. They also provide a scope for Group Policy and delegation.', command: 'New-ADOrganizationalUnit -Name "Workstations"' },
  { id: 3, category: 'PowerShell', difficulty: 'INTERMEDIATE', prompt: 'Which PowerShell cmdlet lists all members of an Active Directory security group?', answers: ['Get-ADGroupMember', 'Get-ADUser', 'Show-GroupUsers', 'Get-LocalGroup'], correct: 0, explanation: 'Get-ADGroupMember returns users, groups, and computers that are direct members of a specified AD group.', command: 'Get-ADGroupMember -Identity "IT-Admins"' },
  { id: 4, category: 'Networking', difficulty: 'FOUNDATION', prompt: 'Which TCP port is commonly used by LDAP for directory queries without encryption?', answers: ['53', '88', '389', '445'], correct: 2, explanation: 'LDAP uses TCP 389 by default. LDAPS uses TCP 636 for LDAP over TLS.', command: 'Test-NetConnection dc01 -Port 389' },
  { id: 5, category: 'Security', difficulty: 'ADVANCED', prompt: 'Kerberos authentication primarily uses which type of credential to provide single sign-on?', answers: ['NTLM challenge', 'Ticket-granting tickets', 'Local SAM hashes', 'RADIUS tokens'], correct: 1, explanation: 'Kerberos issues a Ticket Granting Ticket (TGT), which the client exchanges for service tickets without repeatedly sending a password.', command: 'klist get cifs/fileserver' },
  { id: 6, category: 'Active Directory', difficulty: 'INTERMEDIATE', prompt: 'Which command forces a domain controller to replicate changes with its partners?', answers: ['dcdiag /test:replication', 'repadmin /syncall', 'gpupdate /force', 'dism /online'], correct: 1, explanation: 'repadmin /syncall triggers synchronization with replication partners. dcdiag diagnoses; it does not initiate replication.', command: 'repadmin /syncall /AdeP' },
  { id: 7, category: 'Networking', difficulty: 'FOUNDATION', prompt: 'What does the DHCP process primarily provide to a workstation?', answers: ['A user security token', 'An IP configuration lease', 'A domain replication path', 'A file share'], correct: 1, explanation: 'DHCP automatically leases network settings such as IP address, subnet mask, gateway, and DNS servers.', command: 'ipconfig /renew' },
  { id: 8, category: 'PowerShell', difficulty: 'ADVANCED', prompt: 'Which parameter is safest for previewing the impact of a destructive PowerShell cmdlet?', answers: ['-Verbose', '-WhatIf', '-Debug', '-Confirm:$false'], correct: 1, explanation: '-WhatIf simulates the action and reports what would happen without changing the environment.', command: 'Remove-ADUser -Identity jdoe -WhatIf' },
]

const categories: { label: Category; icon: typeof Terminal }[] = [
  { label: 'All topics', icon: Crosshair },
  { label: 'Active Directory', icon: Network },
  { label: 'Networking', icon: Server },
  { label: 'PowerShell', icon: Terminal },
  { label: 'Security', icon: ShieldCheck },
]

export default function Page() {
  const [category, setCategory] = useState<Category>('All topics')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState<number[]>([])
  const [mobileMenu, setMobileMenu] = useState(false)

  const filtered = useMemo(() => category === 'All topics' ? questions : questions.filter((question) => question.category === category), [category])
  const question = filtered[questionIndex % filtered.length]
  const progress = Math.round(((questionIndex + (submitted ? 1 : 0)) / filtered.length) * 100)

  function chooseCategory(next: Category) {
    setCategory(next)
    setQuestionIndex(0)
    setSelected(null)
    setSubmitted(false)
    setCompleted([])
    setScore(0)
    setMobileMenu(false)
  }

  function submitAnswer() {
    if (selected === null || submitted) return
    setSubmitted(true)
    if (selected === question.correct) setScore((value) => value + 1)
    setCompleted((items) => [...items, question.id])
  }

  function nextQuestion() {
    setQuestionIndex((value) => value + 1)
    setSelected(null)
    setSubmitted(false)
  }

  function resetQuiz() {
    setQuestionIndex(0)
    setSelected(null)
    setSubmitted(false)
    setCompleted([])
    setScore(0)
  }

  return (
    <main className="min-h-screen bg-[#0c0d10] text-[#f3f0e9]">
      <header className="border-b border-[#303238] bg-[#121419]">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button className="rounded border border-[#41434a] p-2 text-[#e9b949] lg:hidden" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle navigation"><Menu /></button>
            <div className="flex size-10 items-center justify-center rounded bg-[#e8ad32] text-[#121419]"><Terminal /></div>
            <div><p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#e8ad32]">OPS / TRAINING</p><h1 className="font-sans text-xl font-bold tracking-tight">DOMAIN<span className="text-[#ed5c8d]">//</span>QUEST</h1></div>
          </div>
          <div className="hidden items-center gap-7 font-mono text-xs uppercase tracking-widest text-[#858891] md:flex"><span className="text-[#e8ad32]">● LIVE SESSION</span><span>QUESTION BANK: 08</span><span>V1.4.0</span></div>
          <div className="flex items-center gap-2 rounded border border-[#34363c] bg-[#191b20] px-3 py-2 font-mono text-xs"><Zap className="text-[#e8ad32]" /> <span className="text-[#a6a8b0]">STREAK</span> <strong className="text-[#f3f0e9]">07</strong></div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[248px_1fr]">
        <aside className={`${mobileMenu ? 'block' : 'hidden'} border-r border-[#303238] bg-[#101216] p-5 lg:block`}>
          <div className="mb-8"><p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-[#6f727b]">SELECT MODULE</p><nav className="flex flex-col gap-1">{categories.map(({ label, icon: Icon }) => <button key={label} onClick={() => chooseCategory(label)} className={`group flex items-center gap-3 rounded px-3 py-3 text-left font-mono text-xs uppercase tracking-wider transition ${category === label ? 'bg-[#e8ad32] font-bold text-[#15161a]' : 'text-[#9b9da5] hover:bg-[#1b1d22] hover:text-[#f3f0e9]'}`}><Icon className="size-4" />{label}</button>)}</nav></div>
          <div className="border-t border-[#303238] pt-6"><p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-[#6f727b]">SESSION MODE</p><div className="flex items-center justify-between border border-[#34363c] bg-[#181a1f] px-3 py-3 font-mono text-xs"><span className="text-[#a7a9b0]">PRACTICE</span><span className="size-2 rounded-full bg-[#e8ad32] shadow-[0_0_8px_#e8ad32]" /></div></div>
          <div className="mt-8 border border-[#3b3030] bg-[#1b1719] p-4"><div className="mb-3 flex items-center gap-2 text-[#ed5c8d]"><Gauge className="size-4" /><span className="font-mono text-[10px] uppercase tracking-widest">YOUR SIGNAL</span></div><p className="font-sans text-2xl font-bold">{Math.round((score / Math.max(completed.length, 1)) * 100)}%</p><p className="mt-1 font-mono text-[10px] text-[#8e7780]">ACCURACY THIS RUN</p></div>
        </aside>

        <section className="min-w-0 px-5 py-7 lg:px-12 lg:py-10">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-[#e8ad32]">TRAINING CONSOLE / {category}</p><h2 className="font-sans text-3xl font-bold tracking-tight sm:text-4xl">Sharpen your edge.</h2><p className="mt-2 max-w-2xl text-sm text-[#92949d]">Practice the commands, protocols, and concepts that keep enterprise networks running.</p></div><button onClick={resetQuiz} className="flex items-center gap-2 self-start border border-[#3b3d44] px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-[#a7a9b0] hover:border-[#e8ad32] hover:text-[#e8ad32]"><RotateCcw className="size-3" /> Reset run</button></div>

          <div className="mb-8 grid gap-3 sm:grid-cols-3"><div className="border border-[#303238] bg-[#15171c] p-4"><div className="mb-2 flex justify-between font-mono text-[10px] uppercase tracking-widest text-[#7e818a]"><span>Progress</span><span className="text-[#e8ad32]">{Math.min(progress, 100)}%</span></div><div className="h-1 bg-[#2c2e34]"><div className="h-full bg-[#e8ad32] transition-all" style={{ width: `${Math.min(progress, 100)}%` }} /></div></div><div className="border border-[#303238] bg-[#15171c] p-4"><div className="flex items-center gap-3"><Trophy className="text-[#ed5c8d]" /><div><p className="font-mono text-[10px] uppercase tracking-widest text-[#7e818a]">Score</p><p className="font-sans text-xl font-bold">{score} <span className="text-sm text-[#767982]">/ {completed.length}</span></p></div></div></div><div className="border border-[#303238] bg-[#15171c] p-4"><div className="flex items-center gap-3"><Database className="text-[#7db6c9]" /><div><p className="font-mono text-[10px] uppercase tracking-widest text-[#7e818a]">Queue</p><p className="font-sans text-xl font-bold">{filtered.length - completed.length} <span className="text-sm text-[#767982]">remaining</span></p></div></div></div></div>

          <article className="border border-[#45474e] bg-[#14161b] shadow-[8px_8px_0_#08090b]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#303238] px-5 py-4"><div className="flex items-center gap-3"><span className="border border-[#e8ad32] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[#e8ad32]">Q.{String(question.id).padStart(2, '0')}</span><span className="font-mono text-[10px] uppercase tracking-widest text-[#888b93]">{question.category}</span></div><span className={`font-mono text-[10px] uppercase tracking-widest ${question.difficulty === 'ADVANCED' ? 'text-[#ed5c8d]' : 'text-[#7db6c9]'}`}>{question.difficulty}</span></div>
            <div className="p-5 sm:p-8"><h3 className="max-w-3xl font-sans text-xl font-semibold leading-relaxed sm:text-2xl">{question.prompt}</h3><div className="mt-7 grid gap-3">{question.answers.map((answer, index) => { const isCorrect = submitted && index === question.correct; const isWrong = submitted && selected === index && !isCorrect; return <button key={answer} onClick={() => !submitted && setSelected(index)} className={`flex items-center gap-4 border px-4 py-4 text-left transition ${isCorrect ? 'border-[#89bd72] bg-[#1d2b23] text-[#b6e4a2]' : isWrong ? 'border-[#ed5c8d] bg-[#2b1a22] text-[#ff9fbb]' : selected === index ? 'border-[#e8ad32] bg-[#2b2415] text-[#f3f0e9]' : 'border-[#36383e] bg-[#1a1c21] text-[#b1b3ba] hover:border-[#7d8088] hover:text-[#f3f0e9]'}`} aria-pressed={selected === index}><span className="flex size-7 shrink-0 items-center justify-center border border-current font-mono text-xs">{String.fromCharCode(65 + index)}</span><span className="font-mono text-sm">{answer}</span>{isCorrect && <Check className="ml-auto" />}{isWrong && <X className="ml-auto" />}</button> })}</div>
              {submitted && <div className="mt-6 border-l-2 border-[#e8ad32] bg-[#201e18] p-4"><p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-[#e8ad32]">FIELD NOTE / EXPLANATION</p><p className="text-sm leading-relaxed text-[#c2c0b8]">{question.explanation}</p>{question.command && <code className="mt-3 block overflow-x-auto border border-[#403c2b] bg-[#111216] px-3 py-2 font-mono text-xs text-[#e8ad32]">PS&gt; {question.command}</code>}</div>}
              <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-[#303238] pt-5 sm:flex-row sm:items-center"><button onClick={() => { setQuestionIndex((value) => Math.max(0, value - 1)); setSelected(null); setSubmitted(false) }} disabled={questionIndex === 0} className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#777a83] hover:text-[#f3f0e9] disabled:cursor-not-allowed disabled:opacity-30"><ChevronLeft className="size-4" /> Previous</button>{submitted ? <button onClick={nextQuestion} className="flex items-center justify-center gap-2 bg-[#e8ad32] px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[#15161a] hover:bg-[#f2c45c]">Next question <ChevronRight className="size-4" /></button> : <button onClick={submitAnswer} disabled={selected === null} className="flex items-center justify-center gap-2 bg-[#e8ad32] px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[#15161a] hover:bg-[#f2c45c] disabled:cursor-not-allowed disabled:opacity-40">Lock answer <Command className="size-4" /></button>}</div>
            </div>
          </article>
          <div className="mt-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#62656d]"><CircleHelp className="size-3" /> Select an answer, then lock it in to reveal the field note.</div>
        </section>
      </div>
    </main>
  )
}
