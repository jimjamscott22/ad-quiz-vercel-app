'use client'

import { useMemo, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, CircleHelp, Command, Crosshair, Database, Gauge, Menu, Network, RotateCcw, Server, ShieldCheck, Terminal, Trophy, X, Zap } from 'lucide-react'

type Category = 'All topics' | 'Active Directory' | 'Networking' | 'PowerShell' | 'Security' | 'Windows Server' | 'Linux' | 'Cloud'
type Challenge = 'Standard' | 'AD Gauntlet' | 'Command Line' | 'Hard Mode'
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
  { id: 9, category: 'Active Directory', difficulty: 'ADVANCED', prompt: 'Which FSMO role is responsible for processing password changes and account lockouts with priority?', answers: ['Schema Master', 'RID Master', 'PDC Emulator', 'Infrastructure Master'], correct: 2, explanation: 'The PDC Emulator receives preferential password-change replication and is consulted when authentication fails due to a potentially stale password.', command: 'netdom query fsmo' },
  { id: 10, category: 'Active Directory', difficulty: 'INTERMEDIATE', prompt: 'Which group scope can contain accounts from any domain but assign permissions only within its own domain?', answers: ['Global', 'Domain Local', 'Universal', 'Distribution'], correct: 1, explanation: 'Domain Local groups can contain members from trusted domains but are used to grant permissions only in the group’s domain.' },
  { id: 11, category: 'Active Directory', difficulty: 'ADVANCED', prompt: 'A user receives an old GPO setting after moving OUs. Which command produces the most useful applied-policy report?', answers: ['gpresult /h report.html', 'gpmc /refresh', 'secedit /reset', 'net user /policy'], correct: 0, explanation: 'gpresult reports the Resultant Set of Policy, including applied and denied GPOs and filtering reasons.', command: 'gpresult /h C:\\Temp\\gp-report.html' },
  { id: 12, category: 'Networking', difficulty: 'INTERMEDIATE', prompt: 'A host can reach an IP address but not its hostname. Which service should you investigate first?', answers: ['DHCP', 'DNS', 'NTP', 'SNMP'], correct: 1, explanation: 'Successful IP connectivity with failed hostname access strongly indicates a name-resolution problem.', command: 'Resolve-DnsName fileserver.corp.local' },
  { id: 13, category: 'Networking', difficulty: 'ADVANCED', prompt: 'Which subnet mask supports 30 usable IPv4 host addresses?', answers: ['255.255.255.0', '255.255.255.224', '255.255.255.240', '255.255.255.248'], correct: 1, explanation: 'A /27 leaves five host bits: 32 total addresses minus network and broadcast equals 30 usable addresses.' },
  { id: 14, category: 'Networking', difficulty: 'INTERMEDIATE', prompt: 'Which tool shows every router hop toward a destination from Windows?', answers: ['route print', 'tracert', 'arp -a', 'pathping /renew'], correct: 1, explanation: 'tracert sends probes with increasing TTL values to reveal each Layer 3 hop.', command: 'tracert 8.8.8.8' },
  { id: 15, category: 'PowerShell', difficulty: 'INTERMEDIATE', prompt: 'Which pipeline returns only stopped Windows services?', answers: ['Get-Service | Where-Object Status -eq Stopped', 'Stop-Service | Get-Service', 'Get-Process -Stopped', 'Select-Service Status'], correct: 0, explanation: 'Where-Object filters pipeline objects by a property condition.', command: "Get-Service | Where-Object Status -eq 'Stopped'" },
  { id: 16, category: 'PowerShell', difficulty: 'ADVANCED', prompt: 'What does PowerShell remoting use by default on modern Windows systems?', answers: ['SSH only', 'WinRM and WS-Management', 'RDP virtual channels', 'SMB named pipes'], correct: 1, explanation: 'Traditional PowerShell remoting uses WinRM, Microsoft’s implementation of WS-Management.', command: 'Enter-PSSession -ComputerName DC01' },
  { id: 17, category: 'Security', difficulty: 'INTERMEDIATE', prompt: 'Which principle gives users only the permissions required to perform their role?', answers: ['Defense in depth', 'Least privilege', 'Open trust', 'Non-repudiation'], correct: 1, explanation: 'Least privilege limits access and reduces both accidental damage and the impact of a compromised account.' },
  { id: 18, category: 'Security', difficulty: 'ADVANCED', prompt: 'What is the best immediate response when a privileged account is suspected compromised?', answers: ['Delete all audit logs', 'Disable the account and revoke sessions', 'Restart every workstation', 'Rename the domain'], correct: 1, explanation: 'Containment comes first: disable the identity, revoke active sessions/tokens, preserve evidence, and begin incident response.' },
  { id: 19, category: 'Windows Server', difficulty: 'FOUNDATION', prompt: 'Which console is commonly used to inspect Windows system and application logs?', answers: ['Event Viewer', 'Disk Cleanup', 'Registry Editor', 'Resource Monitor'], correct: 0, explanation: 'Event Viewer provides centralized access to Windows event channels, including System, Security, and Application logs.', command: 'eventvwr.msc' },
  { id: 20, category: 'Windows Server', difficulty: 'INTERMEDIATE', prompt: 'Which command checks and repairs the Windows component store?', answers: ['sfc /verifyonly', 'DISM /Online /Cleanup-Image /RestoreHealth', 'chkdsk /r', 'bootrec /fixmbr'], correct: 1, explanation: 'DISM RestoreHealth scans the component store and repairs corruption used by Windows servicing and SFC.', command: 'DISM /Online /Cleanup-Image /RestoreHealth' },
  { id: 21, category: 'Linux', difficulty: 'FOUNDATION', prompt: 'Which command displays the current working directory?', answers: ['ls', 'pwd', 'whoami', 'cd'], correct: 1, explanation: 'pwd prints the absolute path of the shell’s current working directory.', command: 'pwd' },
  { id: 22, category: 'Linux', difficulty: 'INTERMEDIATE', prompt: 'Which command follows new lines appended to a log file in real time?', answers: ['cat -r', 'tail -f', 'grep -n', 'less -x'], correct: 1, explanation: 'tail -f keeps the file open and prints newly appended lines, which is useful for live troubleshooting.', command: 'tail -f /var/log/syslog' },
  { id: 23, category: 'Cloud', difficulty: 'FOUNDATION', prompt: 'Which cloud service model gives you virtual machines while the provider manages physical hardware?', answers: ['SaaS', 'PaaS', 'IaaS', 'FaaS'], correct: 2, explanation: 'Infrastructure as a Service provides compute, storage, and networking resources while the provider operates the underlying hardware.' },
  { id: 24, category: 'Cloud', difficulty: 'INTERMEDIATE', prompt: 'What is the main resilience benefit of deploying across multiple availability zones?', answers: ['Lower password complexity', 'Protection from a single data-center failure', 'Unlimited bandwidth', 'No need for backups'], correct: 1, explanation: 'Availability zones are isolated facilities; distributing workloads reduces dependency on one physical location.' },
  { id: 25, category: 'Active Directory', difficulty: 'FOUNDATION', prompt: 'Which command creates a new Active Directory user with the PowerShell AD module?', answers: ['Add-ADUser', 'New-ADUser', 'Create-DomainUser', 'Set-ADAccount'], correct: 1, explanation: 'New-ADUser creates a user object in Active Directory. Use parameters such as -Name, -SamAccountName, and -Path to define it.', command: 'New-ADUser -Name "Alex Morgan" -SamAccountName amorgan' },
  { id: 26, category: 'Active Directory', difficulty: 'ADVANCED', prompt: 'What does the SYSVOL folder primarily store on a domain controller?', answers: ['User profile pictures', 'Group Policy templates and logon scripts', 'SQL database files', 'DHCP lease history'], correct: 1, explanation: 'SYSVOL contains domain-wide files such as Group Policy templates and scripts that must replicate between domain controllers.', command: 'dcdiag /test:sysvolcheck' },
  { id: 27, category: 'Networking', difficulty: 'FOUNDATION', prompt: 'Which protocol automatically synchronizes a computer clock with a time source?', answers: ['NTP', 'FTP', 'ICMP', 'ARP'], correct: 0, explanation: 'Network Time Protocol keeps system clocks aligned. Accurate time is especially important because Kerberos is sensitive to clock skew.', command: 'w32tm /query /status' },
  { id: 28, category: 'Networking', difficulty: 'ADVANCED', prompt: 'Which DNS record identifies the mail server responsible for a domain?', answers: ['A', 'CNAME', 'MX', 'PTR'], correct: 2, explanation: 'An MX record specifies the mail exchange servers that receive email for a domain.', command: 'Resolve-DnsName -Type MX example.com' },
  { id: 29, category: 'PowerShell', difficulty: 'FOUNDATION', prompt: 'Which cmdlet displays the contents of a text file in PowerShell?', answers: ['Get-Content', 'Read-File', 'Show-Text', 'Open-Item'], correct: 0, explanation: 'Get-Content reads the contents of a file and outputs each line as an object in the pipeline.', command: 'Get-Content .\\logs\\app.log' },
  { id: 30, category: 'PowerShell', difficulty: 'ADVANCED', prompt: 'Which PowerShell operator checks whether a value matches a regular expression?', answers: ['-contains', '-like', '-match', '-in'], correct: 2, explanation: 'The -match operator evaluates a regular expression and returns a Boolean result or captured matches.', command: "$email -match '^[^@]+@[^@]+$'" },
  { id: 31, category: 'Security', difficulty: 'FOUNDATION', prompt: 'What is phishing?', answers: ['A backup rotation method', 'A social engineering attempt to steal information', 'A disk encryption algorithm', 'A network routing protocol'], correct: 1, explanation: 'Phishing uses deceptive messages or websites to trick people into revealing credentials, payment details, or other sensitive information.' },
  { id: 32, category: 'Security', difficulty: 'ADVANCED', prompt: 'Which control most directly limits lateral movement after a workstation is compromised?', answers: ['Network segmentation', 'A larger monitor', 'Longer cable runs', 'Disabling screen savers'], correct: 0, explanation: 'Network segmentation restricts communication paths between systems, reducing the attacker’s ability to move across trust boundaries.' },
  { id: 33, category: 'Linux', difficulty: 'INTERMEDIATE', prompt: 'Which command changes file permissions using symbolic notation?', answers: ['chmod', 'chown', 'passwd', 'mount'], correct: 0, explanation: 'chmod changes permission bits, while chown changes file ownership.', command: 'chmod u+x deploy.sh' },
  { id: 34, category: 'Cloud', difficulty: 'INTERMEDIATE', prompt: 'What does the shared responsibility model describe?', answers: ['How cloud costs are divided between regions', 'Which security tasks belong to the provider and the customer', 'How users share one password', 'How DNS zones replicate'], correct: 1, explanation: 'The provider secures the underlying cloud infrastructure, while the customer remains responsible for areas such as identities, data, and configuration.' },
  { id: 35, category: 'Active Directory', difficulty: 'FOUNDATION', prompt: 'Which PowerShell cmdlet unlocks an Active Directory user account that was locked out by failed logons?', answers: ['Enable-ADAccount', 'Unlock-ADAccount', 'Reset-ADUser', 'Clear-ADLockout'], correct: 1, explanation: 'Unlock-ADAccount clears the lockout on an account. Enable-ADAccount is different: it re-enables an account that an admin disabled.', command: 'Unlock-ADAccount -Identity jdoe' },
  { id: 36, category: 'Active Directory', difficulty: 'FOUNDATION', prompt: 'Which DNS record type do domain-joined clients query to locate domain controllers?', answers: ['A', 'SRV', 'MX', 'TXT'], correct: 1, explanation: 'Domain controllers register SRV records such as _ldap._tcp.dc._msdcs.<domain>. Clients query these to find DCs offering LDAP and Kerberos.', command: 'nslookup -type=SRV _ldap._tcp.dc._msdcs.corp.local' },
  { id: 37, category: 'Active Directory', difficulty: 'INTERMEDIATE', prompt: 'In what order is Group Policy processed by default?', answers: ['Domain, OU, Site, Local', 'Local, Site, Domain, OU', 'OU, Domain, Site, Local', 'Site, Local, OU, Domain'], correct: 1, explanation: 'Group Policy applies in LSDOU order: Local, Site, Domain, then OU. Later policies win conflicts, so OU-linked GPOs override domain GPOs unless a link is Enforced.', command: 'Get-GPInheritance -Target "OU=Workstations,DC=corp,DC=local"' },
  { id: 38, category: 'Active Directory', difficulty: 'INTERMEDIATE', prompt: 'Which feature lets you restore a deleted AD user with its group memberships and attributes intact, without an authoritative restore?', answers: ['Active Directory Recycle Bin', 'Windows Server Backup', 'DFS Replication', 'Sysprep'], correct: 0, explanation: 'Once enabled, the AD Recycle Bin keeps deleted objects with all their attributes for the deleted-object lifetime, so they can be restored online.', command: "Get-ADObject -Filter 'samAccountName -eq \"jdoe\"' -IncludeDeletedObjects | Restore-ADObject" },
  { id: 39, category: 'Active Directory', difficulty: 'ADVANCED', prompt: 'Which FSMO role hands out pools of relative identifiers so domain controllers can create new security principals?', answers: ['Schema Master', 'RID Master', 'Domain Naming Master', 'PDC Emulator'], correct: 1, explanation: 'The RID Master allocates RID pools to each DC. Every new user, group, or computer SID combines the domain SID with a unique RID.', command: 'Get-ADDomain | Select-Object RIDMaster' },
  { id: 40, category: 'Active Directory', difficulty: 'ADVANCED', prompt: 'IT admins need a stricter password policy than everyone else in the same domain. What should you use?', answers: ['A Password Settings Object (PSO)', 'A password GPO linked to the admins OU', 'A local security policy on each DC', 'A new Kerberos realm trust'], correct: 0, explanation: 'Fine-grained password policies are stored as PSOs and applied to users or global groups. A password GPO linked to an OU does not change domain account policy.', command: 'New-ADFineGrainedPasswordPolicy -Name "AdminsPSO" -Precedence 10 -MinPasswordLength 15' },
  { id: 41, category: 'PowerShell', difficulty: 'INTERMEDIATE', prompt: 'Which cmdlet finds AD user accounts that have not signed in for 90 days?', answers: ['Get-ADUser -Stale', 'Search-ADAccount -AccountInactive', 'Find-ADUser -NoLogon', 'Get-LocalUser -Inactive'], correct: 1, explanation: 'Search-ADAccount -AccountInactive uses the replicated lastLogonTimestamp attribute to find stale accounts for cleanup reviews.', command: 'Search-ADAccount -AccountInactive -TimeSpan 90.00:00:00 -UsersOnly' },
  { id: 42, category: 'Security', difficulty: 'INTERMEDIATE', prompt: 'Which attack requests Kerberos service tickets for service accounts and cracks them offline?', answers: ['Pass-the-hash', 'Kerberoasting', 'DNS spoofing', 'ARP poisoning'], correct: 1, explanation: 'Any domain user can request a service ticket for an account with an SPN. Long random passwords or gMSAs make those tickets impractical to crack.', command: "Get-ADUser -Filter 'ServicePrincipalName -like \"*\"' -Properties ServicePrincipalName" },
  { id: 43, category: 'Windows Server', difficulty: 'INTERMEDIATE', prompt: 'Which account type automatically rotates a complex password for a service running on several servers?', answers: ['Group Managed Service Account (gMSA)', 'Built-in Administrator', 'Guest account', 'Local user account'], correct: 0, explanation: 'gMSAs let Active Directory generate and rotate the password, and only approved hosts can retrieve it. This requires a KDS root key in the domain.', command: 'New-ADServiceAccount -Name svc-web -DNSHostName svc-web.corp.local -PrincipalsAllowedToRetrieveManagedPassword "WebServers"' },
  { id: 44, category: 'Networking', difficulty: 'INTERMEDIATE', prompt: 'Which port does Kerberos authentication use on a domain controller?', answers: ['88', '135', '389', '3389'], correct: 0, explanation: 'Kerberos uses TCP and UDP 88. If a firewall blocks it, clients may fall back to NTLM or fail to authenticate.', command: 'Test-NetConnection dc01 -Port 88' },
  { id: 45, category: 'Linux', difficulty: 'INTERMEDIATE', prompt: 'Which command searches recursively for the word "failed" inside files under /var/log?', answers: ['find /var/log -name failed', 'grep -R "failed" /var/log', 'locate -r failed /var/log', 'scan /var/log failed'], correct: 1, explanation: 'grep -R recursively searches files beneath a directory and prints matching lines.', command: 'grep -R "failed" /var/log' },
  { id: 46, category: 'Linux', difficulty: 'INTERMEDIATE', prompt: 'Which command shows disk space usage for mounted filesystems in a human-readable format?', answers: ['du -sh', 'df -h', 'lsblk -p', 'mount -v'], correct: 1, explanation: 'df reports free and used space for filesystems; the -h flag formats sizes in readable units such as GiB.', command: 'df -h' },
  { id: 47, category: 'Linux', difficulty: 'INTERMEDIATE', prompt: 'Which command displays the processes consuming the most CPU interactively?', answers: ['top', 'free', 'jobs', 'uptime'], correct: 0, explanation: 'top provides a continuously refreshed process list sorted by resource usage, including CPU and memory.', command: 'top' },
  { id: 48, category: 'Linux', difficulty: 'INTERMEDIATE', prompt: 'What does the command `sudo systemctl restart nginx` do?', answers: ['Enables nginx at boot only', 'Restarts the nginx service with elevated privileges', 'Reloads the kernel', 'Deletes nginx logs'], correct: 1, explanation: 'sudo runs the command with elevated privileges, while systemctl restart stops and starts the named systemd service.', command: 'sudo systemctl restart nginx' },
  { id: 49, category: 'Linux', difficulty: 'INTERMEDIATE', prompt: 'Which command changes the owner of a file to the user alice and group developers?', answers: ['chmod alice:developers app.log', 'chown alice:developers app.log', 'usermod alice:developers app.log', 'own alice developers app.log'], correct: 1, explanation: 'chown changes file ownership. The user and group are separated by a colon.', command: 'chown alice:developers app.log' },
  { id: 50, category: 'Linux', difficulty: 'INTERMEDIATE', prompt: 'Which command creates a compressed archive named backup.tar.gz from the config directory?', answers: ['zip -x backup.tar.gz config', 'tar -czf backup.tar.gz config/', 'gzip -archive backup.tar.gz config/', 'compress -tar backup.tar.gz config/'], correct: 1, explanation: 'tar combines files into an archive, while -c creates it, -z applies gzip compression, and -f supplies the filename.', command: 'tar -czf backup.tar.gz config/' },
  { id: 51, category: 'Linux', difficulty: 'INTERMEDIATE', prompt: 'Which command identifies which process is listening on TCP port 8080?', answers: ['ss -ltnp | grep :8080', 'ip addr show 8080', 'route -p 8080', 'ps -port 8080'], correct: 0, explanation: 'ss lists sockets; -ltnp filters listening TCP sockets, uses numeric output, and includes the owning process when permitted.', command: 'sudo ss -ltnp | grep :8080' },
  { id: 52, category: 'Linux', difficulty: 'INTERMEDIATE', prompt: 'Which command safely changes the current shell session’s PATH variable by adding /opt/tools?', answers: ['PATH+=/opt/tools', 'export PATH="$PATH:/opt/tools"', 'setpath /opt/tools', 'env --append PATH /opt/tools'], correct: 1, explanation: 'export updates PATH for the current shell and commands launched from it. A colon separates entries.', command: 'export PATH="$PATH:/opt/tools"' },
  { id: 53, category: 'Linux', difficulty: 'INTERMEDIATE', prompt: 'Which command finds regular files larger than 100 MB under /var?', answers: ['find /var -type f -size +100M', 'grep /var --size 100M', 'du /var -files +100M', 'ls /var -type regular -gt 100M'], correct: 0, explanation: 'find can filter by object type and size; +100M selects files larger than 100 megabytes.', command: 'find /var -type f -size +100M' },
  { id: 54, category: 'Linux', difficulty: 'INTERMEDIATE', prompt: 'Which command changes the last-modified timestamp of a file, creating it if it does not exist?', answers: ['touch', 'stamp', 'modify', 'date -w'], correct: 0, explanation: 'touch updates access and modification times and creates an empty file when the target does not already exist.', command: 'touch /tmp/healthcheck' },
]

const categories: { label: Category; icon: typeof Terminal }[] = [
  { label: 'All topics', icon: Crosshair },
  { label: 'Active Directory', icon: Network },
  { label: 'Networking', icon: Server },
  { label: 'PowerShell', icon: Terminal },
  { label: 'Security', icon: ShieldCheck },
  { label: 'Windows Server', icon: Server },
  { label: 'Linux', icon: Terminal },
  { label: 'Cloud', icon: Database },
]

const challenges: { label: Challenge; description: string }[] = [
  { label: 'Standard', description: 'All questions in the selected module' },
  { label: 'AD Gauntlet', description: 'Advanced directory services only' },
  { label: 'Command Line', description: 'Questions with commands to practice' },
  { label: 'Hard Mode', description: 'Intermediate and advanced mix' },
]

function getQuestQuestions(category: Category, challenge: Challenge) {
  if (challenge === 'AD Gauntlet') return questions.filter((item) => item.category === 'Active Directory' && item.difficulty !== 'FOUNDATION')
  if (challenge === 'Command Line') return questions.filter((item) => item.command)
  if (challenge === 'Hard Mode') return questions.filter((item) => item.difficulty !== 'FOUNDATION')
  return category === 'All topics' ? questions : questions.filter((item) => item.category === category)
}

function shuffleQuestions(items: Question[]) {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]]
  }
  return shuffled
}

export default function Page() {
  const [category, setCategory] = useState<Category>('All topics')
  const [challenge, setChallenge] = useState<Challenge>('Standard')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState<number[]>([])
  const [mobileMenu, setMobileMenu] = useState(false)
  const [questQuestions, setQuestQuestions] = useState<Question[]>(questions)

  const filtered = useMemo(() => {
    const eligibleIds = new Set(getQuestQuestions(category, challenge).map((item) => item.id))
    return questQuestions.filter((item) => eligibleIds.has(item.id))
  }, [category, challenge, questQuestions])
  const question = filtered[questionIndex % filtered.length]
  const progress = Math.round(((questionIndex + (submitted ? 1 : 0)) / filtered.length) * 100)

  function chooseCategory(next: Category) {
    setCategory(next)
    setChallenge('Standard')
    setQuestQuestions(shuffleQuestions(getQuestQuestions(next, 'Standard')))
    setQuestionIndex(0)
    setSelected(null)
    setSubmitted(false)
    setCompleted([])
    setScore(0)
    setMobileMenu(false)
  }

  function startChallenge(next: Challenge) {
    const nextCategory = next === 'AD Gauntlet' ? 'Active Directory' : 'All topics'
    setChallenge(next)
    setCategory(nextCategory)
    setQuestQuestions(shuffleQuestions(getQuestQuestions(nextCategory, next)))
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
    setQuestQuestions(shuffleQuestions(getQuestQuestions(category, challenge)))
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
          <div className="hidden items-center gap-7 font-mono text-xs uppercase tracking-widest text-[#858891] md:flex"><span className="text-[#e8ad32]">● LIVE SESSION</span><span>QUESTION BANK: {questions.length}</span><span>V2.0.0</span></div>
          <div className="flex items-center gap-2 rounded border border-[#34363c] bg-[#191b20] px-3 py-2 font-mono text-xs"><Zap className="text-[#e8ad32]" /> <span className="text-[#a6a8b0]">STREAK</span> <strong className="text-[#f3f0e9]">07</strong></div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[248px_1fr]">
        <aside className={`${mobileMenu ? 'block' : 'hidden'} border-r border-[#303238] bg-[#101216] p-5 lg:block`}>
          <div className="mb-8"><p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-[#6f727b]">SELECT MODULE</p><nav className="flex flex-col gap-1">{categories.map(({ label, icon: Icon }) => <button key={label} onClick={() => chooseCategory(label)} className={`group flex items-center gap-3 rounded px-3 py-3 text-left font-mono text-xs uppercase tracking-wider transition ${category === label ? 'bg-[#e8ad32] font-bold text-[#15161a]' : 'text-[#9b9da5] hover:bg-[#1b1d22] hover:text-[#f3f0e9]'}`}><Icon className="size-4" />{label}</button>)}</nav></div>
          <div className="border-t border-[#303238] pt-6"><p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-[#6f727b]">CHALLENGE MODE</p><div className="flex flex-col gap-2">{challenges.map((item) => <button key={item.label} onClick={() => startChallenge(item.label)} className={`min-h-11 border px-3 py-2 text-left transition ${challenge === item.label ? 'border-[#e8ad32] bg-[#2b2415]' : 'border-[#34363c] bg-[#181a1f] hover:border-[#6f727b]'}`}><span className={`block font-mono text-[11px] font-bold uppercase tracking-wider ${challenge === item.label ? 'text-[#e8ad32]' : 'text-[#c3c5cb]'}`}>{item.label}</span><span className="mt-1 block text-[10px] leading-snug text-[#777a83]">{item.description}</span></button>)}</div></div>
          <div className="mt-8 border border-[#3b3030] bg-[#1b1719] p-4"><div className="mb-3 flex items-center gap-2 text-[#ed5c8d]"><Gauge className="size-4" /><span className="font-mono text-[10px] uppercase tracking-widest">YOUR SIGNAL</span></div><p className="font-sans text-2xl font-bold">{Math.round((score / Math.max(completed.length, 1)) * 100)}%</p><p className="mt-1 font-mono text-[10px] text-[#8e7780]">ACCURACY THIS RUN</p></div>
        </aside>

        <section className="min-w-0 px-5 py-7 lg:px-12 lg:py-10">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-[#e8ad32]">TRAINING CONSOLE / {challenge === 'Standard' ? category : challenge}</p><h2 className="font-sans text-3xl font-bold tracking-tight sm:text-4xl">Sharpen your edge.</h2><p className="mt-2 max-w-2xl text-sm text-[#92949d]">Practice the commands, protocols, and concepts that keep enterprise networks running.</p></div><button onClick={resetQuiz} className="flex items-center gap-2 self-start border border-[#3b3d44] px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-[#a7a9b0] hover:border-[#e8ad32] hover:text-[#e8ad32]"><RotateCcw className="size-3" /> New quest</button></div>

          <div className="mb-8 grid gap-3 sm:grid-cols-3"><div className="border border-[#303238] bg-[#15171c] p-4"><div className="mb-2 flex justify-between font-mono text-[10px] uppercase tracking-widest text-[#7e818a]"><span>Progress</span><span className="text-[#e8ad32]">{Math.min(progress, 100)}%</span></div><div className="h-1 bg-[#2c2e34]"><div className="h-full bg-[#e8ad32] transition-all" style={{ width: `${Math.min(progress, 100)}%` }} /></div></div><div className="border border-[#303238] bg-[#15171c] p-4"><div className="flex items-center gap-3"><Trophy className="text-[#ed5c8d]" /><div><p className="font-mono text-[10px] uppercase tracking-widest text-[#7e818a]">Score</p><p className="font-sans text-xl font-bold">{score} <span className="text-sm text-[#767982]">/ {completed.length}</span></p></div></div></div><div className="border border-[#303238] bg-[#15171c] p-4"><div className="flex items-center gap-3"><Database className="text-[#7db6c9]" /><div><p className="font-mono text-[10px] uppercase tracking-widest text-[#7e818a]">Queue</p><p className="font-sans text-xl font-bold">{Math.max(filtered.length - completed.length, 0)} <span className="text-sm text-[#767982]">remaining</span></p></div></div></div></div>

          <article className="border border-[#45474e] bg-[#14161b] shadow-[8px_8px_0_#08090b]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#303238] px-5 py-4"><div className="flex items-center gap-3"><span className="border border-[#e8ad32] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[#e8ad32]">Q.{String(question.id).padStart(2, '0')}</span><span className="font-mono text-[10px] uppercase tracking-widest text-[#888b93]">{question.category}</span></div><span className={`font-mono text-[10px] uppercase tracking-widest ${question.difficulty === 'ADVANCED' ? 'text-[#ed5c8d]' : 'text-[#7db6c9]'}`}>{question.difficulty}</span></div>
            <div className="p-5 sm:p-8"><h3 className="max-w-3xl font-sans text-xl font-semibold leading-relaxed sm:text-2xl">{question.prompt}</h3><div className="mt-7 grid gap-3">{question.answers.map((answer, index) => { const isCorrect = submitted && index === question.correct; const isWrong = submitted && selected === index && !isCorrect; return <button key={answer} onClick={() => !submitted && setSelected(index)} className={`flex items-center gap-4 border px-4 py-4 text-left transition ${isCorrect ? 'border-[#89bd72] bg-[#1d2b23] text-[#b6e4a2]' : isWrong ? 'border-[#ed5c8d] bg-[#2b1a22] text-[#ff9fbb]' : selected === index ? 'border-[#e8ad32] bg-[#2b2415] text-[#f3f0e9]' : 'border-[#36383e] bg-[#1a1c21] text-[#b1b3ba] hover:border-[#7d8088] hover:text-[#f3f0e9]'}`} aria-pressed={selected === index}><span className="flex size-7 shrink-0 items-center justify-center border border-current font-mono text-xs">{String.fromCharCode(65 + index)}</span><span className="font-mono text-sm">{answer}</span>{isCorrect && <Check className="ml-auto" />}{isWrong && <X className="ml-auto" />}</button> })}</div>
              {submitted && <div className="mt-6 border-l-2 border-[#e8ad32] bg-[#201e18] p-4"><p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-[#e8ad32]">FIELD NOTE / EXPLANATION</p><p className="text-sm leading-relaxed text-[#c2c0b8]">{question.explanation}</p>{question.command && <code className="mt-3 block overflow-x-auto border border-[#403c2b] bg-[#111216] px-3 py-2 font-mono text-xs text-[#e8ad32]">PS&gt; {question.command}</code>}</div>}
              <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-[#303238] pt-5 sm:flex-row sm:items-center"><button onClick={() => { setQuestionIndex((value) => Math.max(0, value - 1)); setSelected(null); setSubmitted(false) }} disabled={questionIndex === 0} className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#777a83] hover:text-[#f3f0e9] disabled:cursor-not-allowed disabled:opacity-30"><ChevronLeft className="size-4" /> Previous</button>{submitted ? <button onClick={nextQuestion} disabled={questionIndex >= filtered.length - 1} className="flex items-center justify-center gap-2 bg-[#e8ad32] px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[#15161a] hover:bg-[#f2c45c] disabled:cursor-default disabled:bg-[#89bd72]">{questionIndex >= filtered.length - 1 ? `Run complete · ${score}/${filtered.length}` : 'Next question'} {questionIndex < filtered.length - 1 && <ChevronRight className="size-4" />}</button> : <button onClick={submitAnswer} disabled={selected === null} className="flex items-center justify-center gap-2 bg-[#e8ad32] px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[#15161a] hover:bg-[#f2c45c] disabled:cursor-not-allowed disabled:opacity-40">Lock answer <Command className="size-4" /></button>}</div>
            </div>
          </article>
          <div className="mt-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#62656d]"><CircleHelp className="size-3" /> Select an answer, then lock it in to reveal the field note.</div>
        </section>
      </div>
    </main>
  )
}
